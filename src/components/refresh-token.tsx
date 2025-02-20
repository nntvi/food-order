'use strict'

import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import jwt from 'jsonwebtoken'
import authApiRequest from '@/apiRequest/auth'
// Paths that do not require authentication
const UNAUTHENTICATED_PATHS = ['/login', '/register', 'refresh-token']
export default function RefreshToken() {
  const pathname = usePathname()
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return
    let interval: any
    const checkAndRefresh = async () => {
      // không nên đưa logic lấy token ra khỏi function này
      // để mỗi lần được gọi thì sẽ lấy được token mới
      // tránh hiện tượng bug và lấy token đầu, xong gọi cho những lần tiếp theo
      const accessToken = getAccessTokenFromLocalStorage()
      const refreshToken = getRefreshTokenFromLocalStorage()
      if (!accessToken || !refreshToken) return
      const decodeAccessToken = jwt.decode(accessToken) as { exp: number; iat: number }
      const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number }
      // thời điểm hết hạn của token là tính theo epoch time (s)
      // còn khi dùng cú pháp new Date().getTime() thì sẽ trả về epoch time (ms)
      const now = Math.round(new Date().getTime() / 1000)
      // TH fresh token hết hạn => ko xử lý nữa
      // ví dụ access token có thời gian hết hạn là 10s
      // thì mình kiểm tra còn 1/3 thời gian (là 3s) thì sẽ cho refresh token lại
      // time còn lại = decodeAccessToken.exp - now
      // time hết hạn của access token = decodeAccessToken.exp - decodeAccessToken.iat
      if (decodeAccessToken.exp - now < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
        try {
          const res = await authApiRequest.refreshToken()
          setAccessTokenToLocalStorage(res.payload.data.accessToken)
          setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
        } catch (error) {
          clearInterval(interval)
        }
      }
    }
    // phải gọi lần đầu tiên vì interval sẽ chạy sau thời gian timeout
    checkAndRefresh()
    // timeout interval phải bé hơn time hết hạn của access token
    // ví dụ time hết hạn access token là 10s thì 1s mình check 1 lần
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefresh, TIMEOUT)
    return () => clearInterval(interval)
  }, [pathname])
  return null
}
