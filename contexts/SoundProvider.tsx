// file: contexts/SoundProvider.tsx

'use client'

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react'
import useHoverSound from '@/lib/useHoverSound'

interface SoundContextType {
  playSound: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)
const MIN_PLAY_INTERVAL = 200
export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const { unlock, play } = useHoverSound('/static/audio/title_decision.mp3')
  const lastPlayTimeRef = useRef(0)
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlock()
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [unlock])

  const playSound = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayTimeRef.current > MIN_PLAY_INTERVAL) {
      play()
      lastPlayTimeRef.current = now
    }
  }, [play])

  return <SoundContext.Provider value={{ playSound }}>{children}</SoundContext.Provider>
}

export const useSound = () => {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
