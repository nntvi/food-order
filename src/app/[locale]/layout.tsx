import AppProvider from '@/components/app-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { Inter as FontSans } from 'next/font/google'
import { notFound } from 'next/navigation'
import './globals.css'
import { Locale } from '@/config'
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})
// export const metadata: Metadata = {
//   title: '  Restaurant',
//   description: 'The best restaurant in the world'
// }

export async function generateMetadata() {
  const t = await getTranslations('HomePage')
  return { title: t('title') }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode
    params: Promise<{ locale: string }>
  }>
) {
  const params = await props.params
  const { locale } = params
  const { children } = props

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }
  setRequestLocale(locale as any)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <NextIntlClientProvider locale={locale as any} messages={messages}>
          <AppProvider>
            <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
            </ThemeProvider>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
