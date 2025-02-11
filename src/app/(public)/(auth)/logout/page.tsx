'use client'

import { getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function Logout() {
  const { mutateAsync: logoutMutation } = useLogoutMutation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  // đảm bảo cho logout chỉ gọi 1 lần thoi
  const ref = useRef<any>(null)
  useEffect(() => {
    if (ref.current || refreshTokenFromUrl !== getRefreshTokenFromLocalStorage()) return
    ref.current = logoutMutation
    logoutMutation().then(() => {
      setTimeout(() => {
        ref.current = null
      }, 1000)
      router.push('/login')
    })
  }, [logoutMutation, router, refreshTokenFromUrl])
  return <div className='min-h-screen flex items-center justify-center'>Logout...</div>
}
