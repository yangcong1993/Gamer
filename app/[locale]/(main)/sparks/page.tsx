import { genPageMetadata } from 'app/[locale]/(main)/seo'
import PageTitle from '@/components/PageTitle'
import { getTranslations } from 'next-intl/server'
import ProgressiveImage from '@/components/ProgressiveImage'
export const metadata = genPageMetadata({ title: 'Sparks' })
import AnimatedConstruction from '@/components/AnimatedConstruction'
interface Quote {
  words: string
  source: string
}
async function getQuote(errorMsg: string): Promise<Quote | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/quote`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error('Failed to fetch quote:', error)
    return null
  }
}

async function getImageUrl(errorMsg: string): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/image`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.imageUrl
  } catch (error) {
    console.error('Failed to fetch image:', error)
    return null
  }
}

export default async function FlashIdeasPage({ params }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: 'FlashIdeas' })
  const fetchErrorText = t('fetch_error')

  const [quote, imageUrl] = await Promise.all([
    getQuote(fetchErrorText),
    getImageUrl(fetchErrorText),
  ])

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <PageTitle>{t('title')}</PageTitle>
      </div>

      <div className="py-8">
        <AnimatedConstruction
          containerHeight={300} // 容器高度
          verticalOffset={0} // 整体垂直偏移
          animationSpeed={1.8} // 动画速度倍数
          roadWidth={280} // 石子路宽度
          roadBottom={40} // 石子路距离底部距离
          treeWidth={370} // 树的宽度
          treeBottom={82}
          houseWidth={200} // 房子宽度
          houseBottom={86} // 房子距离底部距离
        />
      </div>

      <div className="space-y-4 py-8">
        <h3 className="text-xl leading-9 font-semibold tracking-tight text-gray-800 dark:text-gray-200">
          {t('quote_title')}
        </h3>
        {quote ? (
          <blockquote className="border-l-4 border-gray-300 p-4 text-gray-600 italic dark:border-gray-600 dark:text-gray-300">
            <p className="mb-2">“{quote.words}”</p>
            <footer className="text-right not-italic">—— {quote.source}</footer>
          </blockquote>
        ) : (
          <p>{fetchErrorText}</p>
        )}
      </div>

      <div className="space-y-4 py-8">
        <h3 className="text-xl leading-9 font-semibold tracking-tight text-gray-800 dark:text-gray-200">
          {t('image_title')}
        </h3>
        {imageUrl ? (
          <div className="relative flex max-h-[70vh] w-full justify-center">
            {}
            <ProgressiveImage
              src={imageUrl}
              alt="Random image"
              width={1000}
              height={600}
              className="max-h-[70vh] rounded-lg object-contain shadow-lg"
            />
          </div>
        ) : (
          <p>{fetchErrorText}</p>
        )}
      </div>
    </div>
  )
}
