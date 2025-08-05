// file: components/HomePageContent.tsx

'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import Image from 'next/image'
import { LanguageContext } from '@/contexts/LanguageProvider'
import { motion } from 'framer-motion'
import RealtimeIcon from '@/components/RealtimeIcon'
import { useSound } from '@/contexts/SoundProvider'
import { useTooltip } from '@/contexts/TooltipProvider'
import Footer from '@/components/Footer'
import { AnimatedTopRow } from '@/components/AnimatedTopRow'
import { AnimatedBottomRow } from '@/components/AnimatedBottomRow'
import SkillsSection from '@/components/SkillsSection'
const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef5350" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.382 20.75C12.238 20.82 12.119 20.85 12 20.85C11.881 20.85 11.762 20.82 11.618 20.75C7.948 18.96 2 14.83 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 14.83 16.052 18.96 12.382 20.75Z"
      stroke="var(--retro-border-color, #000)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const DropletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#26a69a" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.67 6.55 4 10.48 4 13.42C4 17.31 7.69 22 12 22C16.31 22 20 17.31 20 13.42C20 10.48 17.33 6.55 12 2Z"
      stroke="var(--retro-border-color, #000)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

// 定义从服务器组件接收的 props 类型
interface HomePageContentProps {
  initialAgeInfo: {
    years: number
    progress: number
  }
}

