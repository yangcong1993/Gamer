// lib/hooks/useTabFocusEffect.ts
'use client'

import { useEffect, useRef } from 'react'

/**
 * 一个自定义 Hook，用于在浏览器标签页失去焦点时更改文档标题，
 * 并在用户返回时恢复原标题。
 * @param awayMessage - 用户离开标签页时显示的标题。
 */
export function useTabFocusEffect(awayMessage: string) {
  const originalTitleRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = awayMessage
      } else {
        document.title = originalTitleRef.current || ''
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (originalTitleRef.current) {
        document.title = originalTitleRef.current
      }
    }
  }, [awayMessage])
}
