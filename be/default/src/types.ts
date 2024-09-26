import { primary_session } from '@moodle/lib-ddd'
import type { CryptoDefaultEnv } from '@moodle/sec-crypto-default'
import type { v1_0 as arango_v1_0 } from '@moodle/sec-db-arango'
import { DbMigrateConfig } from '@moodle/sec-db-arango/migrate'
import type { NodemailerSecEnv } from '@moodle/sec-email-nodemailer'

export type EnvProviderResult = EnvResult | Promise<EnvResult>

export type migrate_fn = (_: {
  env: Env
  configs: {
    db: DbMigrateConfig
  }
}) => Promise<migration_status>

export type EnvProvider = (_: {
  primary_session: primary_session
  migrate: migrate_fn
}) => EnvProviderResult

export interface EnvResult {
  env: Env
  migration_status: Promise<migration_status>
}

export interface Env {
  arango_db: arango_v1_0.ArangoDbSecEnv
  crypto: CryptoDefaultEnv
  nodemailer: NodemailerSecEnv
}
type migration_status = unknown // d_u<{done:unknown}, 'status'>