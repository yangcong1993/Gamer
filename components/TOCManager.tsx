// components/TOCManager.tsx
'use client'

import { useEffect } from 'react'
import { useTOC } from '@/contexts/TOCProvider'
interface TocItem {
  value: string
  url: string
  depth: number
}

export default function TOCManager({ toc }: { toc: TocItem[] }) {
  const { setTOC } = useTOC()

  useEffect(() => {
    setTOC(toc)
    return () => {
      setTOC(null)
    }
  }, [toc, setTOC])

  return null
}
