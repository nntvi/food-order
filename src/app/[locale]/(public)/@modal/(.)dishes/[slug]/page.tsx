import { getIdFromSlugUrl, wrapServerApi } from '@/lib/utils'
import dishApiRequest from '@/apiRequest/dish'
import Modal from '@/app/[locale]/(public)/@modal/(.)dishes/[slug]/modal'
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail'

export default async function DishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const id = getIdFromSlugUrl(slug)
  console.log('🚀 ~ DishPage ~ id:', id)

  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)))
  const dish = data?.payload?.data

  return (
    <Modal>
      <DishDetail dish={dish} />
    </Modal>
  )
}
