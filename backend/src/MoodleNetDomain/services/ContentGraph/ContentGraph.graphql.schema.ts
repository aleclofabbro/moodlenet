import { ServiceExecutableSchemaDefinition } from '../../MoodleNetGraphQL'
import * as accessRead from './ContentGraph.access.read'
import { getContentGraphPersistence } from './ContentGraph.env'
import { Node, QueryNodeSuccess, Resolvers } from './ContentGraph.graphql.gen'
import { nodeConstraints } from './persistence/graphDefs/node-constraints'

export const getContentGraphServiceExecutableSchemaDefinition = async (): Promise<ServiceExecutableSchemaDefinition> => {
  const { findNode, graphQLTypeResolvers } = await getContentGraphPersistence()

  const resolvers: Resolvers = {
    ...graphQLTypeResolvers,
    Query: {
      async node(_root, { _id, nodeType }, ctx /* ,_info */) {
        const {
          access: { read: allow },
        } = nodeConstraints[nodeType]
        const firstStageAccessCheck = accessRead.firstStageCheckPublicAccess({
          allow,
          ctx,
        })
        if (!firstStageAccessCheck) {
          return accessRead.nodeQueryErrorNotAuthorized(null)
        }

        const shallowNode = await findNode({ _id, nodeType })
        if (!shallowNode) {
          return accessRead.nodeQueryErrorNotFound(null)
        }

        const secondStageAccessCheck = accessRead.secondStageCheckAccessByDocMeta(
          {
            allow,
            ctx,
            meta: shallowNode._meta,
          }
        )

        if (!secondStageAccessCheck) {
          return accessRead.nodeQueryErrorNotAuthorized(null)
        }

        const result: QueryNodeSuccess = {
          node: shallowNode as Node,
          __typename: 'QueryNodeSuccess',
        }
        return result
      },
    },
    Mutation: {} as any,
    ...({} as any),
  }

  return { resolvers }
}
