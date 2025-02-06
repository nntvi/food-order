import accountApiRequest from '@/apiRequest/account'
import { ChangePasswordBodyType } from '@/schemaValidations/account.schema'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function PUT(request: Request) {
  const cookiesStore = cookies()
  const body = (await request.json()) as ChangePasswordBodyType
  const accessToken = (await cookiesStore).get('accessToken')?.value
  if (!accessToken) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { payload } = await accountApiRequest.sChangePasswordV2(accessToken, body)
    const decodedAccessToken = jwt.decode(payload.data.accessToken) as { exp: number }
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as { exp: number }
    ;(await cookiesStore).set('accessToken', payload.data.accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000
    })
    ;(await cookiesStore).set('refreshToken', payload.data.refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000
    })
    return Response.json(payload)
  } catch (error: any) {
    return Response.json(
      {
        message: error.message ?? 'Có lỗi xảy ra'
      },
      {
        status: error.status ?? 500
      }
    )
  }
}
