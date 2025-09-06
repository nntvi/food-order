import Layout from '@/app/[locale]/(public)/layout'

export default async function GuestLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <Layout modal={null} params={params}>
      {children}
    </Layout>
  )
}
