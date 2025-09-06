import RefreshToken from '@/app/[locale]/(public)/(auth)/refresh-token/refresh-token'
import { Suspense } from 'react'

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefreshToken />
    </Suspense>
  )
}
