// components/AnimatedBottomRow.tsx
import React from 'react'
import { motion, MotionProps, Variants } from 'framer-motion'
import type { SVGProps } from 'react'

const bottomRowPaths: string[] = [
  'M3395 1019 c-55 -5 -118 -12 -140 -17 l-40 -7 0 -105 c1 -145 27 -844 32 -850 4 -5 60 -3 145 6 l58 6 -5 51 c-7 90 -8 274 -1 286 16 26 34 7 56 -61 13 -40 40 -109 61 -153 20 -44 44 -97 52 -117 17 -40 26 -45 55 -28 9 6 47 23 85 40 37 16 67 32 67 35 0 3 -11 27 -24 53 -14 26 -36 72 -49 102 -14 30 -41 90 -60 132 l-36 77 33 20 c22 14 44 43 66 87 32 65 32 69 28 173 -5 126 -15 148 -91 214 -40 33 -64 47 -86 47 -16 0 -33 5 -36 10 -7 11 -24 11 -170 -1z m127 -199 c21 0 38 -49 38 -111 0 -56 -30 -98 -90 -129 l-37 -19 -5 104 c-3 57 -3 118 0 136 4 30 6 31 41 25 20 -3 43 -6 53 -6z',
  'M3847 1013 c-2 -10 -5 -202 -6 -428 -1 -226 -4 -438 -7 -473 l-6 -62 243 6 244 5 3 120 3 119 -129 0 -129 0 -5 38 c-4 32 0 468 5 632 l2 55 -107 3 c-95 2 -107 1 -111 -15z',
  'M2396 1002 c-2 -10 -14 -60 -25 -112 -12 -52 -28 -117 -35 -145 -8 -27 -22 -85 -33 -127 -10 -43 -21 -78 -24 -78 -4 0 -12 28 -19 63 -7 34 -16 67 -19 72 -3 6 -13 48 -23 94 -9 46 -21 87 -25 91 -4 4 -41 10 -81 14 l-73 5 -14 -32 c-7 -18 -18 -59 -25 -92 -7 -33 -16 -64 -20 -70 -4 -5 -13 -33 -20 -62 -6 -29 -20 -69 -30 -88 -22 -44 -21 -48 -55 154 -14 84 -30 172 -35 195 -5 22 -10 57 -10 77 0 20 -2 38 -5 41 -10 10 -210 -43 -227 -60 -5 -5 3 -51 17 -103 14 -52 32 -141 40 -199 8 -57 26 -145 39 -195 13 -49 27 -110 30 -135 4 -25 15 -83 26 -130 11 -47 22 -98 25 -114 l6 -28 67 8 c37 4 84 7 104 6 42 -3 46 1 63 71 31 122 73 265 82 281 8 15 12 8 21 -36 16 -73 78 -304 86 -316 8 -14 168 -3 184 13 13 11 36 102 67 260 7 39 26 115 40 170 15 55 33 129 40 165 8 36 21 90 29 120 8 30 22 85 31 123 24 95 19 100 -132 111 -52 3 -63 1 -67 -12z',
  'M4355 783 c4 -131 7 -348 9 -483 1 -135 5 -251 10 -258 6 -10 34 -11 124 -6 151 8 284 48 344 102 79 71 130 176 144 294 7 62 -9 218 -32 307 -20 75 -92 178 -150 215 -60 38 -203 65 -347 66 l-108 0 6 -237z m304 -23 c60 -15 84 -49 96 -137 14 -100 5 -232 -19 -268 -16 -24 -127 -85 -156 -85 -12 0 -14 237 -3 404 6 103 7 107 27 101 12 -3 36 -10 55 -15z',
  'M2818 1004 c-50 -15 -108 -57 -148 -106 -39 -48 -49 -71 -73 -164 -25 -99 -27 -120 -23 -234 3 -69 10 -143 16 -165 6 -22 15 -59 20 -83 10 -43 25 -67 89 -142 26 -31 48 -44 98 -60 75 -23 118 -17 219 31 86 41 125 101 153 234 33 155 24 328 -25 500 -23 82 -32 100 -63 126 -20 16 -58 37 -86 45 -54 17 -149 26 -177 18z m139 -284 c4 -14 7 -101 8 -195 0 -160 -1 -172 -23 -207 -41 -65 -112 -59 -132 12 -21 73 -31 178 -24 255 7 88 36 180 62 194 24 14 101 -27 109 -59z',
]

// 定义props类型
type AnimatedBottomRowProps = {
  duration?: number
  stagger?: number
  strokeWidth?: number
} & MotionProps &
  Omit<SVGProps<SVGSVGElement>, keyof MotionProps>

export function AnimatedBottomRow({
  duration = 2.5,
  stagger = 0.08,
  strokeWidth = 15,
  ...props
}: AnimatedBottomRowProps) {
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
      viewBox="0 110 500 110"
      preserveAspectRatio="xMaxYMid meet"
      initial="hidden"
      animate="visible"
      {...props}
    >
      <motion.g
        transform="translate(0, 220) scale(0.1, -0.1)"
        fill="currentColor"
        variants={fillVariants}
      >
        {bottomRowPaths.map((d, i) => (
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
        {bottomRowPaths.map((d, i) => (
          <motion.path key={`draw-${i}`} d={d} variants={drawPathVariants} />
        ))}
      </motion.g>
    </motion.svg>
  )
}
