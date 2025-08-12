import { getUserLocal } from '@/services/locale'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  const locale = await getUserLocal()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
