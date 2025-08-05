// file: app/[locale]/layout.tsx

import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'
import '@/css/custom-home.css'
import '../assets/fonts/AaKaiSong/result.css'
import '../assets/fonts/fusion-pixel-12px-monospaced-zh_hans/result.css'
import { LanguageProvider, AppMessages } from '@/contexts/LanguageProvider'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import { SearchProvider, SearchConfig } from 'pliny/search'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import { TooltipProvider } from '@/contexts/TooltipProvider'
import DevToolsLogger from '@/components/DevToolsLogger'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { SoundProvider } from '@/contexts/SoundProvider'
import { ClickFeedbackProvider } from '@/contexts/ClickFeedbackProvider'
import TabFocusHandler from '@/components/TabFocusHandler'
import { TOCProvider } from '@/contexts/TOCProvider'

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'zh-CN',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = (await getMessages({ locale })) as AppMessages
  const basePath = process.env.BASE_PATH || ''
  const validLocale = locale || 'zh'

  return (
    <html lang={validLocale} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href={`${basePath}/static/favicons/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/static/favicons/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${basePath}/static/favicons/favicon-16x16.png`}
        />
        <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
        <link
          rel="mask-icon"
          href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
        <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
        <link
          rel="preload"
          href="/static/images/Master_Sword.avif"
          as="image"
          fetchPriority="high"
        />
      </head>

      <body className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var font = localStorage.getItem('font');
                if (font === 'common') {
                  document.documentElement.classList.add('font-common');
                } else {
                  document.documentElement.classList.remove('font-common');
                }
              } catch (e) {}
            })();
          `,
          }}
        />
        <ClickFeedbackProvider>
          <NextIntlClientProvider locale={validLocale} messages={messages}>
            <LanguageProvider initialLanguage={validLocale} initialMessages={messages}>
              <TOCProvider>
                <ThemeProviders>
                  <DevToolsLogger />
                  <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
                  <TooltipProvider>
                    <SoundProvider>
                      <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
                        <TabFocusHandler />
                        {children}
                      </SearchProvider>
                    </SoundProvider>
                  </TooltipProvider>
                </ThemeProviders>
              </TOCProvider>
            </LanguageProvider>
          </NextIntlClientProvider>
        </ClickFeedbackProvider>
      </body>
    </html>
  )
}
