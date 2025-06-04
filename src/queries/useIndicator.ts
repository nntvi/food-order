import indicatorApiRequest from '@/apiRequest/indicator'
import { DashboardIndicatorQueryParamsType } from '@/schemaValidations/indicator.schema'
import { useQuery } from '@tanstack/react-query'

export const useDashboardIndicator = (queryParams: DashboardIndicatorQueryParamsType) => {
  return useQuery({
    queryKey: ['indicators', queryParams],
    queryFn: () => indicatorApiRequest.getDashboardIndicator(queryParams)
  })
}
