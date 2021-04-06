import { contentNodeLink, webappPath } from '@moodlenet/common/lib/webapp/sitemap'
import { Home, Login } from '@moodlenet/common/lib/webapp/sitemap/routes'
import { useMemo, useReducer } from 'react'
import { useHistory } from 'react-router'
import { useGlobalSearch } from '../../contexts/Global/GlobalSearch'
import { useSession } from '../../contexts/Global/Session'
import { useFormikWithBag } from '../../helpers/forms'
import { PageHeaderProps } from '../../ui/components/PageHeader'
import { AddCollectionFormData, AddCollectionFormProps } from '../../ui/forms/collection/AddCollectionForm'
import { AddResourceFormData, AddResourceFormProps } from '../../ui/forms/resource/AddResourceForm'
import { useMutateNode } from '../content/mutateNode'

const homeLink = webappPath<Home>('/', {})
const loginLink = webappPath<Login>('/login', {})

export const usePageHeaderProps = (): PageHeaderProps => {
  const { logout, session } = useSession()
  const hist = useHistory()

  const mutateNode = useMutateNode()
  // const mutateEdge = useMutateEdge()
  const { searchText, setSearchText } = useGlobalSearch()
  //add collection
  const [showAddCollection, toggleShowAddCollection] = useReducer(_ => !_, false)
  const [, /* _addCollectionFormik */ addCollectionFormBag] = useFormikWithBag<AddCollectionFormData>({
    initialValues: { name: '', summary: '' },
    onSubmit: ({ name, summary }) =>
      mutateNode.createNode({ nodeType: 'Collection', data: { name, summary } }).then(res => {
        res.data?.createNode.__typename === 'CreateNodeMutationSuccess'
          ? hist.push(contentNodeLink(res.data.createNode.node))
          : alert(res.data?.createNode.type)
      }),
  })

  // const nodeContext = useContentNodeContext()
  const addCollectionFormProps = useMemo<AddCollectionFormProps>(
    () => ({
      form: addCollectionFormBag,
    }),
    [addCollectionFormBag],
  )
  //add resource
  const [showAddResource, toggleShowAddResource] = useReducer(_ => !_, false)
  const [, /* _addResourceFormik */ addResourceFormBag] = useFormikWithBag<AddResourceFormData>({
    initialValues: { name: '', summary: '' },
    onSubmit: async ({ name, summary }) => {
      const res = await mutateNode.createNode({ nodeType: 'Resource', data: { name, summary } })

      if (!res.data || res.data.createNode.__typename === 'CreateNodeMutationError') {
        return //FIXME: Manage Error
      }
      const newResourceNode = res.data.createNode.node

      // if (
      //   nodeContext &&
      //   nodeContext.type === 'Collection' &&
      //   //FIXME: && nodeContext is mine
      //   newResourceNode.__typename === 'Resource' &&
      //   // eslint-disable-next-line no-restricted-globals
      //   confirm('add to this collection?')
      // ) {
      //   const addToCollectionRes = await mutateEdge.createEdge({
      //     data: {},
      //     edgeType: 'Contains',
      //     from: nodeContext._id,
      //     to: newResourceNode._id,
      //   })

      //   if (addToCollectionRes.data?.createEdge.__typename === 'CreateEdgeMutationError') {
      //     alert(`couldn't add to this collection`)
      //   }
      // }
      hist.push(contentNodeLink(newResourceNode))
    },
  })

  const addResourceFormProps = useMemo<AddResourceFormProps>(
    () => ({
      form: addResourceFormBag,
    }),
    [addResourceFormBag],
  )
  return useMemo(
    () => ({
      homeLink,
      loginLink,
      search: setSearchText,
      searchValue: searchText,
      me: session
        ? {
            logout,
            username: session.username,
            toggleShowAddCollection,
            showAddCollection,
            addCollectionFormProps,
            toggleShowAddResource,
            showAddResource,
            addResourceFormProps,
          }
        : null,
    }),
    [
      addCollectionFormProps,
      addResourceFormProps,
      logout,
      searchText,
      session,
      setSearchText,
      showAddCollection,
      showAddResource,
    ],
  )
}
