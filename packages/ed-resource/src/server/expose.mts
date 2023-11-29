import type { PkgExposeDef, RpcFile } from '@moodlenet/core'
import {
  assertRpcFileReadable,
  readableRpcFile,
  RpcStatus,
  setRpcStatusCode,
} from '@moodlenet/core'
import { getWebappUrl } from '@moodlenet/react-app/server'
import {
  creatorUserInfoAqlProvider,
  getCurrentSystemUser,
  isCurrentUserCreatorOfCurrentEntity,
} from '@moodlenet/system-entities/server'
import { waitFor } from 'xstate/lib/waitFor.js'
import { shell } from './shell.mjs'
// import { ResourceDataResponce, ResourceFormValues } from '../common.mjs'
import type {
  Event,
  Event_ProvideResourceEdits_Data,
  StateName,
} from '@moodlenet/core-domain/resource'
import { DEFAULT_CONTEXT, matchState, nameMatcher } from '@moodlenet/core-domain/resource'
import { getSubjectHomePageRoutePath } from '@moodlenet/ed-meta/common'
import { href } from '@moodlenet/react-app/common'
import { boolean, object } from 'yup'
import type { ResourceExposeType } from '../common/expose-def.mjs'
import type { EditResourceRespRpc, ResourceRpc } from '../common/types.mjs'
import { getResourceHomePageRoutePath } from '../common/webapp-routes.mjs'
import { canPublish } from './aql.mjs'
import { getImageAssetInfo } from './lib.mjs'
import {
  getResource,
  getResourceFile,
  getResourceFileUrl,
  getResourcesCountInSubject,
  getValidations,
  incrementResourceDownloads,
  RESOURCE_DOWNLOAD_ENDPOINT,
  searchResources,
  validationsConfigs,
} from './services.mjs'
import { stdEdResourceMachine } from './xsm/machines.mjs'
import * as map from './xsm/mappings/rpc.mjs'

export type FullResourceExposeType = PkgExposeDef<ResourceExposeType & ServerResourceExposeType>

