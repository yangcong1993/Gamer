'use client'
import { motion } from 'framer-motion'
import React from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import Tag from '@/components/Tag'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useRef } from 'react'

interface SharedPostHeaderProps {
  url: string
  date: string
  title: string
  summary?: string
  tags?: string[]
  locale: string
  isDetailPage?: boolean
  viewCount?: number
  onSoundClick?: () => void
}

export default function SharedPostHeader({
  url,
  date,
  title,
  summary,
  tags,
  locale,
  isDetailPage = false,
  viewCount,
  onSoundClick,
}: SharedPostHeaderProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDetailPage) return

      e.preventDefault()
      if (onSoundClick) {
        onSoundClick()
      }
      setIsNavigating(true)
      router.prefetch(url)
      requestAnimationFrame(() => {
        router.push(url)
      })
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false)
      }, 1000)
    },
    [isDetailPage, onSoundClick, router, url]
  )

  React.useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      layoutId={`post-header-${url}`}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 40,
        mass: 0.8,
      }}
      className={`${isDetailPage ? 'text-center' : 'cursor-pointer text-center'}`}
      onClick={handleClick}
      whileHover={
        !isDetailPage
          ? {
              scale: 1.02,
              transition: { duration: 0.15 },
            }
          : {}
      }
      whileTap={
        !isDetailPage
          ? {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
          : {}
      }
      data-interactive={!isDetailPage ? 'true' : undefined}
      animate={
        isNavigating && !isDetailPage
          ? {
              scale: [1, 1.03, 1.01],
              transition: {
                duration: 0.2,
                ease: 'easeOut',
              },
            }
          : {}
      }
      style={{
        willChange: isNavigating ? 'transform' : 'auto',
      }}
    >
      {/* 日期 */}
      <motion.div
        layoutId={`post-date-${url}`}
        className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400"
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        }}
      >
        <time dateTime={date} suppressHydrationWarning>
          {formatDate(date, locale)}
        </time>
      </motion.div>

      {/* 标题 */}
      <motion.div
        layoutId={`post-title-${url}`}
        className="space-y-3 py-2"
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 35,
          mass: 0.8,
        }}
      >
        {isDetailPage ? (
          <h1 className="text-3xl leading-9 font-bold tracking-tight text-gray-900 md:text-5xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        ) : (
          <h2 className="text-2xl leading-8 font-bold tracking-tight">
            <span className="inline-block text-gray-900 dark:text-gray-100">{title}</span>
          </h2>
        )}
      </motion.div>

      {/* 浏览量 (仅详情页显示) */}
      {isDetailPage && viewCount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {viewCount.toLocaleString()} views
        </motion.div>
      )}

      {/* 摘要和标签 */}
      <motion.div
        layoutId={`post-meta-${url}`}
        className="py-4"
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        }}
      >
        {/* 摘要 */}
        {summary && (
          <motion.div
            layoutId={`post-summary-${url}`}
            className="prose prose-lg mx-auto max-w-none pb-4 text-gray-500 dark:text-gray-400"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
              mass: 0.8,
            }}
          >
            {summary}
          </motion.div>
        )}

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <motion.div
            layoutId={`post-tags-${url}`}
            className="flex flex-wrap justify-center gap-3"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
              mass: 0.8,
            }}
          >
            {tags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={isDetailPage ? { opacity: 0, scale: 0.8 } : false}
                animate={isDetailPage ? { opacity: 1, scale: 1 } : {}}
                transition={isDetailPage ? { delay: 0.3 + index * 0.08 } : {}}
              >
                <Tag text={tag} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
