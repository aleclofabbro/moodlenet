import { IDScalarType } from '@moodlenet/common/lib/graphql/scalars.graphql'
import * as GQLTypes from '@moodlenet/common/lib/graphql/types.graphql.gen'
import {
  GlobalSearchNodeType,
  globalSearchNodeType,
  isGlobalSearchNodeType,
} from '@moodlenet/common/lib/utils/content-graph/id-key-type-guards'
import { SignOptions } from 'jsonwebtoken'
import { JwtPrivateKey } from '../../lib/auth/jwt'
import { QMino } from '../../lib/qmino'
import * as nodePorts from '../../ports/content-graph/node'
import * as searchPorts from '../../ports/content-graph/search'
import * as traversePorts from '../../ports/content-graph/traverseNodeRel'
import * as userPorts from '../../ports/user-auth/user'
import * as GQLResolvers from '../types.graphql.gen'
import { graphEdge2GqlEdge, graphNode2GqlNode, parseNodeId } from './helpers'

export const getGQLResolvers = ({
  // jwtPrivateKey,
  // jwtSignOptions,
  qmino,
}: {
  jwtSignOptions: SignOptions
  jwtPrivateKey: JwtPrivateKey
  qmino: QMino
}): GQLResolvers.Resolvers => {
  return {
    //@ ts-expect-error : Scalar ID is not present in Resolvers
    //@ts-ignore: Scalar ID is not present in Resolvers
    ID: IDScalarType,
    Query: {
      async node(_root, { id }, ctx /*,_info */) {
        console.log({ id })
        const parsed = parseNodeId(id)
        if (!parsed) {
          return null
        }
        const [type, slug] = parsed
        const maybeNode = await qmino.query(nodePorts.getBySlug({ type, slug, env: ctx.authSessionEnv }), {
          timeout: 5000,
        })
        return maybeNode ? graphNode2GqlNode(maybeNode) : null
      },

      async globalSearch(_root, { sortBy, text, nodeTypes: _nodeTypes, page }, ctx) {
        const nodeTypes = (_nodeTypes || globalSearchNodeType).filter(isGlobalSearchNodeType)
        const searchInput: searchPorts.GlobalSearchInput<GlobalSearchNodeType> = {
          env: ctx.authSessionEnv,
          nodeTypes,
          page: {
            after: page?.after,
            before: page?.before,
            first: page?.first ?? 20,
            last: page?.last ?? 20,
          },
          sortBy,
          text,
        }
        const { items, pageInfo } = await qmino.query(searchPorts.byTerm(searchInput), { timeout: 5000 })

        return {
          __typename: 'SearchPage',
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: pageInfo.hasNextPage,
            hasPreviousPage: pageInfo.hasPreviousPage,
            endCursor: pageInfo.endCursor,
            startCursor: pageInfo.startCursor,
          },
          edges: items.map(([cursor, item]) => {
            const edge: GQLTypes.SearchPageEdge = {
              __typename: 'SearchPageEdge',
              cursor,
              node: graphNode2GqlNode(item),
            }
            return edge
          }),
        }
      },

      async getSession(_root, _no_args, ctx) {
        if (!ctx.authSessionEnv) {
          return null
        }
        const activeUser = await qmino.query(
          userPorts.getActiveByEmail({ email: ctx.authSessionEnv.user.email, matchHashedPassword: false }),
          { timeout: 5000 },
        )
        if (!activeUser) {
          return null
        }
        return {
          __typename: 'UserSession',
          userId: activeUser.id,
        }
      },
    },
    Profile: {
      async _rel(node, { target, type, inverse, page }, ctx) {
        const parsed = parseNodeId(node.id)
        if (!parsed) {
          throw `FIXME _rel`
        }
        const [fromType, fromSlug] = parsed

        const { items, pageInfo } = await qmino.query(
          traversePorts.fromNode({
            env: ctx.authSessionEnv,
            edgeType: type,
            fromNode: { _slug: fromSlug, _type: fromType },
            inverse: !!inverse,
            page: {
              after: page?.after,
              before: page?.before,
              first: page?.first ?? 20,
              last: page?.last ?? 20,
            },
            targetNodeType: target,
          }),
          { timeout: 5000 },
        )

        return {
          __typename: 'RelPage',
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: pageInfo.hasNextPage,
            hasPreviousPage: pageInfo.hasPreviousPage,
            endCursor: pageInfo.endCursor,
            startCursor: pageInfo.startCursor,
          },
          edges: items.map(([cursor, { edge, node }]) => {
            const gqlEdge: GQLTypes.RelPageEdge = {
              __typename: 'RelPageEdge',
              cursor,
              edge: graphEdge2GqlEdge(edge),
              node: graphNode2GqlNode(node),
            }
            return gqlEdge
          }),
        }
      },
      async _relCount(node, { target, type, inverse }, ctx) {
        const parsed = parseNodeId(node.id)
        if (!parsed) {
          throw `FIXME _rel`
        }
        const [fromType, fromSlug] = parsed

        return await qmino.query(
          traversePorts.count({
            edgeType: type,
            fromNode: { slug: fromSlug, type: fromType },
            env: ctx.authSessionEnv,
            inverse: !!inverse,
            targetNodeType: target,
          }),
          { timeout: 5000 },
        )
      },
    },
    Mutation: {
      // async createSession(_root, { password, username } /* , ctx */) {
      //   const activeUser = await qmino.query(userPorts.getActiveByEmail({ username, matchHashedPassword: password }), {
      //     timeout: 5000,
      //   })
      //   if (!activeUser) {
      //     return {
      //       __typename: 'CreateSession',
      //       message: 'not found',
      //     }
      //   }
      //   const jwt = signJwtActiveUser({ jwtPrivateKey, jwtSignOptions, user: activeUser })
      //   return {
      //     __typename: 'CreateSession',
      //     jwt,
      //   }
      // },
      // async signUp(_root, { email } /* ,env */) {
      //   const res = await qmino.callSync(newUserPorts.signUp({ email }), { timeout: 5000 })
      //   if (typeof res === 'string') {
      //     return { __typename: 'SimpleResponse', success: false, message: res }
      //   }
      //   return { __typename: 'SimpleResponse', success: true }
      // },
      // async activateUser(_root, { password, token, username } /*, ctx */) {
      //   const activationresult = await qmino.callSync(newUserPorts.confirmSignup({ password, token, username }), {
      //     timeout: 5000,
      //   })
      //   if ('string' === typeof activationresult) {
      //     return {
      //       __typename: 'CreateSession',
      //       jwt: null,
      //       message: activationresult,
      //     }
      //   }
      //   const jwt = signJwtActiveUser({ user: activationresult, jwtPrivateKey, jwtSignOptions })
      //   return {
      //     __typename: 'CreateSession',
      //     jwt,
      //   }
      // },
      // async createNode(_root, { input }, ctx, _info) {
      //   const { nodeType } = input
      //   // if (env.type === 'anon') {
      //   //   return createNodeMutationError('NotAuthorized')
      //   // }
      //   const nodeInput = validateCreateNodeInput(input)
      //   if (nodeInput instanceof Error) {
      //     return createNodeMutationError('UnexpectedInput', nodeInput.message)
      //   }
      //   const data = await bakeNodeDoumentData(nodeInput, nodeType, qmino)
      //   if ('__typename' in data) {
      //     return data
      //   }
      //   // const data = { name, summary, ...assetRefMap }
      //   const shallowNodeOrError = await qmino.callSync(
      //     nodePorts.create({
      //       data,
      //       nodeType,
      //       env,
      //     }),
      //     { timeout: 5000 },
      //   )
      //   if (typeof shallowNodeOrError === 'string') {
      //     return createNodeMutationError(shallowNodeOrError, '')
      //   }
      //   const successResult: GQLTypes.CreateNodeMutationSuccess = {
      //     __typename: 'CreateNodeMutationSuccess',
      //     node: gqlNodeByGraphNode(shallowNodeOrError),
      //   }
      //   return successResult
      // },
      // async createEdge(_root, { input }, ctx, _info) {
      //   // if (env.type === 'anon') {
      //   //   return createEdgeMutationError('NotAuthorized')
      //   // }
      //   const { edgeType, from, to } = input
      //   const data = validateCreateEdgeInput(input)
      //   if (data instanceof Error) {
      //     return createEdgeMutationError('UnexpectedInput', data.message)
      //   }
      //   // const data = { name, summary, ...assetRefMap }
      //   const edgeCreateResult = await qmino.callSync(
      //     edgePorts.create({
      //       from,
      //       to,
      //       data,
      //       edgeType,
      //       env,
      //     }),
      //     { timeout: 5000 },
      //   )
      //   if (typeof edgeCreateResult === 'string') {
      //     return createEdgeMutationError(edgeCreateResult, '')
      //   }
      //   const successResult: GQLTypes.CreateEdgeMutationSuccess = {
      //     __typename: 'CreateEdgeMutationSuccess',
      //     edge: gqlEdgeByShallowOrDoc(edgeCreateResult),
      //   }
      //   return successResult
      // },
      // async deleteEdge(_root, { input }, ctx /*,  _info */) {
      //   // console.log('deleteEdge', input)
      //   const { edgeType, id } = input
      //   const deleteResult = await qmino.callSync(
      //     edgePorts.del({
      //       env,
      //       edgeType,
      //       id,
      //     }),
      //     { timeout: 5000 },
      //   )
      //   if (typeof deleteResult === 'string') {
      //     return deleteEdgeMutationError(deleteResult, null)
      //   }
      //   const successResult: GQLTypes.DeleteEdgeMutationSuccess = {
      //     __typename: 'DeleteEdgeMutationSuccess',
      //     edgeId: id,
      //   }
      //   return successResult
      // },
    },
  }
}
