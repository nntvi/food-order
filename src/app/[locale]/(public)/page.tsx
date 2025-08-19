import dishApiRequest from '@/apiRequest/dish'
import { formatCurrency, generateSlugUrl } from '@/lib/utils'
import { DishListResType } from '@/schemaValidations/dish.schema'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ChevronRight, Star, Clock, Users } from 'lucide-react'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as any)

  const t = await getTranslations('HomePage')
  let dishList: DishListResType['data'] = []
  try {
    const result = await dishApiRequest.list()
    const {
      payload: { data }
    } = result
    dishList = data
  } catch (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>😔</div>
          <h2 className='text-2xl font-bold text-red-500 mb-2'>Đã xảy ra lỗi</h2>
          <p className='text-muted-foreground'>Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='absolute inset-0'>
          <Image src='/banner.png' fill quality={100} alt='Restaurant Banner' className='object-cover' priority />
          <div className='absolute inset-0 bg-black/60'></div>
        </div>

        {/* Hero Content */}
        <div className='relative z-10 text-center text-white px-4 max-w-4xl mx-auto'>
          <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight'>{t('title')}</h1>
          <p className='text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto'>
            Khám phá hương vị ẩm thực Việt Nam đích thực với những món ăn được chế biến từ nguyên liệu tươi ngon nhất
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link
              href='/dishes'
              className='bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 group'
            >
              Xem thực đơn
              <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </Link>
            <Link
              href='/about'
              className='border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-full font-semibold transition-all duration-300'
            >
              Về chúng tôi
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce'>
          <div className='w-6 h-10 border-2 border-white rounded-full flex justify-center'>
            <div className='w-1 h-3 bg-white rounded-full mt-2 animate-pulse'></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 bg-muted/30'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center p-6'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Star className='w-8 h-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Chất lượng cao</h3>
              <p className='text-muted-foreground'>Nguyên liệu tươi ngon, chế biến cẩn thận</p>
            </div>
            <div className='text-center p-6'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Clock className='w-8 h-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Phục vụ nhanh</h3>
              <p className='text-muted-foreground'>Đảm bảo thời gian chờ tối thiểu</p>
            </div>
            <div className='text-center p-6'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='w-8 h-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Thân thiện</h3>
              <p className='text-muted-foreground'>Đội ngũ nhân viên nhiệt tình, chu đáo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Thực đơn nổi bật</h2>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
              Khám phá những món ăn được yêu thích nhất của chúng tôi, được chế biến từ công thức gia truyền
            </p>
          </div>

          {dishList.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {dishList.slice(0, 6).map((dish) => (
                <Link
                  href={`/dishes/${generateSlugUrl({ name: dish.name, id: dish.id })}`}
                  key={dish.id}
                  className='group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
                >
                  <div className='relative h-48 overflow-hidden'>
                    <Image
                      src={dish.image}
                      fill
                      alt={dish.name}
                      quality={100}
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300'></div>
                  </div>
                  <div className='p-6'>
                    <h3 className='text-xl font-semibold mb-2 group-hover:text-primary transition-colors'>
                      {dish.name}
                    </h3>
                    <p className='text-muted-foreground text-sm mb-4 line-clamp-2'>{dish.description}</p>
                    <div className='flex items-center justify-between'>
                      <span className='text-2xl font-bold text-primary'>${formatCurrency(dish.price)}</span>
                      <div className='flex items-center gap-1 text-yellow-500'>
                        <Star className='w-4 h-4 fill-current' />
                        <span className='text-sm font-medium'>4.8</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🍽️</div>
              <h3 className='text-xl font-semibold mb-2'>Chưa có món ăn</h3>
              <p className='text-muted-foreground'>Vui lòng quay lại sau</p>
            </div>
          )}

          {dishList.length > 6 && (
            <div className='text-center mt-12'>
              <Link
                href='/dishes'
                className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300'
              >
                Xem tất cả món ăn
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 '>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>Sẵn sàng thưởng thức?</h2>
          <p className='text-lg mb-8 max-w-2xl mx-auto'>
            Đặt bàn ngay hôm nay để trải nghiệm hương vị ẩm thực Việt Nam đích thực
          </p>
          <Link
            href='/tables'
            className='inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300'
          >
            Đặt bàn ngay
            <ChevronRight className='w-4 h-4' />
          </Link>
        </div>
      </section>
    </div>
  )
}
