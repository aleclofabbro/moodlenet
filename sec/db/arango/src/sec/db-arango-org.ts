import { moodle_secondary_adapter, moodle_secondary_factory } from '@moodle/domain'
import { _void } from '@moodle/lib-types'
import { db_struct } from '../db-structure'
import { getModConfigs, updateDeepPartialModConfigs } from '../lib/modules'

export function org_moodle_secondary_factory({
  db_struct,
}: {
  db_struct: db_struct
}): moodle_secondary_factory {
  return ctx => {
    const moodle_secondary_adapter: moodle_secondary_adapter = {
      secondary: {
        org: {
          db: {
            async getConfigs() {
              const configs = await getModConfigs({
                moduleName: ctx.invoked_by.module,
                db_struct,
              })
              return configs
            },
            async updatePartialConfigs({ partialConfigs }) {
              const result = await updateDeepPartialModConfigs({
                moduleName: ctx.invoked_by.module,
                db_struct,
                partialConfigs,
              })
              return [!!result, _void]
            },
          },
        },
      },
    }
    return moodle_secondary_adapter
  }
}