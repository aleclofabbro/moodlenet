import { moodle_core_factory, moodle_core_impl } from '@moodle/domain'
import { _void } from '@moodle/lib-types'
import { assert_authorizeSystemSession } from '@moodle/mod-iam/lib'

export function net_core(): moodle_core_factory {
  return ctx => {
    const moodle_core_impl: moodle_core_impl = {
      primary: {
        net: {
          session: {
            async moduleInfo() {
              const {
                configs: { info, moodleNetPrimaryMsgSchemaConfigs },
              } = await ctx.sys_call.secondary.net.db.getConfigs()
              return { info, schemaConfigs: moodleNetPrimaryMsgSchemaConfigs }
            },
          },
          system: {
            async configs() {
              await assert_authorizeSystemSession(ctx)
              return ctx.sys_call.secondary.net.db.getConfigs()
            },
          },
          admin: {
            async updatePartialMoodleNetInfo({ partialInfo }) {
              const [done] = await ctx.sys_call.secondary.net.db.updatePartialConfigs({
                partialConfigs: { info: partialInfo },
              })
              return [done, _void]
            },
          },
        },
      },
    }
    return moodle_core_impl
  }
}
