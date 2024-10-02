import { Config as arangojs_config } from 'arangojs/connection'
import { literal, number, object, string } from 'zod'

import { map } from '@moodle/lib-types'
import { ArangoDbSecEnv } from './db-structure'

export type env_keys =
  | 'MOODLE_ARANGODB_ISDEV'
  | 'MOODLE_ARANGODB_DB_PREFIX'
  | 'MOODLE_ARANGODB_URL'
  | 'MOODLE_ARANGODB_USER'
  | 'MOODLE_ARANGODB_PWD'
  | 'MOODLE_ARANGODB_VERSION'
export function provideEnv({ env }: { env: map<unknown, env_keys> }): ArangoDbSecEnv {
  function int_schema(dflt: number) {
    return string().transform(Number).pipe(number().positive().int().default(dflt))
  }

  const env_config = object({
    MOODLE_ARANGODB_ISDEV: literal('true').or(literal('false')), // FIXME: check for valid db prefix
    MOODLE_ARANGODB_DB_PREFIX: string(), // FIXME: check for valid db prefix
    MOODLE_ARANGODB_URL: string(),
    MOODLE_ARANGODB_USER: string().optional(),
    MOODLE_ARANGODB_PWD: string().optional(),
    MOODLE_ARANGODB_VERSION: int_schema(31200).or(literal(31200)).or(literal(31100)),
  }).parse({
    MOODLE_ARANGODB_ISDEV: env.MOODLE_ARANGODB_ISDEV,
    MOODLE_ARANGODB_DB_PREFIX: env.MOODLE_ARANGODB_DB_PREFIX,
    MOODLE_ARANGODB_URL: env.MOODLE_ARANGODB_URL,
    MOODLE_ARANGODB_USER: env.MOODLE_ARANGODB_USER,
    MOODLE_ARANGODB_PWD: env.MOODLE_ARANGODB_PWD,
    MOODLE_ARANGODB_VERSION: env.MOODLE_ARANGODB_VERSION,
  })

  const baseArangoDbConnection: arangojs_config = {
    url: env_config.MOODLE_ARANGODB_URL,
    auth: env_config.MOODLE_ARANGODB_USER
      ? {
          username: env_config.MOODLE_ARANGODB_USER,
          password: env_config.MOODLE_ARANGODB_PWD,
        }
      : undefined,
    arangoVersion: env_config.MOODLE_ARANGODB_VERSION,
    precaptureStackTraces: env_config.MOODLE_ARANGODB_ISDEV === 'true',
  }
  const arangoDbSecEnv: ArangoDbSecEnv = {
    database_connections: {
      mng: {
        ...baseArangoDbConnection,
        databaseName: `${env_config.MOODLE_ARANGODB_DB_PREFIX}_mng`,
      },
      data: {
        ...baseArangoDbConnection,
        databaseName: `${env_config.MOODLE_ARANGODB_DB_PREFIX}_data`,
      },
      iam: {
        ...baseArangoDbConnection,
        databaseName: `${env_config.MOODLE_ARANGODB_DB_PREFIX}_iam`,
      },
    },
  }
  return arangoDbSecEnv
}