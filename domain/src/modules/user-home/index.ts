import type { d_u, deep_partial, ok_ko } from '@moodle/lib-types'
import { user_id } from '../iam'
import { useTempFileResult } from '../storage'
import {
  profileImage,
  profileInfo,
  iam_user_excerpt,
  user_home_access_object,
  user_home_id,
  userHomeRecord,
  UserHomePrimaryMsgSchemaConfigs,
} from './types'
export * from './types'

export type by_user_id_or_user_home_id = d_u<
  { user_home: { user_home_id: user_home_id }; user: { user_id: user_id } },
  'idOf'
>
export default interface UserHomeDomain {
  event: { userHome: unknown }
  primary: {
    userHome: {
      session: {
        moduleInfo(): Promise<{ schemaConfigs: UserHomePrimaryMsgSchemaConfigs }>
      }
      editProfile: {
        useTempImageAsProfileImage(_: { as: profileImage; tempId: string }): Promise<useTempFileResult>
        editProfileInfo(_: {
          user_home_id: user_home_id
          profileInfo: deep_partial<profileInfo>
        }): Promise<ok_ko<void, { notFound: unknown; unknown: unknown }>>
      }
      userHome: {
        access(_: {
          by: by_user_id_or_user_home_id
        }): Promise<ok_ko<{ accessObject: user_home_access_object }, { notFound: unknown }>>
      }
    }
  }
  secondary: {
    userHome: {
      queue: {
        createUserHome(_: { userHome: userHomeRecord }): Promise<ok_ko<void>>
      }
      service: unknown
      sync: {
        iamUserExcerpt(_: { iamUserExcerpt: iam_user_excerpt }): Promise<ok_ko<void>>
      }
      query: {
        getUserHome(_: {
          by: by_user_id_or_user_home_id
        }): Promise<ok_ko<{ userHome: userHomeRecord }, { notFound: unknown }>>
      }
      write: {
        updatePartialProfileInfo(_: {
          id: user_home_id
          partialProfileInfo: deep_partial<profileInfo>
        }): Promise<ok_ko<{ userHomeId: user_home_id; userId: user_id }>>
        useTempImageInProfile(_: { as: profileImage; id: user_home_id; tempId: string }): Promise<useTempFileResult>
      }
    }
  }
}
