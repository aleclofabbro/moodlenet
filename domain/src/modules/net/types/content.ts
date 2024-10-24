import { _nullish, date_time_string, non_negative_integer, positive_integer } from '@moodle/lib-types'
import { assetTextExtraction } from '../../asset-text-extraction'
import { eduIscedFieldId } from '../../edu'
import {
  eduResourceCollectionId,
  eduResourceId,
  eduResourceCollectionData,
  eduResourceData,
} from '../../edu/types/edu-content'
import { userProfileId } from '../../user-profile'

export type published_content_id = user_contribution_id | userProfileId | eduIscedFieldId
export type publishedContentType = userContributionType | 'user-profile' | 'isced-field'
export type userContributionType = 'edu-resource' | 'edu-resource-collection'

export type user_contribution_id = eduResourceId | eduResourceCollectionId

export type userContributionData = eduResourceData | eduResourceCollectionData

export type publishedEduResource = publishedContent<
  eduResourceData,
  { downloadCount: non_negative_integer; assetTextExtraction: assetTextExtraction }
>

export type publishedEduResourceCollection = publishedContent<eduResourceCollectionData>

export type publishedContent<dataType extends userContributionData, meta = _nullish> = {
  id: user_contribution_id
  data: dataType
  meta: meta
  dataRevision: positive_integer
  created: date_time_string
  lastUpdateDate: date_time_string
  firstPublished: date_time_string
  lastPublishDate: date_time_string
  // dataUpdates: { date: date_time_string; diff: jsonDiff }[]
  points: {
    popularity: non_negative_integer
  }
}