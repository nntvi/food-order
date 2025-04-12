import tableApiRequest from '@/apiRequest/table'
import { UpdateTableBodyType } from '@/schemaValidations/table.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetTableList = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tableApiRequest.list
  })
}
export const useGetTable = ({ id, enabled }: { id: number; enabled?: boolean }) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tableApiRequest.getTable(id),
    enabled
  })
}
export const useAddTable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tableApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    }
  })
}
export const useUpdateTable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTableBodyType & { id: number }) => tableApiRequest.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'], exact: true })
    }
  })
}
export const useDeleteTable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tableApiRequest.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    }
  })
}
