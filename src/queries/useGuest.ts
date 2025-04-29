import guestApiRequest from '@/apiRequest/guest'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useLoginGuestMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.login
  })
}
export const useLogoutGuestMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.logout
  })
}

export const useGetOrderMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.order
  })
}
export const useGuestOrderListQuery = () => {
  return useQuery({
    queryFn: guestApiRequest.getOrderList,
    queryKey: ['orders']
  })
}
