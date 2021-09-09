import * as Types from '../../../graphql/pub.graphql.link';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type LocalInstanceQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type LocalInstanceQuery = (
  { __typename: 'Query' }
  & { node?: Types.Maybe<{ __typename: 'Collection' } | { __typename: 'FileFormat' } | { __typename: 'IscedField' } | { __typename: 'IscedGrade' } | { __typename: 'Language' } | { __typename: 'License' } | (
    { __typename: 'Organization' }
    & Pick<Types.Organization, 'id' | 'name' | 'description' | 'intro' | 'logo' | 'image' | 'color' | 'domain'>
  ) | { __typename: 'Profile' } | { __typename: 'Resource' } | { __typename: 'ResourceType' }> }
);


export const LocalInstanceDocument = gql`
    query localInstance {
  node(id: "Organization/--local--") {
    ... on Organization {
      id
      name
      description
      intro
      logo
      image
      color
      domain
    }
  }
}
    `;

/**
 * __useLocalInstanceQuery__
 *
 * To run a query within a React component, call `useLocalInstanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useLocalInstanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLocalInstanceQuery({
 *   variables: {
 *   },
 * });
 */
export function useLocalInstanceQuery(baseOptions?: Apollo.QueryHookOptions<LocalInstanceQuery, LocalInstanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LocalInstanceQuery, LocalInstanceQueryVariables>(LocalInstanceDocument, options);
      }
export function useLocalInstanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LocalInstanceQuery, LocalInstanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LocalInstanceQuery, LocalInstanceQueryVariables>(LocalInstanceDocument, options);
        }
export type LocalInstanceQueryHookResult = ReturnType<typeof useLocalInstanceQuery>;
export type LocalInstanceLazyQueryHookResult = ReturnType<typeof useLocalInstanceLazyQuery>;
export type LocalInstanceQueryResult = Apollo.QueryResult<LocalInstanceQuery, LocalInstanceQueryVariables>;