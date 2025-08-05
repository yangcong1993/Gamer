'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import React, { forwardRef } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ScrollManager from '@/components/ScrollManager'
import StyledLink from '@/components/StyledLink'
import LoadingOverlay from '@/components/LoadingOverlay'
import useFloatingSword from '@/lib/useFloatingSword'
import useIsMobile from '@/lib/useIsMobile'
import { useSound } from '@/contexts/SoundProvider'
import GlowingStone from '@/components/GlowingStone'
import { useTOC } from '@/contexts/TOCProvider'
import AdvancedTOC from '@/components/AdvancedTOC'
import CharacterOverlay from '@/components/CharacterOverlay'
import '@/css/character.css'
import { InkDropAnimation } from '@/components/InkAnimations'
const DraggablePanel = dynamic(() => import('@/components/DraggablePanel'), { ssr: false })
const OnlineCounter = dynamic(() => import('@/components/OnlineCounter'), { ssr: false })

const menuItems = [
  { name: 'HOME', href: '/' },
  { name: 'BLOG', href: '/blog' },
  { name: 'SPARKS', href: '/sparks' },
  { name: 'PROJECTS', href: '/projects' },
  { name: 'COOP', href: '/coop' },
]

export default function InteractiveLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const characterApiRef = useRef<{
    notifyClick: (event: React.MouseEvent<HTMLDivElement>) => void
  }>(null)

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    characterApiRef.current?.notifyClick(event)
  }

  const [isInitialized, setIsInitialized] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [animationFinished, setAnimationFinished] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPostPage, setIsPostPage] = useState(false)
  const [showInitialMobileSword, setShowInitialMobileSword] = useState(false)
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const [isCharacterControlActive, setIsCharacterControlActive] = useState(false)
  const [isSwordHovering, setIsSwordHovering] = useState(false)
  const isMobile = useIsMobile()
  const { playSound } = useSound()
  const lastPlayRef = useRef(0)
  const { toc } = useTOC()

  const isHomePage = /^\/(en|zh|ja)?\/?$/.test(pathname)
  const isBlogSection =
    /^\/(en|zh|ja)?\/blog/.test(pathname) || /^\/(en|zh|ja)?\/tags/.test(pathname)
  const canHaveCharacter = !isHomePage && !isMobile
  const shouldAnimateInk = isPostPage && isNavOpen && !isClosing && !isMobile

  const playInteractionSound = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayRef.current > 50) {
      playSound()
      lastPlayRef.current = now
    }
  }, [playSound])

  const switchControlContext = useCallback(() => {
    if (canHaveCharacter) {
      setIsCharacterControlActive((prev) => !prev)
      playInteractionSound()
    }
  }, [canHaveCharacter, playInteractionSound])

  useEffect(() => {
    const isPost = /^\/(en|zh|ja)?\/blog\/(?!page\/).+/.test(pathname)
    const savedNavState = sessionStorage.getItem('isNavOpen') === 'true'
    const navShouldBeOpen = savedNavState || !isHomePage
    setIsNavOpen(navShouldBeOpen)
    setIsCharacterControlActive(!isHomePage && !isMobile)
    setIsPostPage(isPost)
    setIsInitialized(true)
    setHasMounted(true)

    const pathWithoutLocale = pathname.replace(/^\/(en|zh|ja)/, '') || '/'
    const currentIndex = menuItems.findIndex((item) => item.href === pathWithoutLocale)
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex)
    }
  }, [pathname, isMobile, isHomePage])

  useEffect(() => {
    const swordDismissed = sessionStorage.getItem('mobileSwordDismissed') === 'true'
    if (isMobile && isHomePage && !swordDismissed) {
      setShowInitialMobileSword(true)
    } else {
      setShowInitialMobileSword(false)
    }
  }, [isMobile, isHomePage])

  useEffect(() => {
    if (scrollContainerRef.current) {
      setScrollRoot(scrollContainerRef.current)
    }
  }, [pathname, hasMounted])

  useEffect(() => {
    if (hasMounted && typeof window !== 'undefined') {
      sessionStorage.setItem('isNavOpen', String(isNavOpen))
    }
  }, [hasMounted, isNavOpen])

  const toggleNav = useCallback(() => {
    if (isMobile && showInitialMobileSword) {
      setShowInitialMobileSword(false)
      sessionStorage.setItem('mobileSwordDismissed', 'true')
    }

    if (isNavOpen && !isClosing) {
      setIsClosing(true)
      setAnimationFinished(false)
      setHasInteracted(true)
      setTimeout(() => {
        setIsNavOpen(false)
        setIsClosing(false)
      }, 1200)
    } else if (!isNavOpen) {
      playInteractionSound()
      setIsNavOpen(true)
      setAnimationFinished(false)
      setHasInteracted(true)
      const pathWithoutLocale = pathname.replace(/^\/(en|zh|ja)/, '') || '/'
      const currentIndex = menuItems.findIndex((item) => item.href === pathWithoutLocale)
      setActiveIndex(currentIndex !== -1 ? currentIndex : 0)
    }
  }, [isNavOpen, isClosing, pathname, isMobile, playInteractionSound, showInitialMobileSword])

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === 'sword-sweep-and-reveal') {
      setAnimationFinished(true)
    }
  }

  useEffect(() => {
    if (!isInitialized) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isNavOpen && !hasInteracted) {
        if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
          return
        }
        toggleNav()
        return
      }

      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        switchControlContext()
        return
      }

      if (isCharacterControlActive) {
        return
      } else {
        switch (event.key) {
          case 'ArrowRight':
            setActiveIndex((i) => (i + 1) % menuItems.length)
            playInteractionSound()
            break
          case 'ArrowLeft':
            setActiveIndex((i) => (i - 1 + menuItems.length) % menuItems.length)
            playInteractionSound()
            break
          case 'Enter':
          case ' ':
            event.preventDefault()
            if (isNavOpen) {
              router.push(menuItems[activeIndex].href)
            }
            break
          default:
            break
        }
      }
    }

    const timer = setTimeout(() => {
      if (!hasInteracted) setShowPrompt(true)
    }, 3000)

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [
    isInitialized,
    isCharacterControlActive,
    isNavOpen,
    hasInteracted,
    activeIndex,
    router,
    playInteractionSound,
    switchControlContext,
    toggleNav,
  ])

  useEffect(() => {
    if (hasInteracted) setShowPrompt(false)
  }, [hasInteracted])

  const shouldEnableSwordFollow = hasMounted && !isMobile && !isClosing
  const shouldFollowMouse = shouldEnableSwordFollow && !isNavOpen
  const swordFollowRef = useFloatingSword(shouldEnableSwordFollow, shouldFollowMouse)

  if (!hasMounted) {
    return <LoadingOverlay />
  }

  const containerCls = `homepage-container ${isNavOpen ? 'nav-open' : ''} ${
    isClosing ? 'nav-closing' : ''
  }`
  const navcardCls = `navcard ${isBlogSection ? 'is-post-page' : ''}`
  const swordContainerCls = `sword-container ${animationFinished ? 'animation-finished' : ''}`

  return (
    <div className={containerCls} data-initialized={isInitialized}>
      {(!isMobile || showInitialMobileSword) && (
        <div className={swordContainerCls} onAnimationEnd={handleAnimationEnd}>
          <div className="sword-animation-wrapper" ref={swordFollowRef}>
            <svg
              className="sword-svg-container"
              style={{ overflow: 'visible' }}
              viewBox="0 0 100 390"
              onClick={toggleNav}
              onMouseEnter={() => {
                playInteractionSound()
                setIsSwordHovering(true)
              }}
              onMouseLeave={() => {
                setIsSwordHovering(false)
              }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="gold-stroke-filter">
                  <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="1.5" />
                  <feFlood floodColor="gold" result="flood" />
                  <feComposite in="flood" in2="DILATED" operator="in" result="stroke" />
                  <feMerge>
                    <feMergeNode in="stroke" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <image
                href="/static/images/Master_Sword.avif"
                x="0"
                y="0"
                width="100"
                height="390"
                className="master-sword-image"
                style={{ transformOrigin: 'center' }}
              />
              <AnimatePresence>
                {shouldAnimateInk && (
                  <InkDropAnimation
                    key={pathname}
                    isAnimating={true}
                    isHovering={isSwordHovering}
                  />
                )}
              </AnimatePresence>
            </svg>
            <AnimatePresence>
              {isPostPage && isNavOpen && !isClosing && toc && scrollRoot && (
                <motion.div
                  className="pointer-events-none absolute right-0 bottom-0 left-0 flex h-3/5 items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 1 } }}
                  exit={{ opacity: 0 }}
                  style={{ transform: 'scale(-1, -1)' }}
                >
                  <div className="hide-scrollbar pointer-events-auto flex max-h-full w-full justify-center overflow-y-auto p-4">
                    <div className="w-auto">
                      <AdvancedTOC
                        key={pathname}
                        toc={toc}
                        scrollRoot={scrollRoot}
                        pathname={pathname}
                        exclude="Introduction"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <DraggablePanel playInteractionSound={playInteractionSound} />

      <div className={navcardCls}>
        <OnlineCounter />
        <nav className="nav-menu-panel">
          <ul className="nav-menu">
            {menuItems.map((item, i) => (
              <li
                key={item.name}
                className={`nav-item ${activeIndex === i ? 'active' : ''}`}
                onMouseEnter={() => {
                  setActiveIndex(i)
                  playInteractionSound()
                }}
              >
                <StyledLink href={item.href} onSoundClick={playInteractionSound}>
                  {item.name}
                </StyledLink>
                <Image
                  src="/static/images/hand-cursor.avif"
                  alt=""
                  width={24}
                  height={11}
                  className="hand-cursor"
                  unoptimized
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </nav>
        {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div className="navcard-content">
          {isHomePage ? (
            children
          ) : (
            <div
              className="description-box relative"
              ref={scrollContainerRef}
              onClick={handleContentClick}
            >
              <AnimatePresence mode="wait">
                <motion.div key={pathname} className="contents">
                  {children}
                </motion.div>
              </AnimatePresence>
              {!isMobile && scrollContainerRef.current && (
                <CharacterOverlay
                  ref={characterApiRef}
                  pathname={pathname}
                  contentRef={scrollContainerRef}
                  isControlActive={isCharacterControlActive}
                />
              )}
            </div>
          )}
          <ScrollManager key={pathname} containerRef={scrollContainerRef} />
        </div>
      </div>

      {showPrompt && !isNavOpen && (
        <div className="prompt-container">
          <p className="prompt-text-en">PRESS ANY KEY TO CONTINUE</p>
          <p className="prompt-text-cn">按任意键继续</p>
        </div>
      )}

      <GlowingStone />
    </div>
  )
}
