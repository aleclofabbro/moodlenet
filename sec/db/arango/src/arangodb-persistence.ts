import { composeImpl, sec_factory } from '@moodle/domain'
import { v1_0 } from './'
import { iam, net, netWebappNextjs } from './sec/moodle'

export function get_arango_persistence_factory({ dbs_struct_configs }: v1_0.ArangoDbSecEnv): sec_factory {
  const db_struct = v1_0.getDbStruct(dbs_struct_configs)
  return function factory(ctx) {
    return composeImpl(
      net({ db_struct_v1_0: db_struct })(ctx),
      iam({ db_struct_v1_0: db_struct })(ctx),
      netWebappNextjs({ db_struct_v1_0: db_struct })(ctx),
    )
  }
}
