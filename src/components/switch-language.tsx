'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Locale, locales } from '@/config'
import { setUserLocale } from '@/services/locale'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

const FLAG_EMOJI: Record<string, string> = {
  vi: '🇻🇳',
  en: '🇺🇸'
  // thêm các locale khác nếu có, ví dụ:
  // ja: '🇯🇵', fr: '🇫🇷'
}

export function SwitchLanguage() {
  const t = useTranslations('SwitchLanguage')
  const activeLocale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const handleSelect = (locale: Locale) => {
    setUserLocale(locale)
    // if (locale === activeLocale) return
    // router.replace(pathname, { locale })
  }

  const currentFlag = FLAG_EMOJI[activeLocale] ?? '🌐'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full w-10 h-10 text-xl'
          aria-label={t('changeLanguage', { locale: activeLocale })}
          title={t('changeLanguage', { locale: activeLocale })}
        >
          <span aria-hidden>{currentFlag}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' sideOffset={6}>
        <DropdownMenuLabel>{t('title')}</DropdownMenuLabel>
        {locales.map((lc) => (
          <DropdownMenuItem key={lc} onSelect={() => handleSelect(lc)} className='flex items-center gap-2'>
            <span className='text-base'>{FLAG_EMOJI[lc] ?? '🌐'}</span>
            <span className='flex-1'>{t(lc)}</span>
            {lc === activeLocale ? <span className='text-xs opacity-70'>✓</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
