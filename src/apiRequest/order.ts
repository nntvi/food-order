import http from '@/lib/http'
import {
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'
import queryString from 'query-string'
const prefixList = 'orders'
const prefix = 'order'
const orderApiRequest = {
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `${prefixList}?${queryString.stringify({
        ...queryParams,
        fromDate: queryParams.fromDate ? new Date(queryParams.fromDate).toISOString() : undefined,
        toDate: queryParams.toDate ? new Date(queryParams.toDate).toISOString() : undefined
      })}`,
      { next: { tags: ['orders'] } }
    ),
  updateOrder: (id: number, body: UpdateOrderBodyType) => http.put<UpdateOrderResType>(`${prefixList}/${id}`, body),
  getOrderDetail: (orderId: number) => http.get<GetOrderDetailResType>(`${prefixList}/${orderId}`)
}

export default orderApiRequest
