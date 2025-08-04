'use client'

import { useAppContext } from '@/components/app-provider'
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

function LogoutPage() {
  const { mutateAsync: logoutMutation } = useLogoutMutation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setRole, disconnectSocket } = useAppContext()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accessToken')
  // đảm bảo cho logout chỉ gọi 1 lần thoi
  const ref = useRef<any>(null)
  useEffect(() => {
    if (
      ref.current ||
      (refreshTokenFromUrl && refreshTokenFromUrl !== getRefreshTokenFromLocalStorage()) ||
      (accessTokenFromUrl && accessTokenFromUrl !== getAccessTokenFromLocalStorage())
    ) {
      router.push('/')
    } else {
      ref.current = logoutMutation
      logoutMutation().then(() => {
        setTimeout(() => {
          ref.current = null
        }, 1000)
        disconnectSocket()
        setRole(undefined)
        router.push('/login')
      })
    }
  }, [logoutMutation, router, refreshTokenFromUrl, accessTokenFromUrl, setRole, disconnectSocket])
  return <div className='min-h-screen flex items-center justify-center'>Logout...</div>
}
export default function Logout() {
  return (
    <Suspense fallback={null}>
      <LogoutPage />
    </Suspense>
  )
}
