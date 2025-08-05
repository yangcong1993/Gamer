'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'

/* --------------------- 基础数据 --------------------- */

interface Drop {
  cx: number
  cy: number
  r: number
}

const inkDrops: Drop[] = [
  { cx: 45, cy: 180, r: 50 },
  { cx: 60, cy: 220, r: 47 },
  { cx: 68, cy: 270, r: 45 },
  { cx: 53, cy: 320, r: 55 },
  { cx: 50, cy: 365, r: 45 },
  { cx: 30, cy: 130, r: 15 },
  { cx: 95, cy: 120, r: 20 },
  { cx: 80, cy: 430, r: 7 },
  { cx: 60, cy: 350, r: 9 },
]

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateSmoothPolygon(cx: number, cy: number, r: number, seed: number, variance = 0.1) {
  const sides = r > 40 ? 22 : r > 15 ? 16 : 12
  const rand = mulberry32(seed)

  const j: number[] = Array.from({ length: sides }, () => {
    return 1 + (rand() * 2 - 1) * variance
  })

  const smooth: number[] = j.map((_, i) => {
    const prev = j[(i - 1 + sides) % sides]
    const next = j[(i + 1) % sides]
    return (prev + j[i] + next) / 3
  })

  const pts: string[] = []
  for (let i = 0; i < sides; i++) {
    const theta = (2 * Math.PI * i) / sides
    const rr = r * smooth[i]
    const x = Math.round(cx + rr * Math.cos(theta))
    const y = Math.round(cy + rr * Math.sin(theta))
    pts.push(`${x},${y}`)
  }
  return pts.join(' ')
}

const PRECOMPUTED_POINTS = inkDrops.map((d, idx) => generateSmoothPolygon(d.cx, d.cy, d.r, idx))

interface InkDropAnimationProps {
  isAnimating: boolean
  isHovering?: boolean
}

const InkDrop = memo(
  ({
    points,
    index,
    isAnimating,
    isHovering,
  }: {
    points: string
    index: number
    isAnimating: boolean
    isHovering: boolean
  }) => {
    const { cx, cy } = inkDrops[index]
    const enterDelay = index * 0.08

    return (
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isAnimating ? 1 : 0,
          rotate: isHovering ? 360 : 0,
          scale: isHovering ? [1, 1.05, 1] : 1,
        }}
        exit={{
          opacity: 0,
          scale: 0,
          transition: { duration: 0.3, delay: (inkDrops.length - 1 - index) * 0.05 },
        }}
        transition={{
          opacity: { duration: 0.5, delay: enterDelay },
          rotate: {
            duration: 4,
            ease: 'easeInOut',
            delay: isHovering ? index * 1.35 : 0,
          },
          scale: {
            duration: 2,
            ease: 'easeInOut',
            repeat: isHovering ? Infinity : 0,
            repeatType: 'mirror',
            delay: isHovering ? index * 0.5 : 0,
          },
        }}
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transformBox: 'fill-box',
        }}
      >
        <polygon points={points} fill="black" />
      </motion.g>
    )
  }
)
InkDrop.displayName = 'InkDrop'

export const InkDropAnimation = memo(
  ({ isAnimating, isHovering = false }: InkDropAnimationProps) => (
    <g>
      {PRECOMPUTED_POINTS.map((pts, idx) => (
        <InkDrop
          key={idx}
          points={pts}
          index={idx}
          isAnimating={isAnimating}
          isHovering={isHovering}
        />
      ))}
    </g>
  ),
  (p, n) => p.isAnimating === n.isAnimating && p.isHovering === n.isHovering
)
InkDropAnimation.displayName = 'InkDropAnimation'

export const InkDropTransition = memo(() => null)
InkDropTransition.displayName = 'InkDropTransition'
