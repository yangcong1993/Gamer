// file: components/LanguageSwitcher.tsx

'use client'

import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { LanguageContext } from '@/contexts/LanguageProvider'
import Image from 'next/image'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const hasTouch = typeof window !== 'undefined' && navigator.maxTouchPoints > 0
    setIsMobile(hasTouch)
  }, [])
  return isMobile
}

const useClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// --- 组件所需常量 ---
const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'ja', name: '日本語' },
]

interface LanguageSwitcherProps {
  onItemClick?: () => void // 用于播放音效的回调
  onMouseEnter?: () => void // 悬停时播放音效的回调
  style?: React.CSSProperties
}

export default function LanguageSwitcher({
  onItemClick,
  onMouseEnter,
  style,
}: LanguageSwitcherProps) {
  const context = useContext(LanguageContext)
  const isMobile = useIsMobile()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('up')

  const containerRef = useRef<HTMLDivElement>(null)
  const hideMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateMenuPosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.top < 150) {
      setMenuDirection('down')
    } else {
      setMenuDirection('up')
    }
  }, [])

  useClickOutside(containerRef, () => {
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false)
    }
  })

  if (!context) {
    return null
  }

  const { language, changeLanguage } = context

  const handleLanguageSelect = (langCode: string) => {
    changeLanguage(langCode)
    onItemClick?.()
    setIsMenuOpen(false)
    if (hideMenuTimeoutRef.current) {
      clearTimeout(hideMenuTimeoutRef.current)
    }
  }

  const handleDesktopMouseEnter = () => {
    if (isMobile) return
    if (hideMenuTimeoutRef.current) clearTimeout(hideMenuTimeoutRef.current)
    updateMenuPosition()
    setIsMenuOpen(true)
    onMouseEnter?.()
  }

  const handleDesktopMouseLeave = () => {
    if (isMobile) return
    hideMenuTimeoutRef.current = setTimeout(() => setIsMenuOpen(false), 200)
  }

  const handleMobileClick = () => {
    if (!isMobile) return
    const newMenuState = !isMenuOpen
    if (newMenuState) {
      updateMenuPosition()
      onItemClick?.()
    }
    setIsMenuOpen(newMenuState)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleMobileClick()
    }
  }

  const handleLanguageOptionMouseEnter = () => {
    onMouseEnter?.()
  }

  return (
    <div
      ref={containerRef}
      className="language-switcher-container"
      onMouseEnter={handleDesktopMouseEnter}
      onMouseLeave={handleDesktopMouseLeave}
      style={style}
    >
      <div
        className="language-switcher-icon"
        onClick={handleMobileClick}
        onKeyDown={handleKeyDown}
        role="button"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        tabIndex={0}
      >
        <Image src="/static/images/language.svg" alt="Switch Language" width={28} height={28} />
      </div>

      <div className={`tooltip-menu ${menuDirection} ${isMenuOpen ? 'visible' : ''}`}>
        <ul>
          {languageOptions.map((option) => (
            <li key={option.code}>
              <button
                onClick={() => handleLanguageSelect(option.code)}
                onMouseEnter={handleLanguageOptionMouseEnter}
                style={{
                  fontWeight: language === option.code ? 'bold' : 'normal',
                  cursor: "url('/static/cursor/click.cur'), pointer",
                }}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
