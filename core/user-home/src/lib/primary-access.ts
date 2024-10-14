import { sessionLibDep, validate_userSessionInfo } from '@moodle/core-iam/lib'
import { userHome } from '@moodle/domain'
import { access_obj, d_u } from '@moodle/lib-types'

export async function accessUserHome({
  coreCtx,
  priCtx,
  by,
}: sessionLibDep & {
  by: userHome.by_user_id_or_user_home_id
}): Promise<
  d_u<{ found: access_obj<userHome.user_home_access_object>; notFound: unknown }, 'result'>
> {
  const [found, findResult] = await coreCtx.mod.userHome.query.getUserHome({ by })

  if (!found) {
    return { result: 'notFound' }
  }
  const { userHome } = findResult
  const { authenticated } = await validate_userSessionInfo({ coreCtx, priCtx })
  const { profileInfo, id } = userHome
  const isPublisher = userHome.user.roles.includes('publisher')

  if (!authenticated) {
    if (isPublisher) {
      return {
        result: 'found',
        id,
        access: 'allowed',
        profileInfo,
        permissions: _all_user_home_permissions_disallowed,
        user: null,
        flags: { followed: true },
      }
    } else {
      return { result: 'found', access: 'notAllowed' }
    }
  }

  const itsMe = authenticated.user.id === userHome.user.id

  return {
    result: 'found',
    access: 'allowed',
    id,
    profileInfo,
    permissions: {
      ...(itsMe
        ? {
            editProfile: true,
            validationConfigs: await getProfileInfoValidationConfigs(),
          }
        : {
            editProfile: false,
          }),
      follow: !itsMe,
      report: !itsMe,
      sendMessage: !itsMe,
      editRoles: !itsMe && authenticated.isAdmin,
    },
    user: itsMe || authenticated.isAdmin ? userHome.user : null,
    flags: { followed: !itsMe },
  }

  async function getProfileInfoValidationConfigs() {
    return (await coreCtx.mod.env.query.modConfigs({ mod: 'userHome' })).configs
      .profileInfoPrimaryMsgSchemaConfigs
  }
}

const _all_user_home_permissions_disallowed: userHome.user_home_permissions = {
  editRoles: false,
  editProfile: false,
  follow: false,
  report: false,
  sendMessage: false,
}