import type { d_u, deep_partial, ok_ko } from '@moodle/lib-types'
import { userAccountId } from '../user-account'
import { useTempFileResult } from '../storage'
import {
  profileImage,
  profileInfo,
  userAccountUserExcerpt,
  userProfileAccessObject,
  userProfileId,
  userProfileRecord,
  UserProfilePrimaryMsgSchemaConfigs,
  useProfileImageForm,
} from './types'
export * from './types'

export type get_user_profile_by = d_u<
  { userProfileId: { userProfileId: userProfileId }; userAccountId: { userAccountId: userAccountId } },
  'by'
>
export default interface UserProfileDomain {
  event: { userProfile: unknown }
  primary: {
    userProfile: {
      session: {
        moduleInfo(): Promise<{ schemaConfigs: UserProfilePrimaryMsgSchemaConfigs }>
      }
      editProfile: {
        useTempImageAsProfileImage(_: useProfileImageForm): Promise<useTempFileResult>
        editProfileInfo(_: {
          userProfileId: userProfileId
          profileInfo: deep_partial<profileInfo>
        }): Promise<ok_ko<void, { notFound: unknown; unknown: unknown }>>
      }
      userProfile: {
        access(_: get_user_profile_by): Promise<ok_ko<{ accessObject: userProfileAccessObject }, { notFound: unknown }>>
      }
    }
  }
  secondary: {
    userProfile: {
      queue: {
        createUserProfile(_: { userProfile: userProfileRecord }): Promise<ok_ko<void>>
      }
      service: unknown
      sync: {
        userAccountUserExcerpt(_: { userAccountUserExcerpt: userAccountUserExcerpt }): Promise<ok_ko<void>>
      }
      query: {
        getUserProfile(_: get_user_profile_by): Promise<ok_ko<{ userProfile: userProfileRecord }, { notFound: unknown }>>
      }
      write: {
        updatePartialProfileInfo(_: {
          userProfileId: userProfileId
          partialProfileInfo: deep_partial<profileInfo>
        }): Promise<ok_ko<void>>
        useTempImageInProfile(_: { as: profileImage; id: userProfileId; tempId: string }): Promise<useTempFileResult>
        updatePartialUserProfile(_: {
          userProfileId: userProfileId
          partialUserProfile: Partial<userProfileRecord>
        }): Promise<ok_ko<void>>
      }
    }
  }
}
