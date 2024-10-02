import { Database } from 'arangojs'
import { userDocument } from '../sec/db-arango-iam-lib/types'
import { database_connections } from './types'
import { userHomeDocument } from '../sec/db-arango-user-home-lib/types'

export function getDbStruct(database_connections: database_connections) {
  const baseConnectionConfig = {
    keepalive: true,
    retryOnConflict: 5,
  }
  const data_db = new Database({ ...baseConnectionConfig, ...database_connections.data })
  const iam_db = new Database({ ...baseConnectionConfig, ...database_connections.iam })
  const mng_db = new Database({ ...baseConnectionConfig, ...database_connections.mng })
  const sys_db = new Database({
    ...baseConnectionConfig,
    ...database_connections.mng,
    databaseName: '_system',
  })

  return {
    connections: database_connections,
    sys_db,
    mng: {
      db: mng_db,
      coll: {
        module_configs: mng_db.collection('module_configs'),
        migrations: mng_db.collection('migrations'),
      },
    },
    data: {
      db: data_db,
      coll: {
        userHome: data_db.collection<userHomeDocument>('userHome'),
      },
    },
    iam: {
      db: iam_db,
      coll: {
        user: iam_db.collection<userDocument>('user'),
      },
    },
  }
}
