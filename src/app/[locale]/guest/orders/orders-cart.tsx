'use client'
import { useAppStore } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/constants/type'
import { toast } from '@/hooks/use-toast'
import { cn, formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestOrderListQuery } from '@/queries/useGuest'
import { GuestCreateOrdersResType } from '@/schemaValidations/guest.schema'
import { UpdateOrderResType } from '@/schemaValidations/order.schema'
import { CheckCircle, ShoppingCart, Wallet } from 'lucide-react'
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
  const socket = useAppStore((state) => state.socket)
  const { data, refetch } = useGuestOrderListQuery()
  const orders = data?.payload.data || []
  const { unPaid, paid } = orders.reduce(
    (result, order) => {
      if (
        order.status === OrderStatus.Delivered ||
        order.status === OrderStatus.Pending ||
        order.status === OrderStatus.Processing
      ) {
        return {
          ...result,
          unPaid: result.unPaid + order.dishSnapshot.price * order.quantity
        }
      } else if (order.status === OrderStatus.Paid) {
        return {
          ...result,
          paid: result.paid + order.dishSnapshot.price * order.quantity
        }
      }
      return result
    },
    {
      unPaid: 0,
      paid: 0
    }
  )

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }
    function onConnect() {
      console.log(socket?.id)
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
    function onPayment(data: GuestCreateOrdersResType['data']) {
      const { guest } = data[0]
      toast({
        description: `Đơn hàng thanh toán từ khách ${guest?.name} (Bàn số ${guest?.tableNumber})`,
        duration: 5000,
        variant: 'default'
      })
      refetch()
    }
    socket?.on('update-order', onUpdateOrder)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('payment', onPayment)
    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetch])
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
      <div className='text-white w-full max-w-md rounded-lg px-4 py-4 shadow-md bg-gray-800'>
        {/* Tổng số món */}
        <div className='flex justify-between items-center text-sm font-semibold mb-2'>
          <div className='flex items-center'>
            <ShoppingCart className='w-4 h-4 mr-2 text-white' />
            <span>Giỏ hàng:</span>
          </div>
          <span className='font-bold'>{orders.length} món</span>
        </div>

        {/* Chưa thanh toán */}
        <div className='flex justify-between items-center text-sm mb-1'>
          <div className='flex items-center'>
            <Wallet className='w-4 h-4 mr-2 text-yellow-500' />
            <span className='font-semibold text-yellow-500'>Chưa thanh toán:</span>
          </div>
          <span className='font-bold text-yellow-400'>{formatCurrency(unPaid)}</span>
        </div>

        {/* Đã thanh toán */}
        {paid !== 0 && (
          <div className='flex justify-between items-center text-sm'>
            <div className='flex items-center'>
              <CheckCircle className='w-4 h-4 mr-2 text-green-500' />
              <span className='font-semibold text-green-500'>Đã thanh toán:</span>
            </div>
            <span className='font-bold text-green-400'>{formatCurrency(paid)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
