import { PayGuestOrdersBodyType } from './../../../server/src/schemaValidations/order.schema'
import orderApiRequest from '@/apiRequest/order'
import { GetOrdersQueryParamsType, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({ orderId, ...body }: UpdateOrderBodyType & { orderId: number }) =>
      orderApiRequest.updateOrder(orderId, body)
  })
}
export const useGetOrderListQuery = (queryParams: GetOrdersQueryParamsType) => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderList(queryParams),
    queryKey: ['orders', queryParams]
  })
}

export const useGetOrderDetailQuery = (orderId: number) => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderDetail(orderId),
    queryKey: ['orders', orderId],
    enabled: Boolean(orderId)
  })
}

export const usePayOderMutation = () => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => orderApiRequest.pay(body)
  })
}
export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: orderApiRequest.createOrder
  })
}
