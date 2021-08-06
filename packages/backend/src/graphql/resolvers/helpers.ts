// import { PersistTmpFileReq } from '../../../services/StaticAssets/types'
// import { DocumentEdgeByType, DocumentNodeByType } from '../functions/types'
import { GraphEdge } from '@moodlenet/common/lib/content-graph/types/edge'
import { GraphNode } from '@moodlenet/common/lib/content-graph/types/node'
import { AssetRef } from '@moodlenet/common/lib/graphql/scalars.graphql'
import {
  AssetRefInput,
  CreateNodeMutationError,
  CreateNodeMutationErrorType,
  Edge,
  Node,
} from '@moodlenet/common/lib/graphql/types.graphql.gen'
import { UploadType } from '@moodlenet/common/lib/staticAsset/lib'
import { parseEdgeId, parseNodeId } from '@moodlenet/common/lib/utils/content-graph/id-key-type-guards'
import { pick } from '@moodlenet/common/lib/utils/object'
import { DistOmit, Maybe } from '@moodlenet/common/lib/utils/types'
import { Tuple } from 'tuple-type'
import { QMino } from '../../lib/qmino'
import { persistTempAssets } from '../../ports/static-assets/temp'
import { PersistTmpFileReq } from '../../ports/static-assets/types'

export const graphNode2GqlNode = (node: GraphNode): Node => {
  const id = `${node._type}/${node._slug}`
  const base = {
    id,
    name: node.name,
    description: node.description,
    ...({} as Pick<Node, '_rel' | '_relCount'>),
  }
  switch (node._type) {
    case 'Profile':
      return {
        __typename: 'Profile',
        ...base,
        ...pick(node, ['bio', 'firstName', 'lastName', 'location', 'image', 'avatar', 'siteUrl']),
      }
    case 'Collection':
      return {
        __typename: 'Collection',
        ...base,
        ...pick(node, ['image', 'name']),
      }
    case 'IscedField':
      return {
        __typename: 'IscedField',
        ...base,
        ...pick(node, ['codePath', 'code']),
      }
    case 'IscedGrade':
      return {
        __typename: 'IscedGrade',
        ...base,
        ...pick(node, ['codePath', 'code']),
      }
    case 'Organization':
      return {
        __typename: 'Organization',
        ...base,
        ...pick(node, ['color', 'domain', 'logo', 'intro']),
      }
    case 'Resource':
      return {
        __typename: 'Resource',
        ...base,
        ...pick(node, ['content', 'thumbnail', 'kind', 'description']),
      }
    default:
      throw new Error(`graphNode2GqlNode: can't map unknown node type '${(node as any)?._type}'`)
  }
}
export const gqlNode2GraphNode = (node: Node): Omit<GraphNode, '_permId' | '_status'> => {
  const parsed = parseNodeId(node.id)
  if (!parsed) {
    throw new Error(`gqlNode2GraphNode: can't parse id '${node.id}'`)
  }
  const [, _slug] = parsed
  const base = {
    _slug,
    name: node.name,
    description: node.description,
  }

  switch (node.__typename) {
    case 'Profile':
      return {
        _type: 'Profile',
        ...base,
        ...pick(node, ['bio', 'firstName', 'lastName', 'location', 'image', 'avatar', 'siteUrl', 'description']),
      }
    case 'Collection':
      return {
        _type: 'Collection',
        ...base,
        ...pick(node, ['image', 'name']),
      }
    case 'IscedField':
      return {
        _type: 'IscedField',
        ...base,
        ...pick(node, ['codePath', 'image', 'code', 'thumbnail']),
      }
    case 'IscedGrade':
      return {
        _type: 'IscedGrade',
        ...base,
        ...pick(node, ['codePath', 'image', 'code', 'thumbnail']),
      }
    case 'Organization':
      return {
        _type: 'Organization',
        ...base,
        ...pick(node, ['color', 'domain', 'logo', 'intro', 'description']),
      }
    case 'Resource':
      return {
        _type: 'Resource',
        ...base,
        ...pick(node, ['content', 'kind', 'thumbnail']),
      }
    default:
      throw new Error(`graphNode2GqlNode: can't map unknown node type '${(node as any)?._type}'`)
  }
}

