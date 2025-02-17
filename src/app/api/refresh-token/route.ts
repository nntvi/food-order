import authApiRequest from '@/apiRequest/auth'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { HttpError } from '@/lib/http'
export async function POST(request: Request) {
  const cookieStore = cookies()
  const refreshToken = (await cookieStore).get('refreshToken')?.value
  if (!refreshToken) {
    return Response.json(
      {
        message: 'Không tìm thấy refreshToken'
      },
      {
        status: 401
      }
    )
  }
  // bắt đầu gọi server backend để set cookie nhé!!!
  try {
    const { payload } = await authApiRequest.sRefreshToken({ refreshToken })
    const { accessToken, refreshToken: newRefreshToken } = payload.data
    const decodeAccessToken = jwt.decode(accessToken) as { exp: number }
    const decodeRefreshToken = jwt.decode(newRefreshToken) as { exp: number }

    ;(await cookieStore).set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodeAccessToken.exp * 1000
    })
    ;(await cookieStore).set('refreshToken', newRefreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodeRefreshToken.exp * 1000
    })

    // có nghĩa là api từ server back end trả về cho mình cái gì
    // thì từ cái route handler mình cũng trả về cái đó
    return Response.json(payload)
  } catch (error: any) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status
      })
    } else {
      return Response.json(
        {
          message: error?.message ?? 'Internal Server Error'
        },
        {
          status: 401
        }
      )
    }
  }
}
