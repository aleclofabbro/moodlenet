import { aqlstr } from '../../../../../../../lib/helpers/arango'
import { SearchPage } from '../../../../ContentGraph.graphql.gen'
import { ContentGraphPersistence } from '../../../types'
import { DBReady } from '../ContentGraph.persistence.arango.env'
import { aqlMergeTypenameById, makePage, skipLimitPagination } from './helpers'

export const globalSearch: ContentGraphPersistence['globalSearch'] = async ({ text, page }) => {
  const { db } = await DBReady()
  const { limit, skip } = skipLimitPagination({ page })
  const aql_txt = aqlstr(text)
  const query = `
        FOR node IN SearchView
        SEARCH ANALYZER(
          BOOST( PHRASE(node.name,${aql_txt}), 10 )
          ||
          BOOST( PHRASE(node.description,${aql_txt}), 5 )
          ||
          BOOST( node.name IN TOKENS(${aql_txt}), 3 )
          ||
          BOOST( node.summary IN TOKENS(${aql_txt}), 1 )
          ||
          BOOST(  NGRAM_MATCH(node.name, ${aql_txt}, 0.05, "global-search-ngram"), 0.2 )
          ||
          BOOST( NGRAM_MATCH(node.summary, ${aql_txt}, 0.05, "global-search-ngram"), 0.1 )
        , "text_en")
      SORT TFIDF(node) desc, node._key
      
      LIMIT ${skip}, ${limit}
      
      RETURN {
        node: ${aqlMergeTypenameById('node')}
      }
    `
  console.log(query)
  const cursor = await db.query(query)
  const results = (await cursor.all()).map((edge, i) => {
    return {
      ...edge,
      cursor: i + skip,
    }
  })

  return makePage<SearchPage>({
    afterEdges: results,
    beforeEdges: [],
    pageEdgeTypename: 'SearchPageEdge',
    pageTypename: 'SearchPage',
  })
}
