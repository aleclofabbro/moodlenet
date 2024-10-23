import { _maybe, flags } from '@moodle/lib-types'
import { languageId, licenseId } from '../../content'
import { iscedFieldId, iscedLevelId } from '../../edu'
import { userAccountId, userRole } from '../../user-account'
import { profileInfo } from './profile-info'
import { myDrafts } from './drafts'
import { moodlenetUserData } from '../../net'

export type userProfileId = string

export type userProfileRecord = {
  id: userProfileId
  userAccountUser: userAccountUserExcerpt
  info: profileInfo
  urlSafeProfileName: string
  myDrafts: myDrafts
  eduInterestFields: userInterestFields
  moodlenet: moodlenetUserData
}

export type userAccountUserExcerpt = { id: userAccountId; roles: userRole[] }

export type userInterestFields = {
  iscedFields: iscedFieldId[]
  iscedLevels: iscedLevelId[]
  languages: languageId[]
  licenses: licenseId[]
}
export type userProfilePermissions = flags<'follow' | 'editRoles' | 'sendMessage' | 'report' | 'editProfile'>

export type user_profile_access_object = {
  id: userProfileId
  profileInfo: profileInfo
  urlSafeProfileName: string
  permissions: userProfilePermissions
  flags: flags<'followed'>
  user: _maybe<userAccountUserExcerpt>
}
