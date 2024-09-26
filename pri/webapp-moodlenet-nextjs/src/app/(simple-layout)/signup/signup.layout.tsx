import { priAccess } from '../../../lib/server/session-access'
import { layoutPropsWithChildren, slotItem, slotsMap } from '../../../lib/server/utils/slots'
import { SignupCard, SignupCardProps } from './signup.client'
import './signup.style.scss'

export default async function SignupLayout(props: layoutPropsWithChildren) {
  const {
    pages: { signup },
  } = await priAccess().moodle.netWebappNextjs.v1_0.pri.webapp.layouts()

  const signupCardProps: SignupCardProps = {
    signupMethods: signup.methods.map(({ label, panel }) => ({
      key: `${panel}#${label}`,
      label: slotItem(props, label),
      panel: slotItem(props, panel),
    })),
    slots: slotsMap(props, signup.slots),
  }

  return (
    <div className={`signup-page`}>
      <div className={`signup-content`}>
        <SignupCard {...signupCardProps} />
      </div>
    </div>
  )
}