export default function HomePageContent({ initialAgeInfo }: HomePageContentProps) {
  const [ageInfo, setAgeInfo] = useState(initialAgeInfo)
  const [activeAvatar, setActiveAvatar] = useState<'default' | 'secondary'>('default')
  const [showScrollHint, setShowScrollHint] = useState(false)
  const descriptionBoxRef = useRef<HTMLDivElement>(null)

  const langContext = useContext(LanguageContext)
  const pathname = usePathname()
  const lang = useContext(LanguageContext)?.language ?? 'en'
  const { playSound } = useSound()
  const { showTooltip, hideTooltip } = useTooltip()
  const statsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
  }

  const barFillVariants = {
    hidden: { width: '0%' },
    visible: {
      width: '100%',
    },
  }
  const initialMediaConfig = {
    default: { type: 'video', src: '/static/images/ripple-new.webm' },
    secondary: { type: 'image', src: '/static/images/ripple-2.png' },
  }
  const [avatarMedia, setAvatarMedia] = useState(initialMediaConfig)

  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      setAvatarMedia({
        default: { type: 'image', src: '/static/images/ripple.gif' },
        secondary: { type: 'image', src: '/static/images/ripple-2.png' },
      })
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      if (!langContext?.messages) return key
      const keys = key.split('.')
      let result: Record<string, unknown> | string = langContext.messages
      for (const k of keys) {
        if (typeof result === 'object' && result !== null && k in result) {
          result = result[k] as Record<string, unknown> | string
        } else {
          return key
        }
      }
      return typeof result === 'string' ? result : key
    },
    [langContext?.messages]
  )

  const handleAvatarClick = useCallback(() => {
    playSound()
    setActiveAvatar((a) => (a === 'default' ? 'secondary' : 'default'))
  }, [playSound])

  const handleAvatarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleAvatarClick()
      }
    },
    [handleAvatarClick]
  )

  useEffect(() => {
    const box = descriptionBoxRef.current
    if (!box) return

    const handleScroll = () => {
      const bottom = box.scrollHeight - box.scrollTop - box.clientHeight
      setShowScrollHint(bottom > 10)
    }

    box.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => box.removeEventListener('scroll', handleScroll)
  }, [])

  if (!langContext) {
    return <div>Loading page...</div>
  }

  const { messages } = langContext

  return (
    <>
      {/* —— 左侧人物 + 状态框 —— */}
      <div className="status-panel">
        <div
          className="avatar-container"
          onClick={handleAvatarClick}
          onKeyDown={handleAvatarKeyDown}
          onMouseEnter={playSound}
          role="button"
          tabIndex={0}
          aria-label="Switch avatar"
        >
          {Object.entries(avatarMedia).map(([key, media]) => {
            const isVisible = activeAvatar === key
            if (media.type === 'video') {
              return (
                <video
                  key={key}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`avatar-image transitionable absolute inset-0 h-full w-full object-cover ${isVisible ? 'visible' : ''}`}
                >
                  <source src={media.src} type="video/webm" />
                </video>
              )
            }
            const isGif = media.src.endsWith('.gif')
            return (
              <Image
                key={key}
                src={media.src}
                alt=""
                fill
                sizes="(max-width: 768px) 30vw, 25vw"
                priority={key === 'default'}
                unoptimized={isGif}
                className={`avatar-image transitionable ${isVisible ? 'visible' : ''}`}
              />
            )
          })}
          <div className="decorations">
            <Image
              src="/static/images/avatar_d1.png"
              alt=""
              width={40}
              height={40}
              className="deco d1"
            />
          </div>
        </div>

        <div className="thought-bubble">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="48" r="5" fill="black" stroke="white" strokeWidth="2" />
            <circle cx="25" cy="35" r="7" fill="black" stroke="white" strokeWidth="2" />
            <circle cx="48" cy="18" r="12" fill="black" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <motion.div
          className="stats-box-retro"
          variants={statsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
        >
          <div className="name-bar flex items-center justify-between gap-2">
            <span>
              Ripple
              <span className="name-handle">@CelestialRipple</span>
            </span>
            <RealtimeIcon className="h-5 w-5 shrink-0 cursor-pointer" />
          </div>

          {/* 年龄进度条 */}
          <div className="stat-bar-retro level-bar">
            <motion.div
              className="bar-fill-retro"
              initial={{ width: 0 }}
              whileInView={{
                width: `${ageInfo.progress}%`,
                transition: { type: 'spring', stiffness: 50, damping: 20, duration: 3.5 },
              }}
              viewport={{ once: true }}
            />
            <div className="bar-text-retro">LVL. {ageInfo.years}</div>
          </div>

          {/* 爱心 (HP) 进度条 */}
          <div className="stat-line">
            <div className="icon-container-retro">
              <HeartIcon />
            </div>
            <div className="stat-bar-retro hp-bar">
              <motion.div
                className="bar-fill-retro"
                variants={barFillVariants}
                transition={{ type: 'spring', stiffness: 50, damping: 20, duration: 3.5 }}
              />
              <div className="bar-text-retro centered">172/172</div>
            </div>
          </div>

          {/* 水滴 (MP) 进度条 */}
          <div className="stat-line">
            <div className="icon-container-retro">
              <DropletIcon />
            </div>
            <div className="stat-bar-retro mp-bar">
              <motion.div
                className="bar-fill-retro"
                variants={barFillVariants}
                transition={{ type: 'spring', stiffness: 50, damping: 20, duration: 3.5 }}
              />
              <div className="bar-text-retro centered">55/55</div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* —— 右侧简介 —— */}
      <div className="description-box" ref={descriptionBoxRef}>
        <div className="description-content">
          <div className="logo-container-split">
            <AnimatedTopRow />
            <AnimatedBottomRow />
          </div>

          <p dangerouslySetInnerHTML={{ __html: t('HomePage.Intro.p1') }} />
          <p dangerouslySetInnerHTML={{ __html: t('HomePage.Intro.p2') }} />
          <p dangerouslySetInnerHTML={{ __html: t('HomePage.Intro.p3') }} />
          <p dangerouslySetInnerHTML={{ __html: t('HomePage.Intro.p4') }} />
          <p dangerouslySetInnerHTML={{ __html: t('HomePage.Intro.p5') }} />
          <SkillsSection />
        </div>

        <Footer />
      </div>
      {showScrollHint && (
        <div className="scroll-hint visible">
          <Image src="/static/images/arrow.svg" alt="Scroll down" width={24} height={24} />
        </div>
      )}
    </>
  )
}
