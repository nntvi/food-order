'use client'
import RefreshToken from '@/components/refresh-token'
import { decodeToken, getAccessTokenFromLocalStorage, removeTokenLocalStorage } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createContext, useContext, useEffect, useState } from 'react'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  }
})
const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {}
})

export const useAppContext = () => {
  return useContext(AppContext)
}
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<RoleType | undefined>()
  const isAuth = Boolean(role)
  const setRole = (role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) {
      removeTokenLocalStorage()
    }
  }
  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      const { role } = decodeToken(accessToken)
      setRoleState(role)
    }
  }, [])

  // Nếu dùng react 19 và next 15 thì ko cần AppContext.Provider
  return (
    <AppContext value={{ isAuth, role, setRole }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext>
  )
}

export default AppProvider
