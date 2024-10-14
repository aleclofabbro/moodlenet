import { lib, secondaryBootstrap } from '@moodle/domain'
import { joseOpts } from '@moodle/lib-jwt-jose'
import { ArgonPwdHashOpts, iam_crypto_secondary_factory } from './sec/moodle'

export interface CryptoDefaultEnv {
  joseOpts: joseOpts
  argonOpts: ArgonPwdHashOpts
}

export function get_default_crypto_secondarys_factory({
  joseOpts,
  argonOpts,
}: CryptoDefaultEnv): secondaryBootstrap {
  return bootstrapCtx => {
    return secondaryCtx => {
      return lib.mergeSecondaryAdapters([
        iam_crypto_secondary_factory({ joseOpts, argonOpts })(bootstrapCtx)(secondaryCtx),
      ])
    }
  }
}
