import { Role } from '@/constants/type'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '@/types/jwt.types'

const managePaths = ['/manage']
const guestPaths = ['/guest']
const onlyOwnerPaths = ['/manage/accounts']
const privatePaths = [...managePaths, ...guestPaths]
const unAuthPaths = ['/login']
export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}
// vd:  pathname: /manage/dashboard
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('accessToken')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  // Chưa đăng nhập(chưa có refreshToken)
  if (!refreshToken && privatePaths.some((path) => pathname.startsWith(path))) {
    const url = new URL('/login', req.nextUrl)
    url.searchParams.set('clearToken', 'true')
    return NextResponse.redirect(url.toString())
  }
  // Đăng nhập rồi nhưng accessToken hết hạn
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
    const url = new URL('/refresh-token', req.nextUrl)
    url.searchParams.set('refreshToken', req.cookies.get('refreshToken')?.value ?? '')
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url.toString())
  }

  // Vào không đúng role, redirect về trang chủ
  const role = decodeToken(refreshToken as string)?.role
  // Guest nhưng cố vào role Owner
  const isGuestGoToManagePath = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path))
  // Không phải Guest nhưng cố vào role Guest
  const isNotGuestGoToGuestPath = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path))
  // Không phải Owner nhưng cố tình truy cập vào các route dành cho owner
  const isNotOwnerGoToOwnerPath = role !== Role.Owner && onlyOwnerPaths.some((path) => pathname.startsWith(path))
  if (isGuestGoToManagePath || isNotGuestGoToGuestPath || isNotOwnerGoToOwnerPath) {
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
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
