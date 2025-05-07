import orderApiRequest from '@/apiRequest/order'
import { GetOrdersQueryParamsType, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateOrderBodyType & { id: number }) => orderApiRequest.updateOrder(id, body)
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
    queryKey: ['orders', orderId]
  })
}
