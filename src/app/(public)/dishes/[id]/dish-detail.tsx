import { formatCurrency } from '@/lib/utils'
import { DishResType } from '@/schemaValidations/dish.schema'

export default async function DishDetail({ dish }: { dish: DishResType['data'] | undefined }) {
  if (!dish) {
    return (
      <div className='flex items-center justify-center min-h-screen '>
        <div className=' shadow-lg rounded-xl p-8 max-w-md w-full text-center'>
          <h1 className='text-2xl font-bold text-red-500 mb-4'>Không tìm thấy món ăn</h1>
        </div>
      </div>
    )
  }
  return (
    <div className='flex min-h-screen'>
      <div className='shadow-lg rounded-xl p-8 max-w-md w-full'>
        {dish.image && <img src={dish.image} alt={dish.name} className='w-full h-56 object-cover rounded-lg mb-6' />}
        <h1 className='text-3xl font-bold text-gray-300 mb-4 text-center'>{dish.name}</h1>
        <div className='flex justify-center'>
          <span className='bg-green-100 text-green-700 px-2 py-1 rounded-full text-md font-semibold'>
            ${formatCurrency(dish.price)}
          </span>
        </div>
        <p className='text-gray-600 my-4 text-center'>{dish.description}</p>
      </div>
    </div>
  )
}
