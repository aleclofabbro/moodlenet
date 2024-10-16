import { http_bind } from '@moodle/bindings-node'
import { MoodleDomain, primarySession } from '@moodle/domain'
import {} from '@moodle/domain'
import { isAdminUserSession, isAuthenticatedUserSession } from '@moodle/module/iam/lib'
import i18next from 'i18next'
import { headers } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'
import { userAgent } from 'next/server'
import assert from 'node:assert'
import { sitepaths } from '../common/utils/sitepaths'
import { getAuthTokenCookie } from './auth'
import { generateUlid } from '@moodle/lib-id-gen'
import { createMoodleDomainProxy } from '@moodle/domain/lib'
const MOODLE_NET_NEXTJS_PRIMARY_ENDPOINT_URL = process.env.MOODLE_NET_NEXTJS_PRIMARY_ENDPOINT_URL

const requestTarget = MOODLE_NET_NEXTJS_PRIMARY_ENDPOINT_URL ?? 'http://localhost:8000'

export function priAccess(): MoodleDomain['primary'] {
  return _domainAccess().primary
}

const request_session_async_storage = new AsyncLocalStorage<MoodleDomain>()

function _domainAccess(): MoodleDomain {
  const _existing_currentStore = request_session_async_storage.getStore()
  if (_existing_currentStore) {
    console.log('using existing MoodleDomain')
    return _existing_currentStore
  }
  console.log('creating new MoodleDomain')

  const primarySessionPromise = getPrimarySession()

  const trnspClient = http_bind.client()

  const moodle_domain = createMoodleDomainProxy({
    async ctrl({ domainMsg }) {
      return trnspClient(
        {
          ...domainMsg,
          primarySession: await primarySessionPromise,
        },
        requestTarget,
      )
    },
  })
  request_session_async_storage.enterWith(moodle_domain)
  return moodle_domain
  // FIXME:
  // The following block should refresh the session token before it expires
  // we need to fast-check-no-validation for expiration (jose.decodeJwt() ),
  // if the token is about to expire, validate token, if valid generate new and set cookie.
  // however we can't set the cookie here :
  // [Error]: Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
  //
  // if (userSession.sessionToken) {
  //   const [valid, info] = iam.noValidationParseUserSessionToken(
  //     userSession.sessionToken,
  //   )
  //   if (valid && !info.expired && info.expires.inSecs < 5 * 60) {
  //     !! VALIDATE IT BEFORE REFRESHING !!
  //     ap.mod.iam_lib.session
  //       .generateSession({ userId: info.userData.id })
  //       .then(([generated, session]) => {
  //         if (!generated) {
  //           return
  //         }
  //         setAuthTokenCookie(session)
  //       })
  //   }
  // }

  return moodle_domain
}

export async function getUserSession() {
  const { userSession } = await priAccess().iam.session.getUserSession()
  return userSession
}

export async function getAuthenticatedUserSessionOrRedirectToLogin() {
  const maybe_authenticatedUserSession = await getUserSession()
  if (isAuthenticatedUserSession(maybe_authenticatedUserSession)) {
    return maybe_authenticatedUserSession
  }

  const loginUrl = sitepaths.login({
    query: {
      redirect: headers().get('x-pathname') ?? sitepaths(),
    },
  })
  redirect(loginUrl, RedirectType.replace)
}

export async function getAdminUserSessionOrRedirect(path = '/') {
  const authenticatedUserSession = await getAuthenticatedUserSessionOrRedirectToLogin()
  if (!isAdminUserSession(authenticatedUserSession)) {
    redirect('/')
  }
  return authenticatedUserSession
}

async function getPrimarySession() {
  //FIXME: why is it here inside ?
  i18next.init({
    // ns: ['common', 'moduleA'],
    // defaultNS: 'moduleA',
    returnEmptyString: false,
  })

  const _headers = headers()
  const xHost = _headers.get('x-host')
  // const xPort = _headers.get('x-port')
  const xProto = _headers.get('x-proto') ?? 'http'
  const xClientIp = _headers.get('x-client-ip') ?? undefined
  const xUrl = _headers.get('x-url') ?? undefined
  const xMode = _headers.get('x-mode') ?? undefined
  const xGeo = JSON.parse(_headers.get('x-geo') ?? '{}')
  const ua = userAgent({ headers: _headers })
  assert(xHost, 'x-host not found in headers')
  const primarySession: primarySession = {
    id: await generateUlid(),
    token: getAuthTokenCookie().sessionToken,
    app: {
      name: 'moodlenetWebapp',
      version: '0.1',
    },
    protocol: {
      type: 'http',
      secure: xProto === 'https',
      mode: xMode,
      url: xUrl,
      clientIp: xClientIp,
      ua: {
        name: ua.ua,
        isBot: ua.isBot,
      },
    },
    domain: xHost,
    platforms: {
      local: {
        type: 'nodeJs',
        version: process.version,
        //env: process.env,
      },
      remote: {
        type: 'browser',
        version: ua.browser.version,
        name: ua.browser.name,
        geo: xGeo,
        cpu: ua.cpu,
        device: ua.device,
        engine: ua.engine,
        os: ua.os,
      },
    },
  }
  return primarySession
}
