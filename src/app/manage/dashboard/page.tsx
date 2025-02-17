import accountApiRequest from '@/apiRequest/account'
import { cookies } from 'next/headers'
import React from 'react'

export default async function Dashboard() {
  const cookieStore = cookies()
  const accessToken = (await cookieStore).get('accessToken')?.value!
  const result = await accountApiRequest.sMe(accessToken)
  return <div>{result.payload.data.email}</div>
}
