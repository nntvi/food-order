import http from '@/lib/http'
import {
  CreateTableBodyType,
  TableListResType,
  TableResType,
  UpdateTableBodyType
} from '@/schemaValidations/table.schema'

const prefix = '/tables'
const tableApiRequest = {
  list: () => http.get<TableListResType>(`${prefix}`),
  getTable: (id: number) => http.get<TableResType>(`${prefix}/${id}`),
  add: (data: CreateTableBodyType) => http.post<TableResType>(`${prefix}`, data),
  update: (id: number, data: UpdateTableBodyType) => http.put<TableResType>(`${prefix}/${id}`, data),
  delete: (id: number) => http.delete<TableResType>(`${prefix}/${id}`)
}

export default tableApiRequest
