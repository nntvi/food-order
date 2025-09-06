import envConfig from '@/config'

export const baseOpenGraph = {
  locale: 'en_US',
  alternative: ['vi_VN'],
  type: 'website',
  siteName: `Vi's restaurant`,
  images: [
    {
      url: `${envConfig.NEXT_PUBLIC_URL}/banner.jpg`
    }
  ]
}
