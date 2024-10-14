import { contextModuleAccess } from '@moodle/domain'
import React from 'react'
import * as main from '..'

export type ResetPasswordContentEmailProps = {
  receiverEmail: string
  resetPasswordUrl: string
  modAccess: contextModuleAccess
}

export async function resetPasswordEmail({
  resetPasswordUrl,
  receiverEmail,
  modAccess,
}: ResetPasswordContentEmailProps) {
  const senderInfo = await main.getSenderInfo({ modAccess })
  const title = `Ready to change your password 🔑`
  const body = (
    <React.Fragment>
      Someone (probably you) requested a password change on MoodleNet. If that was you, please click
      on the button below and choose a new password for your account.
    </React.Fragment>
  )

  return main.layoutEmail({
    senderInfo,
    content: {
      body,
      receiverEmail,
      subject: title,
      title,
      hideIgnoreMessage: false,
      action: {
        title: 'Change password',
        url: resetPasswordUrl,
      },
    },
  })
}
