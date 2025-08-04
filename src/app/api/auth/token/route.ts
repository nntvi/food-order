import { HttpError } from '@/lib/http'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
export async function POST(request: Request) {
  const body = (await request.json()) as {
    accessToken: string
    refreshToken: string
  }

  const { accessToken, refreshToken } = body
  const cookieStore = cookies()
  try {
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

    return Response.json(body)
  } catch (error) {
    console.log('🚀 ~ POST ~ error:', error)
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
