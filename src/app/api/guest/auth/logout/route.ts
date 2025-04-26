import guestApiRequest from '@/apiRequest/guest'
import { cookies } from 'next/headers'
export async function POST() {
  const cookieStore = cookies()
  const accessToken = (await cookieStore).get('accessToken')?.value
  const refreshToken = (await cookieStore).get('refreshToken')?.value
  ;(await cookieStore).delete('accessToken')
  ;(await cookieStore).delete('refreshToken')
  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: 'Không nhận được access hoặc refresh token'
      },
      {
        status: 200
      }
    )
  }
  try {
    const result = await guestApiRequest.sLogout({
      accessToken,
      refreshToken
    })
    return Response.json(result.payload)
  } catch (error) {
    return Response.json(
      {
        message: 'Lỗi khi gọi api đến server'
      },
      {
        status: 200
      }
    )
  }
}
