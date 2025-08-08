'use client'
import ListenLogoutSocket from '@/components/listen-logout-socket'
import RefreshToken from '@/components/refresh-token'
import { generateSocketInstance, getAccessTokenFromLocalStorage, removeTokenLocalStorage } from '@/lib/utils'
import { decodeToken } from '@/middleware'
import { RoleType } from '@/types/jwt.types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { create } from 'zustand'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})
// const AppContext = createContext({
//   isAuth: false,
//   role: undefined as RoleType | undefined,
//   setRole: (role?: RoleType | undefined) => {},
//   socket: undefined as Socket | undefined,
//   setSocket: (socket: Socket | undefined) => {},
//   disconnectSocket: () => {}
// })
type AppStoreType = {
  isAuth: boolean
  role: RoleType | undefined
  setRole: (role?: RoleType | undefined) => void
  socket: Socket | undefined
  setSocket: (socket: Socket | undefined) => void
  disconnectSocket: () => void
}
export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {
    set({ role, isAuth: Boolean(role) })
    if (!role) {
      removeTokenLocalStorage()
    }
  },
  socket: undefined as Socket | undefined,
  setSocket: (socket: Socket | undefined) => {
    set({ socket })
  },
  disconnectSocket: () => {
    set((state) => {
      state.socket?.disconnect()
      return { socket: undefined }
    })
  }
}))

// export const useAppContext = () => {
//   return useContext(AppContext)
// }
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const setRoleState = useAppStore((state) => state.setRole)
  const setSocket = useAppStore((state) => state.setSocket)
  // const [socket, setSocket] = useState<Socket | undefined>()
  // const [role, setRoleState] = useState<RoleType | undefined>()
  const count = useRef(0)
  // const isAuth = Boolean(role)
  // const setRole = (role?: RoleType | undefined) => {
  //   setRoleState(role)
  //   if (!role) {
  //     removeTokenLocalStorage()
  //   }
  // }
  useEffect(() => {
    if (count.current === 0) {
      const accessToken = getAccessTokenFromLocalStorage()
      if (accessToken) {
        const { role } = decodeToken(accessToken)
        setRoleState(role)
        setSocket(generateSocketInstance(accessToken))
      }
      count.current++
    }
  }, [setRoleState, setSocket])
  // const disconnectSocket = () => {
  //   socket?.disconnect()
  //   setSocket(undefined)
  // }
  // Nếu dùng react 19 và next 15 thì ko cần AppContext.Provider
  return (
    // <AppContext value={{ isAuth, role, setRole, socket, setSocket, disconnectSocket }}>
    <QueryClientProvider client={queryClient}>
      {children}
      <RefreshToken />
      <ListenLogoutSocket />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    // </AppContext>
  )
}

export default AppProvider
