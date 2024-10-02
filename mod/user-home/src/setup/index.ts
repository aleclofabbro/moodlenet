import { url_string_schema } from '@moodle/lib-types'
import { org } from '@moodle/domain'

export const org_default_configs: org.Configs = {
  info: {
    name: 'MoodleNet',
    logo: url_string_schema.parse('https://moodle.net/08469f8073a8f969253823d5d6ed6ffa.png'),
    smallLogo: url_string_schema.parse('https://moodle.net/e80d311942d3ce22651b33968a87ecb1.png'),
    copyright: '',
    physicalAddress: '',
    websiteUrl: url_string_schema.parse('https://moodle.org'),
  },
  orgPrimaryMsgSchemaConfigs: {
    info: {
      name: { min: 3, max: 100 },
      physicalAddress: { max: 500 },
      copyright: { max: 300 },
    },
  },
}
