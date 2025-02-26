'use client'

import { useAppContext } from '@/components/app-provider'
import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { set } from 'zod'

const menuItems = [
  {
    title: 'Món ăn',
    href: '/menu'
  },
  {
    title: 'Đơn hàng',
    href: '/orders'
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    authRequired: false // => chưa login thì show
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    authRequired: true // => login r mới show
  }
]
// Server: Món ăn, Đăng nhập. Do server không biết trạng thái đăng nhập của user
// Client: Đầu tiên client sẽ hiển thị là: Món ăn, Đăng nhập. (Vì được ren ra HTML trươc)
// Nhưng ngay sau đó client render ra: Món ăn, Đơn hàng, Quản lý, do check được trạng thái

export default function NavItems({ className }: { className?: string }) {
  const { isAuth } = useAppContext()

  return menuItems.map((item) => {
    if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    )
  })
}
