import { toast } from '@/hooks/use-toast'
import { EntityError } from '@/lib/http'
import { clsx, type ClassValue } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import jwt from 'jsonwebtoken'
import authApiRequest from '@/apiRequest/auth'
import { DishStatus, OrderStatus, TableStatus } from '@/constants/type'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: 2000
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message
      })
    })
  } else {
    toast({
      title: 'Lỗi',
      description: error.message ?? 'Lỗi không xác định',
      variant: 'destructive',
      duration
    })
  }
}

export const isBrowser = typeof window !== 'undefined'
export const getAccessTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem('accessToken') : null
}
export const getRefreshTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem('refreshToken') : null
}

export const setAccessTokenToLocalStorage = (accessToken: string) => {
  if (isBrowser) {
    localStorage.setItem('accessToken', accessToken)
  }
}
export const setRefreshTokenToLocalStorage = (refreshToken: string) => {
  if (isBrowser) {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export const removeTokenLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}
export const checkAndRefresh = async (param?: { onError?: () => void; onSuccess?: () => void }) => {
  // không nên đưa logic lấy token ra khỏi function này
  // để mỗi lần được gọi thì sẽ lấy được token mới
  // tránh hiện tượng bug và lấy token đầu, xong gọi cho những lần tiếp theo
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  if (!accessToken || !refreshToken) return
  const decodeAccessToken = jwt.decode(accessToken) as { exp: number; iat: number }
  const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number; iat: number }
  // thời điểm hết hạn của token là tính theo epoch time (s)
  // còn khi dùng cú pháp new Date().getTime() thì sẽ trả về epoch time (ms)
  const now = new Date().getTime() / 1000 - 1
  // TH fresh token hết hạn => cho logout
  if (decodeRefreshToken.exp <= now) {
    removeTokenLocalStorage()
    return param?.onError && param.onError()
  }
  // ví dụ access token có thời gian hết hạn là 10s
  // thì mình kiểm tra còn 1/3 thời gian (là 3s) thì sẽ cho refresh token lại
  // time còn lại = decodeAccessToken.exp - now
  // time hết hạn của access token = decodeAccessToken.exp - decodeAccessToken.iat
  if (decodeAccessToken.exp - now < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
    try {
      const res = await authApiRequest.refreshToken()
      const { accessToken, refreshToken } = res.payload.data
      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      param?.onError && param.onError()
    }
  }
}

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Đã phục vụ'
    case OrderStatus.Paid:
      return 'Đã thanh toán'
    case OrderStatus.Pending:
      return 'Chờ xử lý'
    case OrderStatus.Processing:
      return 'Đang nấu'
    default:
      return 'Từ chối'
  }
}

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}
