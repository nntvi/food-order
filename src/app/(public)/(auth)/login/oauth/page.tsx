'use client'
import { useAppContext } from '@/components/app-provider'
import { toast } from '@/hooks/use-toast'
import { generateSocketInstance } from '@/lib/utils'
import { decodeToken } from '@/middleware'
import { useSetTokenToCookieMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function OAuthPage() {
  const { mutateAsync } = useSetTokenToCookieMutation()
  const router = useRouter()
  const count = useRef(0)
  const { setRole, setSocket } = useAppContext()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('accessToken')
  const refreshToken = searchParams.get('refreshToken')
  const message = searchParams.get('message')
  useEffect(() => {
    if (accessToken && refreshToken) {
      if (count.current === 0) {
        const { role } = decodeToken(accessToken as string)
        mutateAsync({ accessToken, refreshToken })
          .then(() => {
            setRole(role)
            setSocket(generateSocketInstance(accessToken as string))
            router.push('/manage/dashboard')
          })
          .catch((e) => {
            toast({
              description: e.message || 'Có lỗi xảy ra'
            })
          })
        count.current++
      }
    } else {
      if (count.current === 0) {
        toast({
          description: message || 'Có lỗi xảy ra'
        })
        count.current++
      }
    }
  }, [accessToken, refreshToken, setRole, setSocket, router, mutateAsync, message])
  return <div />
}
