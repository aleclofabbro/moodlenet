import { domain_msg, mod_id, primary_session } from '@moodle/lib-ddd'
export * as http_bind from './http'

// FIXME TransportData  is generic for any binding (?)
export interface TransportData {
  primary_session: primary_session
  domain_msg: domain_msg
  core_mod_id: mod_id | null
}
