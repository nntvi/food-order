import orderApiRequest from '@/apiRequest/order'
import { UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateOrderBodyType & { id: number }) => orderApiRequest.updateOrder(id, body)
  })
}
export const useGetOrderListQuery = () => {
  return useQuery({
    queryFn: orderApiRequest.list,
    queryKey: ['orders']
  })
}
