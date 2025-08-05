'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface ClickFeedbackContextType {
  clickedHref: string | null
  setClickedHref: (href: string) => void
}

const ClickFeedbackContext = createContext<ClickFeedbackContextType | undefined>(undefined)

export const ClickFeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [clickedHref, setClickedHrefState] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (clickedHref) {
      setClickedHrefState(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const setClickedHref = (href: string) => {
    if (pathname !== href) {
      setClickedHrefState(href)
    }
  }

  return (
    <ClickFeedbackContext.Provider value={{ clickedHref, setClickedHref }}>
      {children}
    </ClickFeedbackContext.Provider>
  )
}

export const useClickFeedback = () => {
  const context = useContext(ClickFeedbackContext)
  if (context === undefined) {
    throw new Error('useClickFeedback must be used within a ClickFeedbackProvider')
  }
  return context
}
