// file: components/FontSwitcher.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface FontSwitcherProps {
  onClick?: () => void
  onMouseEnter?: () => void
  style?: React.CSSProperties
}

const FontSwitcher = ({ onClick, onMouseEnter, style }: FontSwitcherProps) => {
  const [mounted, setMounted] = useState(false)
  const [isCommonFont, setIsCommonFont] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsCommonFont(document.documentElement.classList.contains('font-common'))
  }, [])

  const handleToggle = async () => {
    if (onClick) {
      onClick()
    }
    document.body.classList.add('font-transitioning')

    await new Promise((resolve) => setTimeout(resolve, 150))

    const newIsCommon = document.documentElement.classList.toggle('font-common')
    setIsCommonFont(newIsCommon)
    localStorage.setItem('font', newIsCommon ? 'common' : 'pixel')

    document.body.classList.remove('font-transitioning')
  }

  if (!mounted) {
    return <div style={{ width: '28px', height: '28px' }} />
  }

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={onMouseEnter}
      className="font-switcher"
      aria-label="Toggle Font"
      style={style}
    >
      {isCommonFont ? (
        <Image
          src="/static/images/common-font.svg"
          alt="Switch to Pixel Font"
          width={28}
          height={28}
        />
      ) : (
        <Image src="/static/images/pixel.svg" alt="Switch to Common Font" width={28} height={28} />
      )}
    </button>
  )
}

export default FontSwitcher
