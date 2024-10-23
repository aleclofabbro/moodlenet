import { LayoutHeaderLogo } from '../../app/_common/header-logo.server'
import { layoutPropsWithChildren, slotsMap } from '../../lib/server/utils/slots'
import { Footer, FooterProps } from '../../ui/organisms/Footer/Footer'
import { MainHeader, MainHeaderProps } from '../../ui/organisms/Header/MainHeader/MainHeader'
import {
  AdminSettingsLink,
  AvatarMenu,
  BookmarksLink,
  FollowingLink,
  HeaderSearchbox,
  LoginHeaderButton,
  Logout,
  ProfileLink,
  SignupHeaderButton,
  UserSettingsLink,
} from './main-layout.client'

import { filterOutFalsies } from '@moodle/lib-types'
import { sitepaths } from '../../lib/common/utils/sitepaths'
import { primary } from '../../lib/server/session-access'
import { logout } from '../actions/access'
import './main-layout.style.scss'
import { userSessionInfo } from '@moodle/module/user-account/lib'

export default async function MainLayoutLayout(props: layoutPropsWithChildren) {
  const [{ userSession }, layouts] = await Promise.all([
    primary.moodle.userAccount.session.getUserSession(),
    primary.moodle.netWebappNextjs.webapp.layouts(),
  ])
  return (
    <div className={`main-layout`}>
      <MainHeader slots={await headerSlots()} />
      <div className="content">{props.children}</div>
      <Footer slots={footerSlots()} />
    </div>
  )

  async function headerSlots(): Promise<MainHeaderProps['slots']> {
    const { center, left, right } = slotsMap(props, layouts.roots.main.header.slots)
    const defaultLefts = [<LayoutHeaderLogo key="logo" />]
    const defaultCenters = [<HeaderSearchbox key="searchbox" />]
    const { authenticated } = userSessionInfo(userSession)
    const avatarUrl = null //user_session.user.avatarUrl
    const userProfileAccessObject =
      authenticated &&
      (await primary.moodle.userProfile.userProfile
        .access({ by: 'userAccountId', userAccountId: authenticated.user.id })
        .then(([userProfileFound, userProfileResult]) => {
          return userProfileFound && userProfileResult.accessObject
        }))

    const baseProfilePage =
      userProfileAccessObject && sitepaths.profile[userProfileAccessObject.id]![userProfileAccessObject.urlSafeProfileName]!
    const defaultRights = authenticated
      ? await (async () => {
          return [
            <AvatarMenu
              key="avatar-menu"
              avatarUrl={avatarUrl}
              menuItems={filterOutFalsies([
                baseProfilePage && <ProfileLink key="profile" avatarUrl={avatarUrl} profileHref={baseProfilePage()} />,
                baseProfilePage && <BookmarksLink key="bookmarks" bookmarksHref={baseProfilePage.bookmarks()} />,
                baseProfilePage && <FollowingLink key="following" followingHref={baseProfilePage.followers()} />,
                baseProfilePage && <UserSettingsLink key="user-settings" settingsHref={sitepaths.settings.general()} />,
                authenticated.isAdmin && <AdminSettingsLink key="admin-settings" adminHref={sitepaths.admin.general()} />,
                <Logout key="logout" logout={logout} />,
              ])}
            />,
          ]
        })()
      : [<LoginHeaderButton key="login-header-button" />, <SignupHeaderButton key="signup-header-button" />]

    return {
      left: [...defaultLefts, ...left],
      center: [...defaultCenters, ...center],
      right: [...right, ...defaultRights],
    }
  }

  function footerSlots(): FooterProps['slots'] {
    const { center, left, right, bottom } = slotsMap(props, layouts.roots.main.footer.slots)
    return {
      left: [...left],
      center: [...center],
      right: [...right],
      bottom: [...bottom],
    }
  }
}
