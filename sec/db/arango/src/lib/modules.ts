import { mod_id, str_ns_mod_v } from '@moodle/domain'
import { _any } from '@moodle/lib-types'
import assert from 'assert'
import { db_struct_0_1 } from '../dbStructure/v0_1'

function getKey(mod_id: mod_id) {
  return str_ns_mod_v(mod_id, '_')
}

export async function getModConfigs({
  db_struct_0_1,
  mod_id,
}: {
  db_struct_0_1: db_struct_0_1
  mod_id: mod_id
}) {
  const mod_int_id = getKey(mod_id)
  const configs = await db_struct_0_1.mng.coll.module_configs.document(mod_int_id)
  assert(configs, new Error(`${mod_int_id} config not found`))
  return { configs }
}

export async function saveModConfigs({
  db_struct_0_1,
  mod_id,
  configs,
}: {
  db_struct_0_1: db_struct_0_1
  mod_id: mod_id
  configs: _any
}) {
  const mod_int_id = getKey(mod_id)
  await db_struct_0_1.mng.coll.module_configs.save(
    { _key: mod_int_id, ...configs },
    { overwriteMode: 'replace' },
  )
}