'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Project } from '@/data/projectsData'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { type, title, description, imgSrc, href, details } = project
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  const handleToggleExpand = useCallback(() => {
    if (!isExpanded && cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

      setCardPosition({
        top: cardRect.top + scrollTop,
        left: cardRect.left + scrollLeft,
        width: cardRect.width,
        height: cardRect.height,
      })
    }
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  const handleCloseExpanded = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const cardContent = useMemo(
    () => (
      <>
        <div className="h-48 w-full overflow-hidden">
          <Image
            alt={title}
            src={imgSrc}
            className="h-full w-full object-cover object-center"
            width={550}
            height={280}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rl1BmeVvXMwN69IBCy5+QRCev3j/2Q=="
          />
        </div>
        <div className="p-6">
          <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">{title}</h2>
          <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </>
    ),
    [title, description, imgSrc]
  )

  const animationConfig = useMemo(
    () => ({
      initial: {
        position: 'fixed' as const,
        top: cardPosition.top,
        left: cardPosition.left,
        width: cardPosition.width,
        height: cardPosition.height,
        opacity: 0,
        scale: 1,
      },
      animate: {
        top: '50%',
        left: '50%',
        width: '70vw',
        height: '70vh',
        opacity: 1,
        scale: 1,
        x: '-50%',
        y: '-50%',
      },
      exit: {
        top: cardPosition.top,
        left: cardPosition.left,
        width: cardPosition.width,
        height: cardPosition.height,
        opacity: 0,
        scale: 1,
        x: 0,
        y: 0,
      },
      transition: {
        duration: 0.3,
        ease: 'easeInOut' as const,
      },
    }),
    [cardPosition]
  )

  // 情况一：外链项目
  if (type === 'external') {
    return (
      <Link
        href={href!}
        className="group block h-full transform-gpu overflow-hidden rounded-lg border-2 border-solid border-gray-200 bg-white transition-all duration-300 hover:scale-105 hover:border-[#793EC3] dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#793EC3]"
        target="_blank"
        rel="noopener noreferrer"
      >
        {cardContent}
      </Link>
    )
  }

  // 情况二：内部项目，可展开
  return (
    <>
      <div
        ref={cardRef}
        className={`relative h-full transform-gpu overflow-hidden rounded-lg border-2 border-solid bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
          isExpanded
            ? 'invisible'
            : 'hover:scale-105 hover:border-[#793EC3] dark:hover:border-[#793EC3]'
        }`}
      >
        <button
          onClick={handleToggleExpand}
          className="w-full text-left"
          aria-expanded={isExpanded}
        >
          {cardContent}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-opacity-50 fixed inset-0 z-40 bg-black"
              onClick={handleCloseExpanded}
              style={{ backdropFilter: 'blur(4px)' }}
            />

            <motion.div
              {...animationConfig}
              className="fixed z-50 overflow-hidden rounded-lg border-2 border-[#52288C] bg-white shadow-2xl dark:bg-gray-800"
            >
              <button
                onClick={handleCloseExpanded}
                className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="关闭"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="h-full overflow-y-auto">
                <div className="flex h-64 w-full overflow-hidden">
                  <Image
                    alt={title}
                    src={imgSrc}
                    className="h-full w-full object-cover object-center"
                    width={1100}
                    height={400}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rl1BmeVvXMwN69IBCy5+QRCev3j/2Q=="
                  />
                </div>
                <div className="p-8">
                  <h2 className="mb-4 text-3xl leading-8 font-bold tracking-tight">{title}</h2>
                  <p className="prose mb-6 max-w-none text-xl text-gray-500 dark:text-gray-400">
                    {description}
                  </p>

                  <hr className="my-6" />

                  <div className="prose prose-lg dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-4 space-y-2">{children}</ol>,
                        li: ({ children }) => (
                          <li className="ml-4 text-gray-700 dark:text-gray-300">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900 dark:text-gray-100">
                            {children}
                          </strong>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {details!}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProjectCard
