'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { slug } from 'github-slugger'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import { motion, AnimatePresence } from 'framer-motion'
import StyledLink from '@/components/StyledLink'
import { useSound } from '@/contexts/SoundProvider'
import SharedPostHeader from '@/components/SharedPostHeader'

interface ClientSideLayoutProps {
  currentLocale: string
  tagCounts: Record<string, number>
  posts: CoreContent<Blog>[]
  pagination?: {
    totalPages: number
    currentPage: number
    locale: string
  }
}

const CompactNewsletterForm = () => {
  const inputEl = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!inputEl.current) {
      setLoading(false)
      return
    }

    const res = await fetch(`/api/newsletter`, {
      body: JSON.stringify({ email: inputEl.current.value }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const { error } = await res.json()
    if (error) {
      setMessage('订阅失败，请检查邮箱或稍后再试。')
      setLoading(false)
      return
    }

    inputEl.current.value = ''
    setLoading(false)
    setSuccess(true)
    setMessage('成功！🎉 感谢您的订阅,请查收邮箱确认。')
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">邮件订阅</h3>
      <form className="mt-2 flex flex-col" onSubmit={subscribe}>
        <input
          ref={inputEl}
          type="email"
          placeholder="您的邮箱"
          required
          disabled={loading || success}
          className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-900 shadow-sm transition-colors duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={loading || success}
          className="mt-2 w-full rounded-md bg-purple-600 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#7c4dff] dark:hover:bg-[#6c47ff]"
        >
          {loading ? '正在提交...' : success ? '感谢!' : '订阅'}
        </button>
      </form>
      {message && (
        <div
          className={`pt-2 text-xs ${
            success ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}

// Pagination 组件（客户端）
function Pagination({
  totalPages,
  currentPage,
  locale,
  onSoundClick,
}: {
  totalPages: number
  currentPage: number
  locale: string
  onSoundClick: () => void
}) {
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <StyledLink
            href={
              currentPage - 1 === 1 ? `/${locale}/blog` : `/${locale}/blog/page/${currentPage - 1}`
            }
            onSoundClick={onSoundClick}
            rel="prev"
          >
            Previous
          </StyledLink>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <StyledLink
            href={`/${locale}/blog/page/${currentPage + 1}`}
            onSoundClick={onSoundClick}
            rel="next"
          >
            Next
          </StyledLink>
        )}
      </nav>
    </div>
  )
}

export function ClientSideLayout({
  currentLocale,
  tagCounts,
  posts,
  pagination,
}: ClientSideLayoutProps) {
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const router = useRouter()
  const { playSound } = useSound()
  const lastPlayRef = useRef(0)
  useEffect(() => {
    posts.forEach((post) => {
      const localizedUrl = post.url.includes(`/${currentLocale}/`)
        ? post.url
        : post.url.replace(/^\/[^/]+\//, `/${currentLocale}/`)

      setTimeout(() => {
        router.prefetch(localizedUrl)
      }, 100)
    })
  }, [posts, currentLocale, router])

  const playInteractionSound = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayRef.current > 50) {
      playSound()
      lastPlayRef.current = now
    }
  }, [playSound])

  return (
    <div className="flex sm:gap-6 md:gap-3">
      <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
        <div className="px-6 py-4">
          {pagination ? (
            <h3 className="font-bold text-purple-700 uppercase dark:text-[#7c4dff]">All Posts</h3>
          ) : (
            <StyledLink
              href={`/${currentLocale}/blog`}
              onSoundClick={playInteractionSound}
              className="font-bold text-gray-700 uppercase transition-colors duration-200 hover:text-purple-700 dark:text-gray-300 dark:hover:text-[#7c4dff]"
            >
              All Posts
            </StyledLink>
          )}
          <ul>
            {sortedTags.map((t) => (
              <li key={t} className="my-3">
                <StyledLink
                  href={`/${currentLocale}/tags/${slug(t)}`}
                  onSoundClick={playInteractionSound}
                  className="px-3 py-2 text-sm font-medium text-gray-500 uppercase transition-colors duration-200 hover:text-purple-700 dark:text-gray-300 dark:hover:text-[#7c4dff]"
                  aria-label={`View posts tagged ${t}`}
                >
                  {`${t} (${tagCounts[t]})`}
                </StyledLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <CompactNewsletterForm />
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-3xl px-4">
          <AnimatePresence mode="wait">
            <motion.ul
              key={`posts-${pagination?.currentPage || 1}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {posts.map((post, index) => {
                const { url, date, title, summary, tags } = post
                const localizedUrl = post.url.includes(`/${currentLocale}/`)
                  ? post.url
                  : post.url.replace(/^\/[^/]+\//, `/${currentLocale}/`)

                return (
                  <motion.li
                    key={url}
                    className="py-5"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5, // 减少持续时间
                      delay: index * 0.1,
                      ease: 'easeOut',
                    }}
                  >
                    <article className="flex flex-col space-y-2">
                      <SharedPostHeader
                        url={localizedUrl}
                        date={date}
                        title={title}
                        summary={summary}
                        tags={tags}
                        locale={currentLocale}
                        isDetailPage={false}
                        onSoundClick={playInteractionSound}
                      />
                    </article>
                  </motion.li>
                )
              })}
            </motion.ul>
          </AnimatePresence>

          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                locale={currentLocale}
                onSoundClick={playInteractionSound}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
