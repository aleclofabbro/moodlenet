import { primary_session } from '@moodle/domain'
import { EnvProvider } from './types'

export async function getEnv(primary_session: primary_session) {
  const envProviderMod: { default: EnvProvider } = await import(
    process.env.MOODLE_ENV_PROVIDER_MODULE_PATH ?? './default-env-provider.js'
  )
  //console.log(inspect((envProviderMod as any).default.default, true, 10, true))
  const env = await envProviderMod.default(primary_session)
  return env
}
