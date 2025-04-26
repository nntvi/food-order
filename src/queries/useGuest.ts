import guestApiRequest from '@/apiRequest/guest'
import { useMutation } from '@tanstack/react-query'

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
