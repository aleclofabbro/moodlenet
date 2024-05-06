// SecondContributionEmail.stories.js
import { render } from '@react-email/render'
import {
  SecondContributionEmail,
  type SecondContributionEmailProps,
} from './SecondContributionEmail.js'

export default {
  title: 'Pages/Emails/Publisher/SecondContribution',
  component: SecondContributionEmail,
  parameters: { layout: 'no-wrapper' },
}

const EmailTemplate = () => {
  const props: SecondContributionEmailProps = {
    actionUrl: 'https://moodle.net/changepassword',
  }

  const html = render(<SecondContributionEmail {...props} />)

  return <div style={{ height: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />
}

export const Default = EmailTemplate.bind({})
