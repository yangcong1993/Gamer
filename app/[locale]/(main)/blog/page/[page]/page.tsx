import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5
export const generateStaticParams = async () => {
  const locales = ['zh', 'en', 'ja']

  const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE)
  const paths: { locale: string; page: string }[] = []

  locales.forEach((locale) => {
    for (let i = 1; i <= totalPages; i++) {
      paths.push({
        locale,
        page: i.toString(),
      })
    }
  })

  return paths
}

export default async function Page(props: { params: Promise<{ locale: string; page: string }> }) {
  const params = await props.params
  const { locale, page } = params

  const allPosts = allCoreContent(sortPosts(allBlogs))
  const posts = allPosts

  const pageNumber = parseInt(page as string)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )

  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
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
