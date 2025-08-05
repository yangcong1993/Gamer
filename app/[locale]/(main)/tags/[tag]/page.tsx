import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/[locale]/(main)/seo'
import { Metadata } from 'next'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ locale: string; tag: string }>
}): Promise<Metadata> {
  const params = await props.params
  const { locale, tag: tagParam } = params
  const tag = decodeURI(tagParam)

  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  })
}

// 为所有语言和标签生成静态参数
export const generateStaticParams = async () => {
  const locales = ['zh', 'en', 'ja']
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)

  const paths: { locale: string; tag: string }[] = []

  // 为每种语言和每个标签生成参数
  locales.forEach((locale) => {
    tagKeys.forEach((tag) => {
      paths.push({
        locale,
        tag: encodeURI(tag),
      })
    })
  })

  return paths
}

export default async function TagPage(props: { params: Promise<{ locale: string; tag: string }> }) {
  const params = await props.params
  const { locale, tag: tagParam } = params
  const tag = decodeURI(tagParam)
  const title = tag
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.locale === locale && post.tags && post.tags.map((t) => slug(t)).includes(tag)
      )
    )
  )

  if (filteredPosts.length === 0) {
    return (
      <ListLayout
        posts={[]}
        initialDisplayPosts={[]}
        pagination={undefined}
        title={title}
        locale={locale}
      />
    )
  }

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)

  const pagination = {
    currentPage: 1,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
      locale={locale}
    />
  )
}
