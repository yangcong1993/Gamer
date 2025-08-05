import 'css/prism.css'
import 'katex/dist/katex.css'
import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import FallbackNotice from '@/components/FallbackNotice'
import { createClient } from '@/lib/client'
const supabase = createClient()
export const revalidate = 3600
const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[]; locale: string }>
}): Promise<Metadata | undefined> {
  const { slug: slugArr, locale } = await params
  const slug = decodeURI(slugArr.join('/'))
  const post = allBlogs.find((p) => p.slug === slug && p.locale === locale)

  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img && img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })
  const ogLocaleMap = {
    en: 'en_US',
    zh: 'zh_CN',
    ja: 'ja_JP',
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: ogLocaleMap[locale] || ogLocaleMap.en,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: post.url,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({
    locale: p.locale,
    slug: p.slug.split('/'),
  }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[]; locale: string }>
}) {
  const { slug: slugArr, locale } = await params
  const slug = decodeURI(slugArr.join('/'))
  let isFallback = false

  let post = allBlogs.find((p) => p.slug === slug && p.locale === locale)

  if (!post && locale !== 'zh') {
    post = allBlogs.find((p) => p.slug === slug && p.locale === 'zh')
    if (post) {
      isFallback = true
    }
  }

  if (!post) {
    return notFound()
  }

  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const { data: viewCount, error } = await supabase.rpc('increment_view', { page_slug: slug })
  if (error) {
    console.error('Error incrementing view count:', error)
  }

  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author) => ({
    '@type': 'Person',
    name: author.name,
  }))

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout
        content={mainContent}
        authorDetails={authorDetails}
        next={null}
        prev={null}
        viewCount={viewCount}
        isFallback={isFallback}
        code={post.body.code}
        toc={post.toc}
      />
    </>
  )
}
