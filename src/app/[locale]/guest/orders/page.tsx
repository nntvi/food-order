import OrdersCart from '@/app/[locale]/guest/orders/orders-cart'
import React from 'react'

export default function OrderPage() {
  return (
    <div>
      <div className='max-w-[400px] mx-auto space-y-4'>
        <h1 className='text-center text-xl font-bold'>Đơn hàng</h1>
        <OrdersCart />
      </div>
    </div>
  )
}
