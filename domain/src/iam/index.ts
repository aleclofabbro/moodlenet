import type { session_token } from '@moodle/lib-ddd'
import type {
  __redacted__,
  d_u__d,
  date_time_string,
  email_address,
  named_or_email_address,
  ok_ko,
  pretty,
  signed_expire_token,
  signed_token,
  time_duration_string,
  url_string,
} from '@moodle/lib-types'
import type { ReactElement } from 'react'

import type {
  changePasswordForm,
  Configs,
  IamPrimaryMsgSchemaConfigs,
  loginForm,
  resetPasswordForm,
  signTokenData,
  signupForm,
  user_deactivation_reason,
  user_id,
  user_plain_password,
  user_record,
  user_role,
  user_session,
} from './types'

export * from './types'
export type iam_primary = pretty<IamPrimary>
export type iam_secondary = pretty<IamSecondary>

export interface IamPrimary {
  session: {
    getCurrentUserSession(): Promise<{ userSession: user_session }>
    generateUserSession(_: {
      userId: user_id
    }): Promise<ok_ko<signed_expire_token, { userNotFound: unknown }>>
    moduleInfo(): Promise<{ schemaConfigs: IamPrimaryMsgSchemaConfigs }>
  }

  system: {
    configs(): Promise<{ configs: Configs }>
  }

  admin: {
    editUserRoles(_: {
      userId: user_id
      role: user_role
      action: 'set' | 'unset'
    }): Promise<ok_ko<{ updatedRoles: user_role[] }, { userNotFound: unknown }>>
    searchUsers(_: { textSearch: string }): Promise<{ users: user_record[] }>
    deactivateUser(_: {
      userId: user_id
      reason: string
      anonymize: boolean
    }): Promise<ok_ko<void, { userNotFound: unknown }>>
  }

  access: {
    signupRequest(_: {
      signupForm: signupForm
      redirectUrl: url_string
    }): Promise<ok_ko<void, { userWithSameEmailExists: unknown }>>

    createNewUserByEmailVerificationToken(_: {
      signupEmailVerificationToken: signed_token
    }): Promise<
      ok_ko<
        { userId: user_id },
        {
          /* userWithThisEmailExists: unknown; */ invalidToken: unknown
          unknown: unknown
        }
      >
    >
    login(_: { loginForm: loginForm }): Promise<
      ok_ko<{
        session: signed_expire_token
        authenticatedSession: d_u__d<user_session, 'type', 'authenticated'>
      }>
    >
    logout(_: { sessionToken: session_token }): Promise<void>

    resetPasswordRequest(_: {
      redirectUrl: url_string
      declaredOwnEmail: email_address
    }): Promise<void>
  }

  myAccount: {
    selfDeletionRequest(_: { redirectUrl: url_string }): Promise<void>

    confirmSelfDeletionRequest(_: {
      selfDeletionConfirmationToken: signed_token
      reason: string
    }): Promise<ok_ko<void, { invalidToken: unknown; unknownUser: unknown; unknown: unknown }>>

    resetPassword(_: {
      resetPasswordForm: resetPasswordForm
    }): Promise<ok_ko<void, { invalidToken: unknown; userNotFound: unknown; unknown: unknown }>>

    changePassword(
      _: changePasswordForm,
    ): Promise<ok_ko<void, { wrongCurrentPassword: unknown; unknown: unknown }>>
  }
}
export interface IamSecondary {
  crypto: {
    hashPassword(_: {
      plainPassword: __redacted__<user_plain_password>
    }): Promise<{ passwordHash: string }>
    verifyUserPasswordHash(_: {
      plainPassword: __redacted__<user_plain_password>
      passwordHash: string
    }): Promise<ok_ko<void>>

    signDataToken(_: {
      data: signTokenData
      expiresIn: time_duration_string
    }): Promise<signed_expire_token>
    validateSignedToken<type extends signTokenData['type']>(_: {
      token: signed_token
      type: type
    }): Promise<
      ok_ko<
        { validatedSignedTokenData: d_u__d<signTokenData, 'type', type> },
        { invalid: unknown; validatedUnknownType: { data: unknown } }
      >
    >
    //NOTE: implement decodeNoValidateSignedToken(_: { token: session_token }): Promise<ok_ko<{__NOT_VALIDATED_SESSION_TOKEN_DATA__:iamSignTokenData}>>
  }

  email: {
    sendNow(_: {
      to: named_or_email_address
      subject: string
      reactBody: ReactElement
    }): Promise<void>
  }
  alignDb: {
    userDisplayname(_: { userId: user_id; displayName: string }): Promise<ok_ko<void>>
  }
  db: {
    getConfigs(): Promise<{ configs: Configs }>

    setUserPassword(_: {
      userId: user_id
      newPasswordHash: string
    }): Promise<ok_ko<{ userId: user_id }>>

    deactivateUser(_: {
      userId: user_id
      anonymize: boolean
      reason: user_deactivation_reason
      at?: date_time_string
    }): Promise<ok_ko<{ deactivatedUser: user_record }>>

    getActiveUsersNotLoggedInFor(_: {
      time: time_duration_string
      inactiveNotificationSent: boolean
    }): Promise<{ inactiveUsers: user_record[] }>

    getUserById(_: { userId: user_id }): Promise<ok_ko<user_record>>
    getUserByEmail(_: { email: email_address }): Promise<ok_ko<user_record>>

    saveNewUser(_: { newUser: user_record }): Promise<ok_ko<{ newUser: user_record }>>

    setUserRoles(_: {
      userId: user_id
      roles: user_role[]
      adminUserId: user_id
    }): Promise<ok_ko<{ newRoles: user_role[]; oldRoles: user_role[] }>>

    findUsersByText(_: {
      text: string
      includeDeactivated?: boolean
    }): Promise<{ users: user_record[] }>
  }
}
