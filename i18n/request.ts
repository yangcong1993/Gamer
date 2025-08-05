// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from './index'

type Locale = (typeof locales)[number] // 'en' | 'zh' | 'ja'

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

export default getRequestConfig(async ({ locale }) => {
  const finalLocale: Locale = isLocale(locale) ? locale : defaultLocale

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default,
  }
})
