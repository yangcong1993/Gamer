// contexts/TOCProvider.tsx
'use client'

import { createContext, useState, useContext, ReactNode } from 'react'

interface TocItem {
  value: string
  url: string
  depth: number
}

interface TOCContextType {
  toc: TocItem[] | null
  setTOC: (toc: TocItem[] | null) => void
}

const TOCContext = createContext<TOCContextType | undefined>(undefined)

export function TOCProvider({ children }: { children: ReactNode }) {
  const [toc, setTOC] = useState<TocItem[] | null>(null)
  const value = { toc, setTOC }
  return <TOCContext.Provider value={value}>{children}</TOCContext.Provider>
}

export function useTOC() {
  const context = useContext(TOCContext)
  if (context === undefined) {
    throw new Error('useTOC must be used within a TOCProvider')
  }
  return context
}
