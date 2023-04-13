import debounce from 'lodash/debounce.js'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ResourceActions, ResourceFormProps, ResourceProps, SaveState } from '../common.mjs'

import { MainContext } from './MainContext.js'

export type Actions = {
  editResource: (res: ResourceFormProps) => Promise<ResourceFormProps>
  getResource: () => Promise<ResourceProps>
  deleteResource: () => Promise<ResourceProps>
  toggleBookmark: () => Promise<ResourceProps>
  toggleLike: () => Promise<ResourceProps>
  setIsPublished: (approve: boolean) => Promise<ResourceProps>
}

export type ResourceCommonProps = {
  actions: ResourceActions
  props: ResourceProps
}
// type SaveState = { form: boolean; image: boolean; content: boolean }

type myProps = { resourceKey: string }
export const useResourceBaseProps = ({ resourceKey }: myProps) => {
  const { rpcCaller } = useContext(MainContext)
  const [resource, setResource] = useState<ResourceProps | null>()
  const [saved, setSaved] = useState({ form: false, image: false, content: false })

  useEffect(() => {
    rpcCaller.get(resourceKey).then(res => setResource(res))
  }, [resourceKey, rpcCaller])

  const setterSave = useCallback(
    (key: keyof SaveState, val: boolean) =>
      setSaved(currentSaved => ({ ...currentSaved, [key]: val })),
    [],
  )
  const actions = useMemo<ResourceActions>(() => {
    // const setterSave = (key: keyof SaveState, val: boolean) => setSaved({ ...saved, [key]: val })
    const { edit: editRpc, setImage: _setImage, setIsPublished, setContent, _delete } = rpcCaller

    const edit = debounce((res: ResourceFormProps) => {
      setterSave('form', true)
      editRpc(resourceKey, res).then(() => {
        setterSave('form', false)
      })
    }, 1000)

    const updateResource = <T,>(key: string, val: T): T => (
      resource && setResource({ ...resource, [key]: val }), val
    )
    const updateData =
      <T,>(key: string) =>
      (val: T): T => (
        !resource ? '' : updateResource('data', { ...resource.data, [key]: val }), val
      )

    const updateImageUrl = (imageUrl: string) => {
      updateData<string>('imageUrl')(imageUrl)
    }
    const resourceActions: ResourceActions = {
      async editData(res: ResourceFormProps) {
        setterSave('form', true)
        edit(res) // .then(form => updateResource('form', 'resourceForm', form)),
        setterSave('form', false)
      },
      async setImage(file: File) {
        setterSave('image', true)
        const imageUrl = await _setImage(resourceKey, file)
        updateImageUrl(imageUrl)
        setterSave('image', false)

        return imageUrl
      },
      setContent(content: File | string) {
        setContent(resourceKey, content).then(updateData('contentUrl'))
      },
      publish: () => setIsPublished(resourceKey, true),
      unpublish: () => setIsPublished(resourceKey, false),
      deleteResource: () => _delete(resourceKey),
    }
    return resourceActions
  }, [resource, resourceKey, rpcCaller, setterSave])

  useEffect(() => {
    console.log('xxxxx', { saved: JSON.stringify(saved) })
  }, [saved])

  return useMemo<ResourceCommonProps | null>(
    () => (!resource ? null : { actions, props: resource }),
    [actions, resource],
  )
}
