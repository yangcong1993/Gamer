'use client'

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import { createPortal } from 'react-dom'

interface TooltipContextType {
  showTooltip: (content: ReactNode, e: React.MouseEvent<HTMLElement>) => void
  hideTooltip: () => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export const TooltipProvider = ({ children }: { children: ReactNode }) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    content: ReactNode
    x: number
    y: number
  }>({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  })

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const showTooltip = useCallback((content: ReactNode, e: React.MouseEvent<HTMLElement>) => {
    setTooltip({
      visible: true,
      content,
      x: e.clientX,
      y: e.clientY,
    })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }))
  }, [])

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {isClient &&
        tooltip.visible &&
        createPortal(
          <div
            className="tooltip"
            style={{
              position: 'fixed',
              left: tooltip.x + 15,
              top: tooltip.y + 15,
              pointerEvents: 'none',
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              maxWidth: '300px',
              whiteSpace: 'pre-wrap',
              transition: 'opacity 0.5s ease-in-out',
              opacity: 1,
            }}
          >
            {tooltip.content}
          </div>,
          document.body
        )}
    </TooltipContext.Provider>
  )
}

export const useTooltip = () => {
  const context = useContext(TooltipContext)
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider')
  }
  return context
}
