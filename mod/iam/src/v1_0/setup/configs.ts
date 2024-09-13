import { Configs } from '../'

export const defaultIamConfigs_v1_0: Configs = {
  primaryMsgSchemaConfigs: {
    myAccount: {
      selfDeletionRequestReason: {
        min: 0,
        max: 300,
      },
    },
    user: {
      email: { min: 5, max: 35 },
      password: { min: 8, max: 35 },
      displayName: { min: 3, max: 35 },
    },
  },
  inactiveUsersPolicies: {
    deleteInactive: {
      notLoggedInFor: '1y',
      sendImminentDeletionNotificationBefore: '7d',
    },
  },
  roles: {
    newlyCreatedUserRoles: [],
  },
  tokenExpireTime: {
    userSession: '2d',
    resetPasswordRequest: '2h',
    signupEmailVerification: '2h',
    userSelfDeletionRequest: '1h',
  },
}