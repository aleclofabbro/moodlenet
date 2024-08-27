import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('X-Forwarded-For')
  ip && request.headers.set('x-ip', ip)
  const geo = request.geo
  geo && request.headers.set('x-geo', JSON.stringify(geo))
  const response =
    await NextResponse.next(/* {
    request: {
      // New request headers
      // headers: request.headers.append('x-ip',ip)),
      },
      } */)
  // })

  // Set a new response header `x-hello-from-middleware2`
  // response.headers.set('x-hello-from-middleware2', 'hello')
  // You can also set request headers in NextResponse.rewrite

  return response
}