// file: contexts/LanguageProvider.tsx

'use client'

import React, { createContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react'
import { AbstractIntlMessages } from 'next-intl'
import Cookies from 'js-cookie'
import { usePathname, useRouter } from 'next/navigation'

export interface OnlineCounterMessages extends AbstractIntlMessages {
  text: string
}

export interface RealtimeMessages extends AbstractIntlMessages {
  specialStatus: string
  statusPrefix: string
  statusSuffix: string
  localTime: string
}

export interface IntroMessages extends AbstractIntlMessages {
  p1: string
  p2: string
  p3: string
  p4: string
  p5: string
}

export interface HomePageMessages extends AbstractIntlMessages {
  Intro: IntroMessages
}

export interface FlashIdeasMessages extends AbstractIntlMessages {
  title: string
  wip: string
  quote_title: string
  image_title: string
  fetch_error: string
}

export interface AppMessages extends AbstractIntlMessages {
  OnlineCounter: OnlineCounterMessages
  Realtime: RealtimeMessages
  HomePage: HomePageMessages
  FlashIdeas: FlashIdeasMessages
}

interface LanguageContextType {
  language: string
  messages: AppMessages
  changeLanguage: (lang: string) => void
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
const supportedLocales = ['en', 'zh', 'ja']

interface LanguageProviderProps {
  initialLanguage: string
  initialMessages: AppMessages
  children: ReactNode
}

export function LanguageProvider({
  initialLanguage,
  initialMessages,
  children,
}: LanguageProviderProps) {
  const pathname = usePathname()
  const [language, setLanguage] = useState(initialLanguage)
  const [allMessages, setAllMessages] = useState({ [initialLanguage]: initialMessages })
  const router = useRouter()
  useEffect(() => {
    supportedLocales.forEach((locale) => {
      if (!allMessages[locale]) {
        import(`../messages/${locale}.json`).then((newMessages) => {
          setAllMessages((prev) => ({ ...prev, [locale]: newMessages.default }))
        })
      }
    })
  }, [allMessages])

  useEffect(() => {
    const pathLocale = pathname.split('/')[1]
    if (pathLocale && supportedLocales.includes(pathLocale) && pathLocale !== language) {
      setLanguage(pathLocale)
    }
  }, [pathname, language])

  const changeLanguage = useCallback(
    (langCode: string) => {
      if (langCode === language || !supportedLocales.includes(langCode)) {
        return
      }

      const currentLocale = pathname.split('/')[1]
      const newPath = `/${langCode}${pathname.substring(currentLocale.length + 1)}`

      router.push(newPath)
      Cookies.set('NEXT_LOCALE', langCode, { expires: 365, path: '/' })
    },
    [language, pathname, router]
  )

  const messages = useMemo(
    () => allMessages[language] || initialMessages,
    [language, allMessages, initialMessages]
  )

  const value = {
    language,
    messages,
    changeLanguage,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
