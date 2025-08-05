// file: components/ScrollManager.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface ScrollManagerProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function ScrollManager({ containerRef }: ScrollManagerProps) {
  const [isVisible, setIsVisible] = useState(false) // 控制箭头是否可见
  const [isAtBottom, setIsAtBottom] = useState(false) // 控制箭头方向和功能

  const checkScrollState = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const isScrollable = container.scrollHeight > container.clientHeight
    setIsVisible(isScrollable)

    if (isScrollable) {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 5
      setIsAtBottom(atBottom)
    }
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', checkScrollState)

    const resizeObserver = new ResizeObserver(checkScrollState)
    resizeObserver.observe(container)

    checkScrollState()

    return () => {
      container.removeEventListener('scroll', checkScrollState)
      resizeObserver.disconnect()
    }
  }, [containerRef, checkScrollState])

  const handleArrowClick = () => {
    const container = containerRef.current
    if (!container) return

    if (isAtBottom) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleArrowClick()
    }
  }

  return (
    <div
      className={`scroll-manager-arrow ${isVisible ? 'visible' : ''} ${isAtBottom ? 'at-bottom' : ''}`}
      onClick={handleArrowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleArrowClick()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={isAtBottom ? 'Scroll to top' : 'Scroll to bottom'}
    >
      <Image
        src="/static/images/arrow.svg"
        alt="Scroll arrow"
        width={24}
        height={24}
        className="arrow-image"
      />
    </div>
  )
}
