import authApiRequest from '@/apiRequest/auth'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { HttpError } from '@/lib/http'
export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType
  const cookieStore = cookies()
  // bắt đầu gọi server backend để set cookie nhé!!!
  try {
    const { payload } = await authApiRequest.sLogin(body)
    const {
      data: { accessToken, refreshToken }
    } = payload
    // mục đích của việc decode là lấy ra được thời điểm hết hạn của token
    // sau đó dùng nó để set thời hạn cho cookie
    const decodeAccessToken = jwt.decode(accessToken) as { exp: number }
    const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number }

    ;(await cookieStore).set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodeAccessToken.exp * 1000
    })
    ;(await cookieStore).set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodeRefreshToken.exp * 1000
    })

    // có nghĩa là api từ server back end trả về cho mình cái gì
    // thì từ cái route handler mình cũng trả về cái đó
    return Response.json(payload)
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status
      })
    } else {
      return Response.json(
        {
          message: 'Internal Server Error'
        },
        {
          status: 500
        }
      )
    }
  }
}
