'use client'
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/constants/type'
import { toast } from '@/hooks/use-toast'
import socket from '@/lib/socket'
import { cn, formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestOrderListQuery } from '@/queries/useGuest'
import { UpdateOrderResType } from '@/schemaValidations/order.schema'
import Image from 'next/image'
import { useEffect } from 'react'

const statusClass = {
  [OrderStatus.Delivered]: 'bg-green-100 text-green-800',
  [OrderStatus.Paid]: 'bg-blue-100 text-blue-800',
  [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.Processing]: 'bg-orange-100 text-orange-800',
  [OrderStatus.Rejected]: 'bg-red-100 text-red-800',
  default: 'bg-red-100 text-red-800'
}
export default function OrdersCart() {
  const { data, refetch } = useGuestOrderListQuery()
  const orders = data?.payload.data || []
  const totalPrice = orders.reduce((result, order) => {
    return result + order.dishSnapshot.price * order.quantity
  }, 0)

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }
    function onConnect() {
      console.log(socket.id)
    }
    function onDisconnect() {
      console.log('Disconnected from socket')
    }
    function onUpdateOrder(data: UpdateOrderResType['data']) {
      console.log('update-order', data)
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data
      refetch()
      toast({
        description: `Món ăn ${name} (SL: ${quantity}) vừa được cập nhật sang trạng thái "${getVietnameseOrderStatus(
          status
        )}"`,
        duration: 2000,
        variant: 'default'
      })
    }
    socket.on('update-order', onUpdateOrder)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('update-order', onUpdateOrder)
    }
  }, [])
  return (
    <div className='space-y-4 px-4 pt-6 pb-24 text-white'>
      {orders.map((order, index) => (
        <div key={order.id} className='flex items-center border-b border-gray-700 pb-4 gap-3'>
          <div className='flex items-center justify-center w-6 h-20'>
            <div className='w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center'>
              {index + 1}
            </div>
          </div>

          <div className='w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'>
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              width={80}
              height={80}
              className='object-cover w-full h-full'
            />
          </div>

          <div className='flex flex-1 items-center justify-between h-20'>
            <div className='flex flex-col justify-center'>
              <h3 className='text-base font-semibold text-white'>{order.dishSnapshot.name}</h3>
              <Badge
                variant='outline'
                className={cn('text-xs mt-1 px-2 py-0.5 border-none', statusClass[order.status] || statusClass.default)}
              >
                {getVietnameseOrderStatus(order.status)}
              </Badge>
            </div>

            {/* Giá x số lượng - cũng canh giữa */}
            <p className='text-sm text-gray-400 text-right whitespace-nowrap'>
              {formatCurrency(order.dishSnapshot.price)} x{' '}
              <span className='font-semibold text-white'>{order.quantity}</span>
            </p>
          </div>
        </div>
      ))}

      {/* Box tổng */}
      <div className='mt-6 flex justify-end'>
        <div className='bg-white text-black w-full max-w-md rounded-md px-4 py-3 shadow-sm flex justify-between items-center ml-[2.5rem]'>
          <span className='text-sm font-semibold'>Giỏ hàng · {orders.length} món</span>
          <span className='text-sm font-bold'>{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </div>
  )
}
