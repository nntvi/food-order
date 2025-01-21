import { NextRequest, NextResponse } from 'next/server'

const privatePaths = ['/manage']
const unAuthPaths = ['/login']
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuth = Boolean(req.cookies.get('accessToken')?.value)
  // vd:  pathname: /manage/dashboard
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isAuth) {
    // nếu muốn vào private path mà chưa login thì redirect về login
    return NextResponse.redirect(new URL('/login', req.nextUrl).toString())
  } else if (unAuthPaths.some((path) => pathname.startsWith(path)) && isAuth) {
    // nếu đã login rồi thì không cho vào login nữa
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/manage/:path*', '/login']
}
