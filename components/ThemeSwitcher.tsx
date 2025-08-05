// file: components/ThemeSwitcher.tsx

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ThemeSwitcherProps {
  onMouseEnter?: () => void
  onClick?: () => void
  style?: React.CSSProperties
}

const ThemeSwitcher = ({ onMouseEnter, onClick, style }: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    if (onClick) {
      onClick()
    }
    setTheme(isDarkMode ? 'light' : 'dark')
  }

  if (!mounted) {
    return <div style={{ width: '28px', height: '28px' }} />
  }

  const isDarkMode = theme === 'dark' || resolvedTheme === 'dark'

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={onMouseEnter}
      className="theme-switcher"
      aria-label="Toggle Theme"
      style={style}
    >
      {isDarkMode ? (
        <Image
          src="/static/images/bulb-off.avif"
          alt="Switch to Light Mode"
          width={28}
          height={28}
          unoptimized
        />
      ) : (
        <Image
          src="/static/images/bulb-on.avif"
          alt="Switch to Dark Mode"
          width={28}
          height={28}
          className="bulb-on"
          unoptimized
        />
      )}
    </button>
  )
}

export default ThemeSwitcher
