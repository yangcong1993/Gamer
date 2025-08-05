// components/AnimatedTopRow.tsx
import React from 'react'
import { motion, MotionProps, Variants } from 'framer-motion'
import type { SVGProps } from 'react'

const topRowPaths: string[] = [
  'M3130 2154 c-6 -14 -10 -28 -10 -31 0 -3 -16 -37 -36 -76 -37 -73 -38 -103 -4 -94 11 3 23 1 26 -4 11 -18 60 3 94 41 41 44 105 164 95 179 -3 6 -39 11 -81 11 -71 0 -75 -1 -84 -26z',
  'M362 2110 c-12 -5 -28 -7 -36 -4 -8 3 -27 -1 -44 -10 -16 -8 -60 -23 -97 -32 -66 -17 -67 -17 -61 -46 12 -60 38 -138 44 -134 4 2 8 -111 9 -252 2 -142 8 -317 14 -390 l12 -132 51 6 c28 4 59 11 68 15 9 5 31 9 49 9 l32 0 -6 175 c-4 105 -3 176 3 180 9 6 41 -50 55 -95 15 -51 118 -291 124 -288 3 2 45 18 94 37 48 19 87 39 87 45 0 7 -39 101 -86 211 -80 185 -85 200 -68 210 44 24 83 73 98 125 19 65 20 107 1 183 -17 73 -43 112 -108 160 -49 36 -54 37 -132 36 -44 0 -90 -4 -103 -9z m101 -195 c48 -20 60 -45 52 -106 -8 -55 -21 -68 -93 -93 l-42 -15 0 72 c0 40 -3 88 -6 109 -5 30 -3 37 12 41 33 8 41 7 77 -8z',
  'M2055 2098 c-7 -29 -14 -827 -7 -890 l5 -48 219 0 219 0 -3 113 -3 112 -122 -1 -121 -2 -8 117 c-7 99 -8 451 -1 576 l2 40 -87 3 c-84 3 -88 2 -93 -20z',
  'M3440 2111 c-94 -10 -165 -65 -216 -168 -23 -46 -25 -61 -20 -115 10 -112 15 -124 70 -175 51 -47 126 -108 206 -168 64 -48 66 -105 5 -125 -55 -18 -76 -9 -119 47 -36 50 -41 53 -75 48 -20 -2 -58 -7 -85 -10 l-48 -7 7 -61 c4 -34 7 -73 6 -87 -1 -17 16 -46 51 -89 l52 -63 130 4 c117 4 136 7 183 31 29 15 57 27 61 27 14 0 71 76 78 104 3 14 10 29 15 32 15 9 10 94 -8 153 -20 61 -74 122 -225 255 -64 56 -78 73 -78 97 0 22 6 32 26 39 46 18 77 12 104 -19 l25 -30 60 13 c82 18 96 26 91 45 -2 9 -7 39 -11 66 -4 28 -19 75 -34 105 l-27 55 -85 1 c-46 1 -109 -2 -139 -5z',
  'M1545 2071 c-8 -20 -7 -403 1 -693 5 -178 10 -238 20 -242 7 -3 30 0 50 6 21 5 57 8 81 4 55 -7 57 0 49 169 l-7 133 56 21 c31 12 60 21 66 21 27 0 69 34 96 77 42 66 57 150 51 281 -5 102 -7 110 -39 155 -55 78 -90 89 -269 85 -119 -2 -151 -6 -155 -17z m235 -175 c45 -13 45 -13 54 -71 13 -79 -6 -133 -54 -158 -33 -16 -36 -16 -47 0 -14 18 -19 243 -5 243 4 0 27 -6 52 -14z',
  'M2745 2083 c-27 -1 -87 -5 -131 -9 l-82 -6 -1 -454 -1 -454 236 5 c130 3 240 8 245 11 5 3 9 48 9 100 l0 94 -139 0 -139 0 -4 70 c-3 67 -2 71 20 77 13 3 49 3 81 -1 32 -4 70 -2 84 3 25 10 26 11 24 103 l-2 93 -102 3 -103 3 0 68 0 69 110 4 c60 1 113 8 119 13 5 6 13 56 16 113 l8 102 -99 -2 c-55 -1 -121 -3 -149 -5z',
  'M1058 2063 c-10 -13 -12 -103 -10 -452 2 -240 8 -443 12 -451 6 -11 27 -15 88 -15 45 0 83 3 86 6 3 2 9 74 13 159 l8 155 68 15 c81 19 131 54 147 107 7 21 19 49 28 63 17 27 18 75 3 217 -11 104 -39 161 -93 189 -48 25 -331 30 -350 7z m242 -194 l33 -12 -7 -84 c-3 -47 -12 -90 -19 -96 -14 -14 -63 -37 -77 -37 -11 0 -13 75 -3 173 7 74 11 77 73 56z',
  'M792 2033 c-12 -30 -7 -783 5 -840 6 -26 24 -28 133 -16 l62 6 -6 106 c-3 58 -6 253 -6 434 l0 327 -90 0 c-77 0 -92 -3 -98 -17z',
]

// 定义组件的props类型，它结合了自定义props、framer-motion的props和标准的SVG props
type AnimatedTopRowProps = {
  duration?: number
  stagger?: number
  strokeWidth?: number
} & MotionProps &
  Omit<SVGProps<SVGSVGElement>, keyof MotionProps>

export function AnimatedTopRow({
  duration = 2.5,
  stagger = 0.08,
  strokeWidth = 15,
  ...props
}: AnimatedTopRowProps) {
  const drawContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  }

  const drawPathVariants: Variants = {
    hidden: { pathOffset: 1, pathLength: 1 },
    visible: {
      pathOffset: 0,
      pathLength: 1,
      transition: { duration: duration, ease: 'easeInOut' },
    },
  }

  const fillVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: duration * 1.3, duration: 0.5 } },
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 110"
      preserveAspectRatio="xMinYMid meet"
      initial="hidden"
      animate="visible"
      {...props}
    >
      <motion.g
        transform="translate(0, 220) scale(0.1, -0.1)"
        fill="currentColor"
        variants={fillVariants}
      >
        {topRowPaths.map((d, i) => (
          <path key={`fill-${i}`} d={d} />
        ))}
      </motion.g>
      <motion.g
        transform="translate(0, 220) scale(0.1, -0.1)"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={drawContainerVariants}
      >
        {topRowPaths.map((d, i) => (
          <motion.path key={`draw-${i}`} d={d} variants={drawPathVariants} />
        ))}
      </motion.g>
    </motion.svg>
  )
}
