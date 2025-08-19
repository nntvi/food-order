import { formatCurrency } from '@/lib/utils'
import { DishResType } from '@/schemaValidations/dish.schema'

export default async function DishDetail({ dish }: { dish: DishResType['data'] | undefined }) {
  if (!dish) {
    return (
      <div className='flex items-center justify-center min-h-[300px] p-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-500 mb-4'>Không tìm thấy món ăn</h1>
          <p className='text-muted-foreground'>Món ăn này có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col md:flex-row h-full'>
      {/* Image Section */}
      <div className='md:w-1/2 h-64 md:h-auto'>
        {dish.image ? (
          <img src={dish.image} alt={dish.name} className='w-full h-full object-cover' />
        ) : (
          <div className='w-full h-full bg-muted flex items-center justify-center'>
            <div className='text-muted-foreground text-center'>
              <div className='text-4xl mb-2'>🍽️</div>
              <p className='text-sm'>Không có hình ảnh</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='md:w-1/2 p-6 flex flex-col justify-center'>
        <div className='space-y-4'>
          {/* Title */}
          <h1 className='text-2xl md:text-3xl font-bold text-foreground leading-tight'>{dish.name}</h1>

          {/* Price */}
          <div className='flex items-center gap-2'>
            <span className='text-3xl font-bold text-primary'>${formatCurrency(dish.price)}</span>
            <span className='text-sm text-muted-foreground'>/ phần</span>
          </div>

          {/* Description */}
          {dish.description && (
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>Mô tả</h3>
              <p className='text-foreground leading-relaxed'>{dish.description}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className='pt-4 border-t border-border'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span>🍽️</span>
              <span>Món ăn ngon, tươi mới</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
