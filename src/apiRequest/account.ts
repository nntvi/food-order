import http from '@/lib/http'
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'
import queryString from 'query-string'
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
    http.put<AccountResType>(`${prefix}/detail/${id}`, body),
  deleteEmployee: (id: number) => http.delete<AccountResType>(`${prefix}/detail/${id}`),
  guestList: (queryParams: GetGuestListQueryParamsType) =>
    http.get<AccountListResType>(
      `${prefix}/guests?` +
        queryString.stringify({
          ...queryParams,
          fromDate: queryParams.fromDate ? new Date(queryParams.fromDate).toISOString() : undefined,
          toDate: queryParams.toDate ? new Date(queryParams.toDate).toISOString() : undefined
        })
    ),
  createGuest: (body: CreateGuestBodyType) => http.post<CreateGuestResType>(`${prefix}/guests`, body)
}
export default accountApiRequest
