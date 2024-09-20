import { session_token } from '@moodle/lib-ddd'
import { _void, ok_ko } from '@moodle/lib-types'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { session_token_payload_data, TOKEN_PAYLOAD_PROP } from '../types'
import { UserData } from '../types/user'

export function noValidationParseUserSessionToken(sessionToken: session_token): ok_ko<
  {
    expired: boolean
    expires: { inSecs: number; date: Date }
    userData: UserData
  },
  void
> {
  try {
    const decoded = jwtDecode<session_token_payload_data & JwtPayload>(sessionToken)
    if (!decoded.exp) {
      throw 'no exp!'
    }
    if (decoded[TOKEN_PAYLOAD_PROP].v1_0 !== 'userSession') {
      throw 'invalid token'
    }

    const expirationDate = new Date(decoded.exp * 1e3)
    const inSecs = Math.floor((expirationDate.getTime() - Date.now()) / 1000)
    const expired = inSecs <= 0
    const userData = decoded[TOKEN_PAYLOAD_PROP].user
    return [true, { userData, expired, expires: { inSecs, date: expirationDate } }]
  } catch {
    return [false, _void]
  }
}
