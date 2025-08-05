// PostLayout.tsx
import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import { components } from '@/components/MDXComponents'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import FallbackNotice from '@/components/FallbackNotice'
import Footer from '@/components/Footer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import PostMotionWrapper from '@/components/PostMotionWrapper'
import PostClientComponents from '@/components/PostClientComponents'
import { DividerLarge } from '@/components/CustomDivider'
import TOCManager from '@/components/TOCManager'
import SharedPostHeader from '@/components/SharedPostHeader'

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface TocItem {
  value: string
  url: string
  depth: number
}

interface LayoutProps {
  content: CoreContent<Blog> & { summary?: string }
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string; url: string } | null
  prev?: { path: string; title: string; url: string } | null
  children: ReactNode
  viewCount: number
  code: string
  toc: TocItem[]
  isFallback?: boolean
}

export default function PostLayout({
  content,
  authorDetails,
  next,
  prev,
  children,
  toc,
  viewCount,
  code,
  isFallback = false,
}: LayoutProps) {
  const { slug, date, title, tags, summary, locale, url } = content

  return (
    <div>
      <TOCManager toc={toc} />
      <SectionContainer>
        <ScrollTopAndComment />
        <article className="relative">
          <div>
            <header className="pt-6 pb-6">
              {/* 共享的文章头部组件 - 这部分会从列表页平滑过渡过来 */}
              <SharedPostHeader
                url={url}
                date={date}
                title={title}
                summary={summary}
                tags={tags}
                locale={locale}
                isDetailPage={true}
                viewCount={viewCount}
              />
            </header>

            {/* 非共享内容用 PostMotionWrapper 包裹，独立执行入场动画 */}
            <PostMotionWrapper url={url}>
              <div className="grid-rows-[auto_1fr] divide-gray-200 pb-8 dark:divide-gray-700">
                <div className="divide-gray-200 dark:divide-gray-700">
                  {isFallback && <FallbackNotice />}

                  {/* 文章内容动画容器 */}
                  <div
                    id="post-content"
                    className="prose dark:prose-invert relative max-w-none pt-10 pb-8"
                  >
                    <MDXLayoutRenderer code={code} components={components} toc={toc} />
                    <Image
                      src="/static/images/ending.png"
                      alt="Ending"
                      width={67}
                      height={67}
                      className="pointer-events-none"
                      style={{
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: '10px',
                        width: '67px',
                        filter: 'drop-shadow(3px 5px 4px rgba(0, 0, 0, 0.4))',
                        height: 'auto',
                      }}
                    />
                  </div>
                  <DividerLarge />
                  <PostClientComponents slug={slug} />
                </div>

                <footer>
                  <div className="divide-gray-200 text-sm leading-5 font-medium dark:divide-gray-700">
                    {(next || prev) && (
                      <div className="flex justify-between py-4">
                        {prev && prev.url && (
                          <div>
                            <h2 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                              Previous Article
                            </h2>
                            <div className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400">
                              <Link href={prev.url}>{prev.title}</Link>
                            </div>
                          </div>
                        )}
                        {next && next.url && (
                          <div>
                            <h2 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                              Next Article
                            </h2>
                            <div className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400">
                              <Link href={next.url}>{next.title}</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 text-center">
                    <Link
                      href={`/${locale}/blog`}
                      className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400"
                      aria-label="Back to the blog"
                    >
                      &larr; Back to the blog
                    </Link>
                  </div>

                  <div className="mt-8">
                    <Footer />
                  </div>
                </footer>
              </div>
            </PostMotionWrapper>
          </div>
        </article>
      </SectionContainer>
    </div>
  )
}
