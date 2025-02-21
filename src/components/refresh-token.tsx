'use strict'

import { checkAndRefresh } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
// Paths that do not require authentication
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']
export default function RefreshToken() {
  const pathname = usePathname()
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return
    let interval: any

    // phải gọi lần đầu tiên vì interval sẽ chạy sau thời gian timeout
    checkAndRefresh({
      onError: () => {
        clearInterval(interval)
      }
    })
    // timeout interval phải bé hơn time hết hạn của access token
    // ví dụ time hết hạn access token là 10s thì 1s mình check 1 lần
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefresh, TIMEOUT)
    return () => clearInterval(interval)
  }, [pathname])
  return null
}
