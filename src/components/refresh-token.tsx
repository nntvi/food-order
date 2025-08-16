'use client'
import { checkAndRefresh } from '@/lib/utils'
import { Suspense, useEffect } from 'react'
import { useAppStore } from '@/components/app-provider'
import { usePathname, useRouter } from '@/navigation'
// Paths that do not require authentication
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']

export default function RefreshToken() {
  const pathname = usePathname()
  const router = useRouter()
  const socket = useAppStore((state) => state.socket)
  const setSocket = useAppStore((state) => state.setSocket)
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return
    let interval: any

    const onRefreshToken = (force?: boolean) =>
      checkAndRefresh({
        onError: () => {
          clearInterval(interval)
          socket?.disconnect()
          setSocket(undefined)
          router.push('/login')
        },
        force
      })
    // phải gọi lần đầu tiên vì interval sẽ chạy sau thời gian timeout
    onRefreshToken()

    // timeout interval phải bé hơn time hết hạn của access token
    // ví dụ time hết hạn access token là 10s thì 1s mình check 1 lần
    const TIMEOUT = 1000
    interval = setInterval(onRefreshToken, TIMEOUT)

    if (socket?.connected) {
      onConnect()
    }
    function onConnect() {
      console.log(socket?.id)
    }
    function onDisconnect() {
      console.log('Disconnected from socket')
    }

    function onRefreshTokenSocket() {
      onRefreshToken(true)
    }
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('refresh-token', onRefreshTokenSocket)
    return () => {
      clearInterval(interval)
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('refresh-token', onRefreshToken)
    }
  }, [pathname, router, socket])
  return null
}
