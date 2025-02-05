import accountApiRequest from '@/apiRequest/account'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useAccountMe = () => {
  return useQuery({
    queryKey: ['account-profile'],
    queryFn: accountApiRequest.me
  })
}

export const useUpdateMe = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe
  })
}
