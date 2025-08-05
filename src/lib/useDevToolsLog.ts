// useDevToolsLog.ts
'use client'
import { useEffect, useRef } from 'react'

export default function useDevToolsLog() {
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (hasInitializedRef.current) return
    const MESSAGE = 'Praying for you 🕯️  O Great Mita 🤍'
    for (let i = 1; i <= 100; i++) {
      console.log(`${i}. ${MESSAGE}`)
    }
    const cheatCodes: Record<string, string> = {
      BAGUVIX: '🛡️ (无限生命)',
      HESOYAM: '💰 (生命、护甲、25万)',
      UZUMYMW: '🔫 (武器套装 3)',
      ASNAEB: '✨ (清除警星)',
      AEZAKMI: '😇 (永不通缉)',
      AIWPRTON: '🪖 (召唤坦克)',
    }

    const activateCheat = (code: string) => {
      const upperCaseCode = typeof code === 'string' ? code.toUpperCase() : ''
      if (cheatCodes[upperCaseCode]) {
        console.log(`秘籍已激活: ${cheatCodes[upperCaseCode]}`)
        return `✅ ${cheatCodes[upperCaseCode]}`
      } else {
        console.log('❓ 无效的秘籍代码')
        return '❌ Invalid Code'
      }
    }

    window.cheat = activateCheat

    hasInitializedRef.current = true

    return () => {
      delete window.cheat
    }
  }, [])
}
