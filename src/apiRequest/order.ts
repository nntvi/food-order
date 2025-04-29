import http from '@/lib/http'
import { GetOrdersResType, UpdateOrderBodyType, UpdateOrderResType } from '@/schemaValidations/order.schema'

const prefixList = 'orders'
const prefix = 'order'
const orderApiRequest = {
  list: () => http.get<GetOrdersResType>(`${prefixList}`, { next: { tags: ['orders'] } }),
  updateOrder: (id: number, body: UpdateOrderBodyType) => http.put<UpdateOrderResType>(`${prefix}/${id}`, body)
}

export default orderApiRequest
