// file: components/GlowingStone.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function GlowingStone() {
  const [isGlowing, setIsGlowing] = useState(false)

  const handleClick = () => {
    if (isGlowing) return
    setIsGlowing(true)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-8 left-80 z-50 cursor-pointer border-none bg-transparent p-0 text-left"
      aria-label="Activate the mysterious stone"
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isGlowing ? [0, 1, 0] : 0,
          filter: isGlowing
            ? [
                'drop-shadow(0 0 0px #FFD700)',
                'drop-shadow(0 0 25px #FFD700)',
                'drop-shadow(0 0 0px #FFD700)',
              ]
            : 'none',
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (isGlowing) {
            setIsGlowing(false)
          }
        }}
      >
        <Image
          src="/static/images/stone.avif"
          alt="七色石"
          width={80}
          height={80}
          unoptimized
          style={{ pointerEvents: 'none' }}
        />
      </motion.div>
    </button>
  )
}
