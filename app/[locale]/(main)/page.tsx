// file: app/[locale]/(main)/page.tsx

import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SoundProvider } from '@/contexts/SoundProvider'
import { TooltipProvider } from '@/contexts/TooltipProvider'
import HomePageContent from '@/components/HomePageContent'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }, { locale: 'ja' }]
}

const calculateAgeInfo = () => {
  const birthDate = new Date('2002-04-12T00:00:00')
  const today = new Date()
  let years = today.getFullYear() - birthDate.getFullYear()
  const bdThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  if (today < bdThisYear) years--
  const lastBD = new Date(bdThisYear)
  if (today < bdThisYear) lastBD.setFullYear(lastBD.getFullYear() - 1)
  const nextBD = new Date(lastBD)
  nextBD.setFullYear(lastBD.getFullYear() + 1)
  const progress = Math.min(
    100,
    ((today.getTime() - lastBD.getTime()) / (nextBD.getTime() - lastBD.getTime())) * 100
  )
  return { years, progress }
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const messages = (await import(`../../../messages/${locale}.json`)).default

  const initialAgeInfo = calculateAgeInfo()

  return (
    <LanguageProvider initialLanguage={locale} initialMessages={messages}>
      <SoundProvider>
        <TooltipProvider>
          <HomePageContent initialAgeInfo={initialAgeInfo} />
        </TooltipProvider>
      </SoundProvider>
    </LanguageProvider>
  )
}
