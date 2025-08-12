'use server'
import { defaultLocale, Locale } from '@/config'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'locale'
export async function getUserLocal() {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale
}

export async function setUserLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
