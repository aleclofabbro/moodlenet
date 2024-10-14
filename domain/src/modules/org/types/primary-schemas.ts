import { url_or_file_id_schema, url_string_schema } from '@moodle/lib-types'
import type { z } from 'zod'
import { object, string } from 'zod'
export interface OrgPrimaryMsgSchemaConfigs {
  info: {
    name: { max: number; min: number }
    copyright: { max: number }
    physicalAddress: { max: number }
  }
}
export type orgInfoForm = z.infer<ReturnType<typeof getOrgPrimarySchemas>['updateOrgInfoSchema']>

export function getOrgPrimarySchemas({ info }: OrgPrimaryMsgSchemaConfigs) {
  const name = string().trim().min(info.name.min).max(info.name.max)
  const logo = url_or_file_id_schema()
  const smallLogo = url_or_file_id_schema()
  const websiteUrl = url_string_schema
  const copyright = string().trim().max(info.copyright.max)
  const physicalAddress = string().trim().max(info.physicalAddress.max)

  const updateOrgInfoSchema = object({
    name,
    logo,
    smallLogo,
    copyright,
    physicalAddress,
    websiteUrl,
  })

  return {
    raw: {
      info: {
        name,
        logo,
        smallLogo,
        copyright,
        physicalAddress,
        websiteUrl,
      },
    },
    updateOrgInfoSchema,
  }
}