import http from '@/lib/http'
import { DashboardIndicatorQueryParamsType, DashboardIndicatorResType } from '@/schemaValidations/indicator.schema'
import { GetOrdersQueryParamsType } from '@/schemaValidations/order.schema'
import queryString from 'query-string'

const indicatorApiRequest = {
  getDashboardIndicator: (queryParams: DashboardIndicatorQueryParamsType) =>
    http.get<DashboardIndicatorResType>(
      '/indicators/dashboard?' +
        queryString.stringify({
          ...queryParams,
          fromDate: queryParams.fromDate ? new Date(queryParams.fromDate).toISOString() : undefined,
          toDate: queryParams.toDate ? new Date(queryParams.toDate).toISOString() : undefined
        })
    )
}
export default indicatorApiRequest
