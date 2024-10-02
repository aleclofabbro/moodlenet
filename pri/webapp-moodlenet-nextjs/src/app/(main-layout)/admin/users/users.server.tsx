'use server'

import { user_role } from 'domain/src/iam'
import { priAccess } from '../../../../lib/server/session-access'
import { UserRow } from './users.client'

export async function searchUsers({ textSearch }: { textSearch: string }) {
  const { users } = await priAccess().iam.admin.searchUsers({ textSearch })
  const userRows = users.map<UserRow>(user => {
    return {
      id: user.id,
      displayName: user.displayName,
      contacts: user.contacts,
      roles: user.roles,
    }
  })
  return userRows
}
export async function editUserRole({
  userId,
  action,
  role,
}: {
  userId: string
  role: user_role
  action: 'set' | 'unset'
}) {
  const [done, result] = await priAccess().iam.admin.editUserRoles({ userId, role, action })
  return done ? result.updatedRoles : []
}