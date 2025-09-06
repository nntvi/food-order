import { generateSlugUrl, getIdFromSlugUrl, htmlToTextForDescription, wrapServerApi } from '@/lib/utils'
import dishApiRequest from '@/apiRequest/dish'
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail'
import envConfig, { Locale } from '@/config'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { cache } from 'react'
import { baseOpenGraph } from '@/shared-metadata'
// banh-my-i.123
type Params = { slug: string; locale: Locale }
type Props = {
  params: {
    slug: string
    locale: Locale
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}
const getDetail = cache((id: number) => wrapServerApi(() => dishApiRequest.getDish(id)))
export async function generateStaticParams() {
  const data = await wrapServerApi(() => dishApiRequest.list())
  const list = data?.payload?.data ?? []
  return list.map((dish) => ({
    slug: generateSlugUrl({ name: dish.name, id: dish.id })
  }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, locale } = await params

  const t = await getTranslations('DishDetail')
  const id = getIdFromSlugUrl(slug)
  const data = await getDetail(id)
  const dish = data?.payload?.data

  if (!dish) {
    return {
      title: t('notFound'),
      description: t('notFound')
    }
  }

  const site = (envConfig.NEXT_PUBLIC_URL || '').replace(/\/$/, '')
  const pageUrl = `${site}/${locale}/dishes/${generateSlugUrl({ name: dish.name, id: dish.id })}`

  // OG image: dùng ảnh món, đảm bảo absolute
  const ogImage = dish.image?.startsWith('http')
    ? dish.image
    : `${site}${dish.image?.startsWith('/') ? '' : '/'}${dish.image ?? ''}`

  return {
    title: dish.name,
    description: htmlToTextForDescription(dish.description),
    openGraph: {
      ...baseOpenGraph,
      title: dish.name,
      description: htmlToTextForDescription(dish.description),
      url: pageUrl,
      images: ogImage ? [{ url: ogImage }] : undefined
    },
    alternates: {
      canonical: pageUrl
    }
  }
}
export default async function DishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const id = getIdFromSlugUrl(slug)
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)))
  const dish = data?.payload?.data

  return <DishDetail dish={dish} />
}
