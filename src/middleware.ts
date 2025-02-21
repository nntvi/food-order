import { NextRequest, NextResponse } from 'next/server'

// vd:  pathname: /manage/dashboard
const privatePaths = ['/manage']
const unAuthPaths = ['/login']
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('accessToken')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  // Chưa đăng nhập(chưa có refreshToken)
  if (!refreshToken && privatePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', req.nextUrl).toString())
  }
  // Đăng nhập rồi nhưng accessToken hết hạn
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
    const url = new URL('/refresh-token', req.nextUrl)
    url.searchParams.set('refreshToken', req.cookies.get('refreshToken')?.value ?? '')
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url.toString())
  }
  // nếu đã login rồi thì không cho vào login nữa
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken && accessToken) {
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/manage/:path*', '/login']
}
