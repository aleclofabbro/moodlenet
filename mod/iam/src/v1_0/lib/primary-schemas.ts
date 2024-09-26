import { __redacted__key, email_address_schema, signed_token_schema } from '@moodle/lib-types'
import { object, string } from 'zod'
import { IamPrimaryMsgSchemaConfigs } from '../types'

export function getIamPrimarySchemas({ user, myAccount }: IamPrimaryMsgSchemaConfigs) {
  const email = string().max(user.email.max).and(email_address_schema)
  const password = string().trim().min(user.password.min).max(user.password.max)
  const displayName = string()
    .trim()
    .min(user.displayName.min)
    .max(user.displayName.max)
    .regex(new RegExp(...user.displayName.regex))
  const redacted_password = object({
    [__redacted__key]: password,
  })

  const signupSchema = object({
    email,
    password: redacted_password,
    displayName,
  })

  const changePasswordSchema = object({
    currentPassword: redacted_password,
    newPassword: redacted_password,
  })

  const selfDeletionSchema = object({
    reason: string().trim().max(myAccount.selfDeletionRequestReason.max).default(''),
    token: signed_token_schema,
  })

  const resetPasswordSchema = object({
    newPassword: redacted_password,
    token: signed_token_schema,
  })

  const loginSchema = object({
    email,
    password: redacted_password,
  })

  return {
    raw: {
      user: {
        signed_token_schema,
        email,
        redacted_password,
        displayName,
      },
    },
    resetPasswordSchema,
    signupSchema,
    loginSchema,
    changePasswordSchema,
    selfDeletionSchema,
  }
}

// FIXME: This is a solution to the password complexity issue from https://forum.codewithmosh.com/t/password-complexity-for-zod/23622
//! eventually add this to password schema, after investigating on how to configure it
// CHECK this too (and others) https://grad.ucla.edu/gasaa/etd/specialcharacters.pdf
// string().superRefine((password, checkPassComplexity) => {
//   const containsUppercase = (ch: string) => /[A-Z]/.test(ch)
//   const containsLowercase = (ch: string) => /[a-z]/.test(ch)
//   const containsSpecialChar = (ch: string) => /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch)
//   let countOfUpperCase = 0,
//     countOfLowerCase = 0,
//     countOfNumbers = 0,
//     countOfSpecialChar = 0
//   for (let i = 0; i < password.length; i++) {
//     const ch = password.charAt(i)
//     if (!isNaN(+ch)) countOfNumbers++
//     else if (containsUppercase(ch)) countOfUpperCase++
//     else if (containsLowercase(ch)) countOfLowerCase++
//     else if (containsSpecialChar(ch)) countOfSpecialChar++
//   }
//   if (
//     countOfLowerCase < 1 ||
//     countOfUpperCase < 1 ||
//     countOfSpecialChar < 1 ||
//     countOfNumbers < 1
//   ) {
//     checkPassComplexity.addIssue({
//       code: 'custom',
//       message: 'password does not meet complexity requirements',
//     })
//   }
// })
