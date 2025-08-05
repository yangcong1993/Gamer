// file: middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const supportedLocales = ['en', 'zh', 'ja']
const defaultLocale = 'zh'

function getLocale(request: NextRequest): string {
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && supportedLocales.includes(localeCookie)) {
    return localeCookie
  }
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => (headers[key] = value))
  const languages = new Negotiator({ headers }).languages()

  try {
    return match(languages, supportedLocales, defaultLocale)
  } catch (e) {
    return defaultLocale
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return
  }

  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next|_proxy|auth/callback|_auth|static|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|webmanifest)).*)',
  ],
}
