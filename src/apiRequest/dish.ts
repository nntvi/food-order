import http from '@/lib/http'
import { CreateDishBodyType, DishListResType, DishResType, UpdateDishBodyType } from '@/schemaValidations/dish.schema'

const prefix = 'dishes'
const dishApiRequest = {
  list: () => http.get<DishListResType>(`${prefix}`),
  getDish: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  deleteDish: (id: number) => http.delete<DishListResType>(`${prefix}/${id}`),
  createDish: (body: CreateDishBodyType) => http.post<DishListResType>(`${prefix}`, body),
  updateDish: (id: number, body: UpdateDishBodyType) => http.put<DishListResType>(`${prefix}/${id}`, body)
}

export default dishApiRequest
