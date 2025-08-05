import Image from 'next/image'
import { friendsData, type Friend } from './data'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import FriendCard from './FriendCard'

export async function generateMetadata(props): Promise<Metadata> {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'FriendsPage' })
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  }
}

export default async function FriendsPage(props) {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'FriendsPage' })
  const shuffledFriends = [...friendsData]
  for (let i = shuffledFriends.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledFriends[i], shuffledFriends[j]] = [shuffledFriends[j], shuffledFriends[i]]
  }

  const myInfoData = {
    站点名称: t('myInfo.site_name'),
    完整地址: t('myInfo.address'),
    Favicon: t('myInfo.favicon'),
    Description: t('myInfo.description'),
    RSS: t('myInfo.rss'),
  }

  const requirementItems = t.raw('requirements_items') as string[]

  return (
    <SectionContainer>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* 页面标题和描述 */}
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <PageTitle>{t('title')}</PageTitle>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t('description')}</p>
        </div>

        {/* 友链卡片网格 */}
        <div className="pt-8 pb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shuffledFriends.map((friend) => (
              <FriendCard key={friend.href} friend={friend} />
            ))}
          </div>
        </div>

        <div className="pt-8 pb-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('requirements_title')}
          </h2>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            {requirementItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="pt-8 pb-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('myInfo_title')}
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <pre>
              <code>{JSON.stringify(myInfoData, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Image
          src="/static/images/friends-ending.png"
          alt="Ending decorative image"
          width={128}
          height={128}
          className="opacity-80"
        />
      </div>
    </SectionContainer>
  )
}
