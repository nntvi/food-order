import { mediaApiRequest } from '@/apiRequest/media'
import { useMutation } from '@tanstack/react-query'

export const uploadMediaMutation = () => {
  return useMutation({
    mutationFn: mediaApiRequest.upload
  })
}
