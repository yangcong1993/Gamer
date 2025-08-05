// file: app/[locale]/(main)/blog/page.tsx
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/[locale]/(main)/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

const POSTS_PER_PAGE = 5
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles = {
    en: 'Blog',
    zh: '博客',
    ja: 'ブログ',
  }
  const title = titles[locale] || titles.en
  return genPageMetadata({
    title: title,
    description: siteMetadata.description,
    alternates: { canonical: `/${locale}/blog` },
  })
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page = '1' } = (await searchParams) ?? {}

  const pageNumber = parseInt(page, 10)

  const postsForThisLocale = allBlogs.filter((p) => p.locale === 'zh')
  const sortedPosts = sortPosts(postsForThisLocale)
  const posts = allCoreContent(sortedPosts)

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="所有文章"
      locale={locale}
    />
  )
}
