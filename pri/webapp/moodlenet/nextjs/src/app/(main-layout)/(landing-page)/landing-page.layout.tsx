import defaultBackground from '../../../assets/img/default-landing-background.png'
import { getMod } from '../../../lib/server/session-access'
import { layoutPropsWithChildren, slotsMap } from '../../../lib/server/utils/slots'
// import { LandingHeadSearchbox, LandingHeadShareButton } from './landing-page.client'
import { LandingHeadSearchbox /* , LandingHeadShareButton  */ } from './landing-page.client'
import './landing-page.style.scss'

export default async function LandingPageLayout(props: layoutPropsWithChildren) {
  const {
    moodle: {
      net: {
        V0_1: { pri: net },
      },
    },
  } = getMod()
  const {
    websiteLayouts: {
      pages: { landing },
    },
    info,
  } = await net.read.configs()

  const { head, content } = slotsMap(props, landing.slots)

  const headerStyle = {
    backgroundImage: `url("${defaultBackground.src}")`,
    backgroundSize: 'cover',
  }
  return (
    <div className="landing">
      <div className="landing-header" style={headerStyle}>
        <div className="landing-title">
          <div className="title">{info.title}</div>
          <div className="subtitle">{info.subtitle}</div>
        </div>
        <LandingHeadSearchbox defaultValue="" placeholder="" />
        {/* canCreateDraftContent && <LandingHeadShareButton /> */}
        {head}
      </div>
      {content}
    </div>
  )
}
