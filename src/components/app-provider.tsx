'use client'
import RefreshToken from '@/components/refresh-token'
import { getAccessTokenFromLocalStorage, removeTokenLocalStorage } from '@/lib/utils'
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
  setIsAuth: (isAuth: boolean) => {}
})

export const useAppContext = () => {
  return useContext(AppContext)
}
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuthState] = useState(false)
  const setIsAuth = (isAuth: boolean) => {
    if (isAuth) {
      setIsAuthState(isAuth)
    } else {
      setIsAuthState(false)
      removeTokenLocalStorage()
    }
  }
  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      setIsAuthState(true)
    }
  }, [])

  // Nếu dùng react 19 và next 15 thì ko cần AppContext.Provider
  return (
    <AppContext value={{ isAuth, setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext>
  )
}

export default AppProvider
