import { v0_1 as org_0_1 } from '@moodle/mod-org'

export type PasswordChangedEmailProps = {
  receiverEmail: string
}

export function passwordChangedContent({
  receiverEmail,
}: PasswordChangedEmailProps): org_0_1.EmailLayoutContentProps {
  const title = `Password changed 🔒💫`
  const body = `Your password has been successfully changed. If it was not you, recover your password and keep in safer.`
  return {
    body,
    receiverEmail,
    subject: title,
    title,
    hideIgnoreMessage: false,
  }
}