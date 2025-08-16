'use client'
import Quantity from '@/app/[locale]/guest/menu/quantity'
import { Button } from '@/components/ui/button'
import { DishStatus } from '@/constants/type'
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils'
import { useRouter } from '@/navigation'
import { useGetDishList } from '@/queries/useDish'
import { useGetOrderMutation } from '@/queries/useGuest'
import { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema'
import Image from 'next/image'
import { useState } from 'react'

export default function MenuOrder() {
  const { data } = useGetDishList()
  const dishes = data?.payload.data || []
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])
  const { mutateAsync } = useGetOrderMutation()
  const router = useRouter()
  const totalPrice = dishes.reduce((result, dish) => {
    const order = orders.find((order) => order.dishId === dish.id)
    if (!order) return result
    return result + dish.price * order.quantity
  }, 0)
  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId)
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId)
      if (index === -1) {
        // ban đầu order ko món này => tìm ra -1
        // cho nên nếu chưa có gì thì giờ sẽ bắt đầu thêm vào
        return [...prevOrders, { dishId, quantity }]
      }
      const newOrders = [...prevOrders]
      newOrders[index] = { ...newOrders[index], quantity }
      return newOrders
    })
  }
  const handleOrder = async () => {
    try {
      await mutateAsync(orders)
      router.push('/guest/orders')
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }
  return (
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish.id}
            className={cn('flex gap-4 ', {
              'pointer-events-none': dish.status === DishStatus.Unavailable
            })}
          >
            <div className='flex-shrink-0 relative'>
              <span className='absolute top-0 left-0 w-full h-full flex justify-center items-center'>
                {dish.status === DishStatus.Unavailable && 'Hết hàng'}
              </span>
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className='object-cover w-[80px] h-[80px] rounded-md'
              />
            </div>
            <div className='space-y-1'>
              <h3 className='text-sm'>{dish.name}</h3>
              <p className='text-xs'>{dish.description}</p>
              <p className='text-xs font-semibold'>{formatCurrency(dish.price)}</p>
            </div>
            <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
              <Quantity
                onChange={(value) => handleQuantityChange(dish.id, value)}
                value={orders.find((order) => order.dishId === dish.id)?.quantity || 0}
              />
            </div>
          </div>
        ))}
      <div className='sticky bottom-0'>
        <Button className='w-full justify-between' onClick={handleOrder} disabled={orders.length === 0}>
          <span>Giỏ hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  )
}
