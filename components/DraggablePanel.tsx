// DraggablePanel.tsx

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import FontSwitcher from './FontSwitcher'
import LanguageSwitcher from './LanguageSwitcher'
import SearchButton from './SearchButton'

interface DraggablePanelProps {
  playInteractionSound: () => void
}

const DraggablePanel = ({ playInteractionSound }: DraggablePanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const offsetRef = useRef({ x: 0, y: 0 })
  const positionRef = useRef(position)
  const searchWrapperRef = useRef<HTMLDivElement>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (positionRef.current.x !== position.x || positionRef.current.y !== position.y) {
      positionRef.current = position
    }
  }, [position])

  useEffect(() => {
    const savedPos = localStorage.getItem('switcher-panel-position')
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos)
        setPosition(parsed)
      } catch {
        initializeDefaultPosition()
      }
    } else {
      initializeDefaultPosition()
    }

    function initializeDefaultPosition() {
      const padding = 25
      const estimatedPanelWidth = 160
      const estimatedPanelHeight = 70
      const initialX = window.innerWidth - estimatedPanelWidth - padding
      const initialY = window.innerHeight - estimatedPanelHeight - padding
      setPosition({ x: initialX, y: initialY })
    }
  }, [])

  const handleResize = useCallback(() => {
    if (!panelRef.current) return

    const panel = panelRef.current
    const maxX = window.innerWidth - panel.offsetWidth - 5
    const maxY = window.innerHeight - panel.offsetHeight - 5
    const currentPos = positionRef.current

    // 只在实际需要调整时才更新位置
    const newX = Math.min(currentPos.x, maxX)
    const newY = Math.min(currentPos.y, maxY)

    if (newX !== currentPos.x || newY !== currentPos.y) {
      setPosition({ x: newX, y: newY })
    }
  }, [])

  const debouncedHandleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    resizeTimeoutRef.current = setTimeout(handleResize, 100)
  }, [handleResize])

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [debouncedHandleResize, handleResize])

  const rafRef = useRef<number | null>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !panelRef.current) return

      e.preventDefault()

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!panelRef.current) return

        let newX = 0,
          newY = 0
        if ('touches' in e) {
          newX = e.touches[0].clientX - offsetRef.current.x
          newY = e.touches[0].clientY - offsetRef.current.y
        } else {
          newX = e.clientX - offsetRef.current.x
          newY = e.clientY - offsetRef.current.y
        }

        newX = Math.max(0, Math.min(newX, window.innerWidth - panelRef.current.offsetWidth))
        newY = Math.max(0, Math.min(newY, window.innerHeight - panelRef.current.offsetHeight))

        setPosition({ x: newX, y: newY })
      })
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.classList.remove('is-dragging')
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    setTimeout(() => {
      localStorage.setItem('switcher-panel-position', JSON.stringify(positionRef.current))
    }, 50)
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!panelRef.current) return

      e.preventDefault()
      setIsDragging(true)

      const panel = panelRef.current
      const rect = panel.getBoundingClientRect()

      if ('touches' in e) {
        offsetRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        }
      } else {
        offsetRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }

      document.body.classList.add('is-dragging')
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    },
    []
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
    }
  }, [])

  const touchMoveOptions = useMemo(() => ({ passive: false }), [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove, touchMoveOptions)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, touchMoveOptions])

  const panelStyle = useMemo(
    () => ({
      left: `${position.x}px`,
      top: `${position.y}px`,
      touchAction: isDragging ? ('none' as const) : ('auto' as const),
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
    }),
    [position.x, position.y, isDragging]
  )

  const dragHandleStyle = useMemo(
    () => ({
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      WebkitTouchCallout: 'none' as const,
      touchAction: 'none' as const,
    }),
    []
  )

  const svgStyle = useMemo(
    () => ({
      pointerEvents: 'none' as const,
      userSelect: 'none' as const,
    }),
    []
  )

  const cursorStyle = useMemo(
    () => ({
      cursor: "url('/static/cursor/click.cur'), pointer",
    }),
    []
  )

  return (
    <div
      ref={panelRef}
      className={`draggable-panel ${isDragging ? 'is-dragging' : ''}`}
      style={panelStyle}
    >
      <div
        className="drag-handle"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Drag to move panel"
        style={dragHandleStyle}
      >
        <svg
          width="24"
          height="12"
          viewBox="0 0 24 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={svgStyle}
        >
          <circle cx="2" cy="2" r="2" fill="currentColor" />
          <circle cx="2" cy="10" r="2" fill="currentColor" />
          <circle cx="12" cy="2" r="2" fill="currentColor" />
          <circle cx="12" cy="10" r="2" fill="currentColor" />
          <circle cx="22" cy="2" r="2" fill="currentColor" />
          <circle cx="22" cy="10" r="2" fill="currentColor" />
        </svg>
      </div>

      <ThemeSwitcher
        onClick={playInteractionSound}
        onMouseEnter={playInteractionSound}
        style={cursorStyle}
      />
      <FontSwitcher
        onClick={playInteractionSound}
        onMouseEnter={playInteractionSound}
        style={cursorStyle}
      />
      <LanguageSwitcher
        onItemClick={playInteractionSound}
        onMouseEnter={playInteractionSound}
        style={cursorStyle}
      />
      <div
        ref={searchWrapperRef}
        role="button"
        tabIndex={0}
        onMouseEnter={playInteractionSound}
        style={cursorStyle}
        className="font-switcher"
        aria-label="Open search"
      >
        <SearchButton />
      </div>
    </div>
  )
}

export default DraggablePanel
