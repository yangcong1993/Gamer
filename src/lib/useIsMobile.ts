// lib/useIsMobile.ts
import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

export default function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkDevice()

    window.addEventListener('resize', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  return isMobile
}