export const graphEdge2GqlEdge = (edge: GraphEdge): Edge => {
  const id = `${edge._type}/${edge.id}`
  const base = { id, _created: edge._created }
  switch (edge._type) {
    case 'Created':
      return {
        __typename: 'Created',
        ...base,
      }
    case 'Features':
      return {
        __typename: 'Features',
        ...base,
      }
    case 'Follows':
      return {
        __typename: 'Follows',
        ...base,
      }
    case 'Pinned':
      return {
        __typename: 'Pinned',
        ...base,
      }
    default:
      throw new Error(`graphEdge2GqlEdge: can't map unknown edge type '${(edge as any)?._type}''`)
  }
}
export const gqlEdge2GraphEdge = (edge: Edge): DistOmit<GraphEdge, '_authId'> => {
  const parsed = parseEdgeId(edge.id)
  if (!parsed) {
    throw new Error(`gqlEdge2GraphEdge: can't parse id '${edge.id}'`)
  }
  const [, id] = parsed
  const base = { id, _created: edge._created }
  switch (edge.__typename) {
    case 'Created':
      return {
        _type: 'Created',
        ...base,
      }
    case 'Features':
      return {
        _type: 'Features',
        ...base,
      }
    case 'Follows':
      return {
        _type: 'Follows',
        ...base,
      }
    case 'Pinned':
      return {
        _type: 'Pinned',
        ...base,
      }
    default:
      throw new Error(`graphEdge2GqlEdge: can't map unknown edge type '${(edge as any)?._type}''`)
  }
}

type AssetRefInputAndType = { input: AssetRefInput; uploadType: UploadType }
export const mapAssetRefInputsToAssetRefs = async <N extends number>(
  tupleOfAssetRefInputAndType: Tuple<AssetRefInputAndType | undefined | null, N>,
  qmino: QMino,
): Promise<Tuple<Maybe<AssetRef>, N> | null> => {
  type PersistTmpFileReqOrAssetRef = PersistTmpFileReq | AssetRef

  const arrayOfMaybePersistTempFilesReqOrAssetRef = tupleOfAssetRefInputAndType.map<Maybe<PersistTmpFileReqOrAssetRef>>(
    assRefInpAndType => {
      if (!assRefInpAndType) {
        return assRefInpAndType
      }
      const { input, uploadType } = assRefInpAndType
      switch (input.type) {
        case 'TmpUpload':
          return { tempAssetId: input.location, uploadType }
        case 'ExternalUrl':
          return { ext: true, location: input.location, mimetype: 'text/html' } // TODO: define mimetype for links
        case 'NoAsset':
          return null
        case 'NoChange':
          return undefined
        default:
          throw new Error(`mapAssetRefInputsToAssetRefs: unknown input type: '${input.type}'`)
      }
    },
  )

  const _isPersistReq = (_: Maybe<PersistTmpFileReqOrAssetRef>): _ is PersistTmpFileReq => !!_ && 'uploadType' in _

  const toPersistReqsTuple = arrayOfMaybePersistTempFilesReqOrAssetRef.filter(_isPersistReq)

  const assetFileDescArray = await qmino.callSync(persistTempAssets({ persistTmpFilesReqs: toPersistReqsTuple }), {
    timeout: 5000,
  })

  if (!assetFileDescArray) {
    return null
  }

  const tupleOfMaybeAssetRef = arrayOfMaybePersistTempFilesReqOrAssetRef.map<Maybe<AssetRef>>(
    maybePersistTmpFileReqOrAssetRef => {
      if (!_isPersistReq(maybePersistTmpFileReqOrAssetRef)) {
        return maybePersistTmpFileReqOrAssetRef
      }
      const reqIndex = toPersistReqsTuple.indexOf(maybePersistTmpFileReqOrAssetRef)
      const { assetId, tempAssetDesc } = assetFileDescArray[reqIndex]!
      const assetRef: AssetRef = {
        ext: false,
        location: assetId,
        mimetype: tempAssetDesc.mimetype,
      }
      return assetRef
    },
  )

  return tupleOfMaybeAssetRef as Tuple<Maybe<AssetRef>, N>
}

export const getAssetRefInputAndType = (
  assetRefInput: AssetRefInput | undefined | null,
  uploadType: UploadType,
): AssetRefInputAndType | undefined | null => assetRefInput && { input: assetRefInput, uploadType }

export const createNodeMutationError = (
  type: CreateNodeMutationErrorType,
  details: string | null = null,
): CreateNodeMutationError => ({
  __typename: 'CreateNodeMutationError',
  type,
  details,
})
