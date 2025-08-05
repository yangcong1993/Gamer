'use client'
import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface Props {
  children: ReactNode
  url: string
}

export default function PostMotionWrapper({ children, url }: Props) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [url])

  if (!showContent) {
    return (
      <motion.div
        key={`post-placeholder-${url}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="min-h-[300px]"
        style={{
          background: `
            linear-gradient(90deg, 
              transparent 25%, 
              rgba(255,255,255,0.1) 50%, 
              transparent 75%
            ),
            linear-gradient(
              rgba(0,0,0,0.02) 0%,
              rgba(0,0,0,0.05) 100%
            )
          `,
          backgroundSize: '200% 100%, 100% 100%',
          animation: 'shimmer 1.5s infinite ease-in-out',
        }}
      >
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position:
                -200% 0,
                0 0;
            }
            100% {
              background-position:
                200% 0,
                0 0;
            }
          }
        `}</style>

        <div className="space-y-4 p-8">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={`post-content-${url}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        delay: 0.3,
      }}
      style={{
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  )
}
