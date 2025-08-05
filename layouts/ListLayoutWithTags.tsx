// file: layouts/ListLayoutWithTags.tsx
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import tagData from 'app/tag-data.json'
import { ClientSideLayout } from '@/components/ClientSideLayout'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
  locale: string
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  locale,
}: ListLayoutProps) {
  const tagCounts = tagData as Record<string, number>
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <div>
      <div className="pt-6 pb-6">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {title}
        </h1>
      </div>
      <ClientSideLayout
        currentLocale={locale}
        tagCounts={tagCounts}
        posts={displayPosts}
        pagination={
          pagination
            ? {
                totalPages: pagination.totalPages,
                currentPage: pagination.currentPage,
                locale: locale,
              }
            : undefined
        }
      />
    </div>
  )
}
