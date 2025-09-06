import { useAppStore } from '@/components/app-provider'
import { handleErrorApi } from '@/lib/utils'
import { usePathname, useRouter } from '@/i18n/routing'
import { useLogoutMutation } from '@/queries/useAuth'
import { useEffect } from 'react'
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']

export default function ListenLogoutSocket() {
  const pathname = usePathname()
  const router = useRouter()
  const { isPending, mutateAsync } = useLogoutMutation()
  const socket = useAppStore((state) => state.socket)
  const setRole = useAppStore((state) => state.setRole)
  const disconnectSocket = useAppStore((state) => state.disconnectSocket)
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return
    async function onLogout() {
      if (isPending) return
      try {
        await mutateAsync()
        setRole(undefined)
        disconnectSocket()
        router.push('/')
      } catch (error) {
        handleErrorApi({
          error
        })
      }
    }
    socket?.on('logout', onLogout)
    return () => {
      socket?.off('logout', onLogout)
    }
  }, [socket, pathname, isPending, mutateAsync, setRole, disconnectSocket, router])

  return null
}
