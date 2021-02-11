import { FC } from 'react'
import { useFormikWithBag } from '../../helpers/forms'
import { SignupFormValues, SignupPanelBig } from '../../ui/components/SignupPanelBig'
import { useSignUpMutation } from './SignupPanelBigCtrl/signup.gen'
import { MutationSignUpArgs } from '../../graphql/pub.graphql.link'
import { signUp } from '@moodlenet/common/lib/graphql/validation/input/user-account'

export const SignupPanelBigCtrl: FC = () => {
  const [signup, result] = useSignUpMutation()
  const [, /* formik*/ bag] = useFormikWithBag<SignupFormValues & MutationSignUpArgs>({
    initialValues: { email: '' },
    validationSchema: signUp,
    validateOnChange: false,
    onSubmit({ email } /* , helpers */) {
      return signup({ variables: { email } })
    },
  })
  const message = result.data?.signUp.message ?? ''
  return <SignupPanelBig form={bag} message={message} />
}