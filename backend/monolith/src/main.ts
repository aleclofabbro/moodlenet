import { http_bind, TransportData } from '@moodle/bindings-node'
import {
  composeImpl,
  core_impl,
  CoreContext,
  coreModId,
  createAcccessProxy,
  dispatch,
  domain_msg,
  sec_impl,
  WorkerContext,
} from '@moodle/domain'
import * as mod_net from '@moodle/mod-net'
import * as mod_org from '@moodle/mod-org'
import * as mod_iam from '@moodle/mod-iam'
import * as mod_net_webapp_nextjs from '@moodle/mod-net-webapp-nextjs'
import { get_arango_persistence_factory } from '@moodle/sec-db-arango'
import { get_arango_db_sec_env, get_crypto_default_env, get_nodemailer_sec_cfg } from './env'
import { get_default_crypto_workers_factory } from '@moodle/sec-crypto-default'
import { get_nodemailer_workers_factory } from '@moodle/sec-email-nodemailer'

http_bind.server({
  port: 9000,
  baseUrl: '/',
  request(td) {
    return request(td)
  },
})

async function request({ domain_msg, primarySession, core_mod_id }: TransportData) {
  const monolithAccessProxy = createAcccessProxy({
    access(msg) {
      const core_mod_id = coreModId(domain_msg)
      return request({ domain_msg: msg, primarySession, core_mod_id }).catch(e => {
        console.error({ msg })
        throw e
      })
    },
  })

  const coreCtx: CoreContext = {
    primarySession,
    forward: monolithAccessProxy.mod,
    worker: monolithAccessProxy.mod,
  }

  const core_impls: core_impl[] = [
    // core modules
    mod_net.core()(coreCtx),
    mod_org.core()(coreCtx),
    mod_iam.core()(coreCtx),
    mod_net_webapp_nextjs.core()(coreCtx),
  ]
  const core = composeImpl(...core_impls)

  const workerCtx: WorkerContext | null = core_mod_id
    ? { primarySession, emit: monolithAccessProxy.mod, core_mod_id }
    : null

  const arangoDbSecEnv = get_arango_db_sec_env()
  const cryptoDefaultEnv = get_crypto_default_env()
  const nodemailerSecEnv = get_nodemailer_sec_cfg()
  const sec_impls: sec_impl[] = workerCtx
    ? [
        // sec modules
        get_arango_persistence_factory(arangoDbSecEnv)(workerCtx),
        get_default_crypto_workers_factory(cryptoDefaultEnv)(workerCtx),
        get_nodemailer_workers_factory(nodemailerSecEnv)(workerCtx),
      ]
    : []
  const sec = composeImpl(...sec_impls)

  // console.log(inspect(moodleDomain, true, 10, true))
  if (domain_msg.layer === 'pri') {
    return dispatch(core, domain_msg, not_implemented_here(domain_msg))
  } else if (domain_msg.layer === 'sec') {
    return dispatch(sec, domain_msg, not_implemented_here(domain_msg))
  } else if (domain_msg.layer === 'evt') {
    core_impls.forEach(core_impl => {
      dispatch(core_impl, domain_msg, not_implemented_here(domain_msg))
    })
  } else {
    throw TypeError(`unknown msg layer: ${domain_msg.layer}`)
  }
}
function not_implemented_here(domain_msg: domain_msg): (found: unknown) => void {
  return found => {
    const { channel, layer, mod, ns, port, version } = domain_msg
    const err_msg = `
NOT IMPLEMENTED: ${ns}.${mod}.${version}.${layer}.${channel}.${port}
FOUND: [${String(found)}]
`
    throw TypeError(err_msg)
  }
}