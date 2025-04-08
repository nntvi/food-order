import dishApiRequest from '@/apiRequest/dish'
import { UpdateDishBodyType } from '@/schemaValidations/dish.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetDishList = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: dishApiRequest.list
  })
}

export const useGetDish = ({ id, enabled }: { id: number; enabled?: boolean }) => {
  return useQuery({
    queryKey: ['dishes', id],
    queryFn: () => dishApiRequest.getDish(id),
    enabled
  })
}

export const useDeleteDish = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishApiRequest.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] })
    }
  })
}

export const useAddDish = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishApiRequest.createDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] })
    }
  })
}

export const useUpdateDish = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDishBodyType & { id: number }) => dishApiRequest.updateDish(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'], exact: true })
    }
  })
}
