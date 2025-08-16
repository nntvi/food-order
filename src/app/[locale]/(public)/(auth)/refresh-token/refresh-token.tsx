'use client'

import { checkAndRefresh, getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useRouter } from '@/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function RefreshToken() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const redirectPathname = searchParams.get('redirect')
  useEffect(() => {
    if (refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) {
      checkAndRefresh({
        onSuccess: () => {
          router.push(redirectPathname || '/')
        }
        // không cần xử lý onError vì nếu refreshToken hết hạn thì api sẽ trả về 401
        // và nếu trả về 401 thì http sẽ tự bắt và redirect về login
      })
    } else {
      router.push('/login')
    }
  }, [router, refreshTokenFromUrl, redirectPathname])
  return <div className='min-h-screen flex items-center justify-center'>Refresh token...</div>
}
