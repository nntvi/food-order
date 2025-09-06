import { Role } from '@/constants/type'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '@/types/jwt.types'

const managePaths = ['/vi/manage', '/en/manage']
const guestPaths = ['/vi/guest', '/en/guest']
const onlyOwnerPaths = ['/vi/manage/accounts', '/en/manage/accounts']
const privatePaths = [...managePaths, ...guestPaths]
const unAuthPaths = ['/vi/login', '/en/login']
import { defaultLocale } from '@/config'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

// vd:  pathname: /manage/dashboard
export function middleware(req: NextRequest) {
  const handleI18nRouting = createMiddleware(routing)
  const response = handleI18nRouting(req)
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('accessToken')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  const locale = req.cookies.get('NEXT_LOCALE')?.value || defaultLocale
  console.log('🚀 ~ middleware ~ locale:', locale)
  // 1. Chưa đăng nhập(chưa có refreshToken)
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL(`/${locale}/login`, req.nextUrl)
    url.searchParams.set('clearToken', 'true')
    return NextResponse.redirect(url.toString())
    // response.headers.set('x-middleware-rewrite', url.toString())
    // return response
  }
  // 2. Đăng nhập rồi nhưng accessToken hết hạn
  if (refreshToken) {
    // 2.1 Nếu cố tình vào trang login sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl).toString())
      // response.headers.set('x-middleware-rewrite', new URL('/', req.nextUrl).toString())
      // return response
    }
    // 2.2 Nhưng accessToken lại hết hạn
    if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken) {
      const url = new URL(`/${locale}/refresh-token`, req.nextUrl)
      url.searchParams.set('refreshToken', req.cookies.get('refreshToken')?.value ?? '')
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url.toString())
      // response.headers.set('x-middleware-rewrite', url.toString())
      // return response
    }
    // 2.3 Vào không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken as string)?.role
    // Guest nhưng cố vào role Owner
    const isGuestGoToManagePath = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path))
    // Không phải Guest nhưng cố vào role Guest
    const isNotGuestGoToGuestPath = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path))
    // Không phải Owner nhưng cố tình truy cập vào các route dành cho owner
    const isNotOwnerGoToOwnerPath = role !== Role.Owner && onlyOwnerPaths.some((path) => pathname.startsWith(path))
    if (isGuestGoToManagePath || isNotGuestGoToGuestPath || isNotOwnerGoToOwnerPath) {
      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl).toString())
      // response.headers.set('x-middleware-rewrite', new URL('/', req.nextUrl).toString())
      // return response
    }
    return response
  }
  return response
}

export const config = {
  matcher: ['/', '/(vi|en)/:path*']
}
