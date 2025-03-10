import http from '@/lib/http'
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'

const prefix = '/accounts'
const accountApiRequest = {
  me: () => http.get<AccountResType>(`${prefix}/me`),
  sMe: (accessToken: string) =>
    http.get<AccountResType>(`${prefix}/me`, { headers: { Authorization: `Bearer ${accessToken}` } }),

  updateMe: (body: UpdateMeBodyType) => http.put<AccountResType>(`${prefix}/me`, body),

  changePassword: (body: ChangePasswordBodyType) => http.put<AccountResType>(`${prefix}/change-password`, body),

  changePasswordV2: (body: ChangePasswordV2BodyType) =>
    http.put<ChangePasswordV2ResType>(`/api/${prefix}/change-password-v2`, body, {
      baseUrl: ''
    }),

  sChangePasswordV2: (accessToken: string, body: ChangePasswordV2BodyType) =>
    http.put<ChangePasswordV2ResType>(`${prefix}/change-password-v2`, body, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),
  /* -- Account --  */
  list: () => http.get<AccountListResType>(`${prefix}`),
  addEmployee: (body: CreateEmployeeAccountBodyType) => http.post<AccountResType>(`${prefix}`, body),
  getEmployee: (id: number) => http.get<AccountResType>(`${prefix}/detail/${id}`),
  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${prefix}/${id}`, body),
  deleteEmployee: (id: number) => http.delete<AccountResType>(`${prefix}/detail/${id}`)
}
export default accountApiRequest