export const expose = await shell.expose<FullResourceExposeType>({
  rpc: {
    'webapp/get-configs': {
      guard: () => void 0,
      async fn() {
        const { config } = await getValidations()
        return { validations: config }
      },
    },
    'webapp/set-is-published/:_key': {
      guard: _ =>
        object({
          publish: boolean().required(),
        }).isValid(_),
      fn: async ({ publish }, { _key }) => {
        const resourceRecord = await getResource(_key)
        if (!resourceRecord) {
          return { done: false }
        }
        const [interpreter] = await stdEdResourceMachine({ by: 'data', data: resourceRecord })
        let snap = interpreter.getSnapshot()
        const { event, awaitNextState } = ((): { event: Event; awaitNextState: StateName } =>
          publish
            ? { awaitNextState: 'Published', event: { type: 'request-publish' } }
            : { awaitNextState: 'Unpublished', event: { type: 'unpublish' } })()
        if (!snap.can(event)) {
          interpreter.stop()
          return { done: false }
        }
        interpreter.send(event)

        await waitFor(interpreter, nameMatcher(awaitNextState))
        snap = interpreter.getSnapshot()
        interpreter.stop()
        return { done: true }
      },
    },
    'webapp/:action(cancel|start)/meta-autofill/:_key': {
      guard: () => void 0,
      fn: async (_, { _key, action }) => {
        const resourceRecord = await getResource(_key, {
          project: {
            isCreator: isCurrentUserCreatorOfCurrentEntity(),
          },
        })
        if (!resourceRecord) {
          return { done: false }
        }
        const [interpreter] = await stdEdResourceMachine({
          by: 'data',
          data: resourceRecord,
        })
        const ev = action === 'cancel' ? `cancel-meta-generation` : `request-meta-generation`
        const done = interpreter.getSnapshot().can(ev)
        interpreter.send(ev)
        interpreter.stop()
        return { done }
      },
    },

    'webapp/get/:_key': {
      guard: () => void 0,
      fn: async (_, { _key }) => {
        const resourceRecord = await getResource(_key, {
          projectAccess: ['u', 'd'],
          project: {
            canPublish: canPublish(),
            isCreator: isCurrentUserCreatorOfCurrentEntity(),
            contributor: creatorUserInfoAqlProvider(),
          },
        })
        if (!resourceRecord) {
          return null
        }
        const [interpreter] = await stdEdResourceMachine({
          by: 'data',
          data: resourceRecord,
        })
        const snap = interpreter.getSnapshot()
        interpreter.stop()
        if (matchState(snap, 'No-Access') || !resourceRecord) {
          return null
        }

        const image = getImageAssetInfo(snap.context.doc.image?.ref)

        const contentUrl =
          snap.context.doc.content.kind === 'file'
            ? await getResourceFileUrl({
                _key,
                rpcFile: snap.context.doc.content.ref.fsItem.rpcFile,
              })
            : snap.context.doc.content.ref.url

        const resourceRpc: ResourceRpc = {
          contributor: {
            avatarUrl: resourceRecord.contributor.iconUrl,
            creatorProfileHref: {
              url: resourceRecord.contributor.homepagePath,
              ext: false,
            },
            displayName: resourceRecord.contributor.name,
            timeSinceCreation: resourceRecord.meta.created,
          },
          resourceForm: {
            description: resourceRecord.entity.description,
            title: resourceRecord.entity.title,
            license: resourceRecord.entity.license,
            subject: resourceRecord.entity.subject,
            language: resourceRecord.entity.language,
            level: resourceRecord.entity.level,
            month: resourceRecord.entity.month,
            year: resourceRecord.entity.year,
            type: resourceRecord.entity.type,
            learningOutcomes: resourceRecord.entity.learningOutcomes,
          },
          data: {
            contentType: resourceRecord.entity.content.kind,
            contentUrl,
            downloadFilename:
              resourceRecord.entity.content?.kind === 'file'
                ? resourceRecord.entity.content.fsItem.rpcFile.name
                : null,
            id: resourceRecord.entity._key,
            mnUrl: getWebappUrl(
              getResourceHomePageRoutePath({ _key, title: resourceRecord.entity.title }),
            ),
            image,
            subjectHref: resourceRecord.entity.subject
              ? href(
                  getSubjectHomePageRoutePath({
                    _key: resourceRecord.entity.subject,
                    title: resourceRecord.entity.subject,
                  }),
                )
              : null,
          },
          state: {
            isPublished: resourceRecord.entity.published,
            autofillState: matchState(snap, 'Autogenerating-Meta') ? 'ai-generation' : undefined,
            autofillSuggestions: {
              meta: snap.context.generatedData?.meta
                ? map.meta_2_form({
                    ...snap.context.doc.meta,
                    ...snap.context.generatedData.meta,
                  })
                : null,
              // image: snap.context.generatedData?.image
              //   ? await map.image_2_assetInfo(snap.context.generatedData.image,_key)
              //   : null,
            },
          },
          access: {
            canDelete: !!resourceRecord.access.d,
            canEdit: !!resourceRecord.access.u,
            canPublish: resourceRecord.canPublish,
            isCreator: resourceRecord.isCreator,
          },
        }

        return resourceRpc
      },
    },
    'webapp/edit/:_key': {
      guard: async () => {
        // const { draftResourceValidationSchema } = await getValidations()
        // body.form = await draftResourceValidationSchema.validate(body?.form?.meta, {
        //   stripUnknown: true,
        // })
      },
      fn: async ({ form }, { _key }) => {
        // const resourceRecord = await getResource(_key)
        // const { interpreter } = await xsm.interpreterAndMachine(resourceRecord)
        if (!(form.meta || form.image)) {
          // const editResourceRespRpc: EditResourceRespRpc = {
          //   meta: map.meta_2_form(snap.context.doc.meta),
          //   image: getImageAssetInfo(snap.context.doc.image?.ref ?? null),
          // }
          // return editResourceRespRpc
          return null
        }
        const [interpreter] = await stdEdResourceMachine({
          by: 'key',
          key: _key,
        })
        let snap = interpreter.getSnapshot()
        const resourceMeta = form.meta
          ? map.resourceMetaForm_2_meta(form.meta)
          : snap.context.doc.meta

        const resourceEdits: Event_ProvideResourceEdits_Data = {
          edits: {
            meta: resourceMeta,
            image:
              form.image?.kind === 'file'
                ? {
                    kind: 'file',
                    size: form.image.file[0].size,
                    rpcFile: form.image.file[0],
                  }
                : form.image?.kind === 'no-change'
                ? {
                    kind: 'no-change',
                  }
                : form.image?.kind === 'remove'
                ? {
                    kind: 'remove',
                  }
                : { kind: 'no-change' },
          },
        }

        const provideEditsEvent: Event = { type: 'provide-resource-edits', ...resourceEdits }
        if (!snap.can(provideEditsEvent)) {
          // console.log('cannot provide edits', provideEditsEvent, snap.value, snap.context)
          interpreter.stop()
          return null
        }
        interpreter.send(provideEditsEvent)
        const storeEvent: Event = { type: 'store-edits', ...resourceEdits }
        interpreter.send(storeEvent)

        await waitFor(interpreter, nameMatcher('Unpublished'))
        snap = interpreter.getSnapshot()

        const editResourceRespRpc: EditResourceRespRpc = {
          meta: map.meta_2_form(snap.context.doc.meta),
          image: getImageAssetInfo(snap.context.doc.image?.ref ?? null),
        }
        interpreter.stop()
        return editResourceRespRpc
      },
      bodyWithFiles: {
        fields: {
          '.form.image.file': 1,
        },
        maxSize: validationsConfigs.imageMaxUploadSize,
      },
    },
    'basic/v1/create': {
      guard: async body => {
        const { draftResourceValidationSchema, draftContentValidationSchema } =
          await getValidations()
        await draftContentValidationSchema.validate({ content: body?.resource })
        await draftResourceValidationSchema.validate(body, {
          stripUnknown: true,
        })
      },
      fn: async ({ name, description, resource }) => {
        const resourceContent = [resource].flat()[0]
        if (!resourceContent) {
          throw RpcStatus('Bad Request')
        }
        const [interpreter] = await stdEdResourceMachine({ by: 'create' })
        let snap = interpreter.getSnapshot()
        const provideNewResourceEvent: Event = {
          type: 'provide-new-resource',
          meta: {
            ...DEFAULT_CONTEXT.doc.meta,
            title: name,
            description,
          },
          content:
            'string' === typeof resourceContent
              ? { kind: 'link', url: resourceContent }
              : { kind: 'file', rpcFile: resourceContent, size: resourceContent.size },
        }
        interpreter.send(provideNewResourceEvent)

        snap = interpreter.getSnapshot()

        if (matchState(snap, 'No-Access')) {
          interpreter.stop()
          if (snap.context.noAccess?.reason === 'unauthorized') {
            throw RpcStatus('Unauthorized')
          }
          if (snap.context.contentRejected) {
            throw RpcStatus('Bad Request', snap.context.contentRejected.reason)
          }
          if (snap.context.resourceEdits?.errors) {
            throw RpcStatus('Bad Request', snap.context.resourceEdits.errors)
          }
          throw RpcStatus('Unauthorized', 'unknown')
        }

        interpreter.send('store-new-resource')

        await waitFor(interpreter, nameMatcher(['Unpublished', 'Autogenerating-Meta']))
        snap = interpreter.getSnapshot()

        const newDoc = snap.context.doc
        const contentUrl =
          newDoc.content.kind === 'file'
            ? await getResourceFileUrl({
                _key: newDoc.id.resourceKey,
                rpcFile: newDoc.content.ref.fsItem.rpcFile,
              })
            : newDoc.content.url

        setRpcStatusCode('Created')
        interpreter.stop()
        return {
          _key: newDoc.id.resourceKey,
          name: newDoc.meta.title,
          description: newDoc.meta.description,
          homepage: getWebappUrl(
            getResourceHomePageRoutePath({ _key: newDoc.id.resourceKey, title: newDoc.meta.title }),
          ),
          url: contentUrl,
        }
      },
      bodyWithFiles: {
        fields: {
          '.resource': 1,
        },
        maxSize: validationsConfigs.contentMaxUploadSize,
      },
    },

    'webapp/trash/:_key': {
      guard: () => void 0,
      fn: async (_, { _key }) => {
        const [interpreter] = await stdEdResourceMachine({ by: 'key', key: _key })
        interpreter.send('trash')
        await waitFor(interpreter, nameMatcher('Destroyed'))
        interpreter.stop()
        return
      },
    },
    'webapp/create': {
      guard: async body => {
        const { draftContentValidationSchema } = await getValidations()
        const validatedContentOrNullish = await draftContentValidationSchema.validate(
          { content: body?.content?.[0] },
          { stripUnknown: true },
        )
        body.content = [validatedContentOrNullish]
      },
      async fn({ content: [resourceContent] }) {
        if (!resourceContent) {
          throw RpcStatus('Bad Request')
        }

        const [interpreter] = await stdEdResourceMachine({ by: 'create' })
        let snap = interpreter.getSnapshot()

        const provideNewResourceEvent: Event = {
          type: 'provide-new-resource',
          content:
            'string' === typeof resourceContent
              ? { kind: 'link', url: resourceContent }
              : { kind: 'file', rpcFile: resourceContent, size: resourceContent.size },
        }
        interpreter.send(provideNewResourceEvent)
        if (matchState(snap, 'No-Access')) {
          interpreter.stop()
          return null
        }
        interpreter.send('store-new-resource')

        await waitFor(interpreter, nameMatcher(['Unpublished', 'Autogenerating-Meta']))
        snap = interpreter.getSnapshot()

        interpreter.stop()
        return { resourceKey: snap.context.doc.id.resourceKey }
      },
      bodyWithFiles: {
        fields: {
          '.content': 1,
        },
        maxSize: validationsConfigs.contentMaxUploadSize,
      },
    },
    'webapp/get-resources-count-in-subject/:subjectKey': {
      guard: () => void 0,
      async fn(_, { subjectKey }) {
        const count = await getResourcesCountInSubject({ subjectKey })
        return count ?? { count: 0 }
      },
    },
    [RESOURCE_DOWNLOAD_ENDPOINT]: {
      guard: () => void 0,
      async fn(_, { _key }: { _key: string }) {
        const fsItem = await getResourceFile(_key)
        if (!fsItem) {
          throw RpcStatus('Not Found')
        }
        const readable = await assertRpcFileReadable(fsItem.rpcFile)

        readable.on('end', async () => {
          const currentSysUser = await getCurrentSystemUser()
          shell.events.emit('resource:downloaded', { resourceKey: _key, currentSysUser })
          incrementResourceDownloads({ _key })
        })
        return readableRpcFile({ ...fsItem.rpcFile }, () => readable)
      },
    },
    'webapp/search': {
      guard: () => void 0,
      async fn(
        _,
        __,
        {
          sortType,
          filterSubjects,
          filterLanguages,
          filterLevels,
          filterTypes,
          filterLicenses,
          limit,
          text,
          after,
        },
      ) {
        const { endCursor, list } = await searchResources({
          limit,
          sortType,
          text,
          after,
          filters: [
            ['subject', filterSubjects ? filterSubjects.split('|') : []],
            ['language', filterLanguages ? filterLanguages.split('|') : []],
            ['level', filterLevels ? filterLevels.split('|') : []],
            ['type', filterTypes ? filterTypes.split('|') : []],
            ['license', filterLicenses ? filterLicenses.split('|') : []],
          ],
        })
        return {
          list: list.map(({ entity: { _key } }) => ({ _key })),
          endCursor,
        }
      },
    },
  },
})

type ServerResourceExposeType = {
  rpc: {
    [RESOURCE_DOWNLOAD_ENDPOINT](
      body: null,
      params: { _key: string; filename: string },
    ): Promise<RpcFile>
    'basic/v1/create'(body: {
      name: string
      description: string
      resource: string | [RpcFile]
    }): Promise<{
      _key: string
      name: string
      description: string
      url: string
      homepage: string
    }>
  }
}
