'use server'

import { t } from 'i18next'
import { returnValidationErrors } from 'next-safe-action'
import { defaultSafeActionClient } from '../../../../lib/server/safe-action'
import { priAccess } from '../../../../lib/server/session-access'
import { MakeAdminGeneralSchemaDeps, provideAdminGeneralSchemas } from './general.common'
import { revalidatePath } from 'next/cache'

export async function getAdminGeneralSchemas() {
  const { moodleNetSchemaConfigs, orgSchemaConfigs } = await fetchMakeAdminGeneralSchemaDeps()
  return provideAdminGeneralSchemas({ moodleNetSchemaConfigs, orgSchemaConfigs })
}
async function getGeneralSchema() {
  const { generalSchema: general } = await getAdminGeneralSchemas()
  return general
}
export const saveGeneralInfoAction = defaultSafeActionClient
  .schema(getGeneralSchema)
  .action(async ({ parsedInput: adminGeneralForm }) => {
    const { moodleNetInfoSchema, orgInfoSchema } = await getAdminGeneralSchemas()

    const [[mnetDone], [orgDone]] = await Promise.all([
      priAccess().net.admin.updatePartialMoodleNetInfo({
        partialInfo: moodleNetInfoSchema.parse(adminGeneralForm),
      }),
      priAccess().org.admin.updatePartialOrgInfo({
        partialInfo: orgInfoSchema.parse(adminGeneralForm),
      }),
    ])
    revalidatePath('/')
    if (mnetDone && orgDone) {
      return
    }
    returnValidationErrors(getGeneralSchema, {
      _errors: [t(`something went wrong while saving the general info`)],
    })
  })

export async function fetchMakeAdminGeneralSchemaDeps(): Promise<MakeAdminGeneralSchemaDeps> {
  const [{ moodleNetSchemaConfigs }, { orgSchemaConfigs }] = await Promise.all([
    priAccess().netWebappNextjs.schemaConfigs.moodleNet(),
    priAccess().netWebappNextjs.schemaConfigs.org(),
  ])
  return { moodleNetSchemaConfigs, orgSchemaConfigs }
}

