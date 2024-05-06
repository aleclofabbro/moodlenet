import type { EmailLayoutProps } from '@moodlenet/component-library'
import { EmailLayout } from '@moodlenet/component-library'

export type PasswordChangedEmailProps = Partial<EmailLayoutProps>

export const PasswordChangedEmail = () => {
  const title = `Password changed 🔒💫`
  const content = `Your password has been successfully changed. If it was not you, recover your password and keep in safer.`
  return <EmailLayout subject={title} content={content} title={title} />
}

PasswordChangedEmail.defaultProps = {} as PasswordChangedEmailProps

export default PasswordChangedEmail
