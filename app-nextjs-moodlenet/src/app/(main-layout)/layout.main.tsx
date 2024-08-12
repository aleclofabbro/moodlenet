import { LayoutHeaderLogo } from '@/_common/header-logo.server'
import Footer, { FooterProps } from '@/components/organisms/Footer/Footer'
import MainHeader, { MainHeaderProps } from '@/components/organisms/Header/MainHeader/MainHeader'
import { layoutUtils } from '@/lib-server/utils'
import type { PropsWithChildren } from 'react'
import { HeaderSearchbox, LoginHeaderButton, SignupHeaderButton } from './client.layout.main'
import './layout.main.scss'

export default async function LayoutMain(props: PropsWithChildren) {
  const {
    ctx: {
      session: {
        website: {
          labels: { searchPlaceholder },
          layout: { main: mainLayout },
        },
      },
    },
    currUser,
    slots,
  } = await layoutUtils(props)
  const headerSlots = ((): MainHeaderProps['slots'] => {
    const { center, left, right } = slots(mainLayout.header.slots)
    return {
      left: [<LayoutHeaderLogo key="logo" />, ...left],
      center: [<HeaderSearchbox placeholder={searchPlaceholder} key="searchbox" />, ...center],
      right: [
        ...right,
        ...(currUser.isGuest()
          ? [
              <LoginHeaderButton key="login-header-button" />,
              <SignupHeaderButton key="signup-header-button" />,
            ]
          : []),
      ],
    }
  })()
  const footerSlots = ((): FooterProps['slots'] => {
    const { center, left, right, bottom } = slots(mainLayout.footer.slots)
    return {
      left: [...left],
      center: [...center],
      right: [...right],
      bottom: [...bottom],
    }
  })()
  return (
    <div className={`main-layout`}>
      <MainHeader slots={headerSlots} />
      <div className="content">{props.children}</div>
      <Footer slots={footerSlots} />
    </div>
  )
}
