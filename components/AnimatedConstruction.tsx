'use client'

import Image from 'next/image'
import { motion, useMotionValue, useTransform, animate, MotionStyle } from 'framer-motion'
import { useState, useEffect, useRef, CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
type CustomGlowStyle = MotionStyle & {
  [key: `--${string}`]: string | number
}
interface AnimatedConstructionProps {
  containerHeight?: number
  verticalOffset?: number
  animationSpeed?: number
  roadWidth?: number
  roadBottom?: number
  treeWidth?: number
  treeBottom?: number
  houseWidth?: number
  houseBottom?: number
  shadowLength?: number
  shadowWidth?: number
  shadowHeight?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  shadowOpacity?: number
  shadowBlur?: number
  glowEnabled?: boolean
  glowSize?: number
  glowColor?: string
  glowIntensity?: number
  glowBlur?: number
  glowOffsetX?: number
  glowOffsetY?: number
  flickerSpeed?: number
  flickerIntensity?: number
  glowFadeInDuration?: number
  roadShadowEnabled?: boolean
  roadShadowMaxHeight?: number
  roadShadowWidth?: number
  roadShadowColor?: string
  roadShadowBlur?: number
  roadShadowOffsetY?: number
  roadShadowOffsetX?: number
  explosionUrl?: string // 点击后跳转的 URL
  explosionDuration?: number // 爆炸动画总时长
  explosionNavDelay?: number // 触发跳转的延迟时间 (秒)
  explosionVerticalOffset?: number
}

export default function AnimatedConstruction({
  containerHeight = 300,
  verticalOffset = 0,
  animationSpeed = 1.0,
  roadWidth = 400,
  roadBottom = 60,
  treeWidth = 150,
  treeBottom = 45,
  houseWidth = 200,
  houseBottom = 85,
  shadowLength = 0.8,
  shadowWidth = 1,
  shadowOffsetX = 1,
  shadowOffsetY = -405,
  shadowOpacity = 0.8,
  shadowBlur = 1,
  shadowHeight = 0.6,
  glowEnabled = true,
  glowSize = 50,
  glowColor = '#a855f7',
  glowIntensity = 0.9,
  glowOffsetX = 0,
  glowOffsetY = -25,
  flickerSpeed = 5.0,
  flickerIntensity = 0.8,
  glowFadeInDuration = 1.2,
  roadShadowEnabled = true,
  roadShadowMaxHeight = 25,
  roadShadowWidth = 20,
  roadShadowColor = 'rgba(0, 0, 0, 0.45)',
  roadShadowBlur = 4,
  roadShadowOffsetY = 48,
  roadShadowOffsetX = 1,
  explosionUrl = 'https://sparks.hiripple.com',
  explosionDuration = 3.5,
  explosionNavDelay = 0.8,
  explosionVerticalOffset = 280,
}: AnimatedConstructionProps) {
  const router = useRouter()
  const glowRef = useRef<HTMLDivElement>(null)
  const [isExploding, setIsExploding] = useState(false)
  const handleGlowClick = () => {
    setIsExploding(true)
  }

  const navigateToTarget = () => {
    router.push(explosionUrl)
  }

  const roadDuration = 2.0 / animationSpeed
  const treeDuration = 1.5 / animationSpeed
  const houseDuration = 1.2 / animationSpeed
  const treeDelay = roadDuration * 0.8
  const houseDelay = roadDuration
  const shadowDelay = treeDelay + treeDuration
  const shadowFade = 0.8
  const glowDelay = shadowDelay + shadowFade

  const [isGlowVisible, setIsGlowVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsGlowVisible(true), glowDelay * 1000)
    return () => clearTimeout(timer)
  }, [glowDelay])

  const glowOpacity = useMotionValue(0)
  const glowScale = useMotionValue(1)

  const roadShadowScaleY = useTransform(
    glowOpacity,
    [glowIntensity * (1 - flickerIntensity), glowIntensity],
    [glowIntensity * (1 - flickerIntensity), glowIntensity]
  )

  useEffect(() => {
    if (isGlowVisible) {
      const startFlickerAnimation = () => {
        animate(
          glowOpacity,
          [
            glowIntensity,
            glowIntensity * (1 - flickerIntensity),
            glowIntensity,
            glowIntensity * (1 - flickerIntensity * 0.5),
            glowIntensity,
          ],
          { duration: flickerSpeed, repeat: Infinity, ease: 'easeInOut' }
        )
        animate(glowScale, [1, 0.95, 1, 0.98, 1], {
          duration: flickerSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        })
      }
      animate(glowOpacity, glowIntensity, {
        duration: glowFadeInDuration,
        ease: 'easeOut',
        onComplete: startFlickerAnimation,
      })
      animate(glowScale, 1, {
        duration: glowFadeInDuration,
        ease: 'easeOut',
      })
    }
  }, [isGlowVisible, glowIntensity, flickerIntensity, flickerSpeed, glowFadeInDuration])
  const shadowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: shadowDelay,
        duration: shadowFade,
        ease: 'easeOut',
      },
    },
  } as const
  const roadVariants = {
    hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
    visible: {
      clipPath: 'inset(0% 0 0 0)',
      opacity: 1,
      transition: { duration: roadDuration, ease: 'easeOut' },
    },
  } as const
  const treeVariants = {
    hidden: { y: 100, opacity: 0, scale: 0.5 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 200,
        duration: treeDuration,
        delay: treeDelay,
      },
    },
  } as const
  const houseVariants = {
    hidden: {
      scaleY: 0,
      scaleX: 0.8,
      opacity: 0,
      transformOrigin: 'bottom center',
    },
    visible: {
      scaleY: 1,
      scaleX: 1,
      opacity: 1,
      transformOrigin: 'bottom center',
      transition: {
        duration: houseDuration,
        delay: houseDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as const
  const treeShadowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: shadowOpacity,
      transition: { duration: shadowFade, delay: shadowDelay, ease: 'easeOut' },
    },
  } as const
  const glowStyle: CustomGlowStyle = {
    x: `calc(-50% + ${glowOffsetX}px)`,
    opacity: glowOpacity,
    scale: glowScale,
    bottom: `${houseBottom + glowOffsetY}px`,
    left: `50%`,
    willChange: 'transform, opacity',

    width: `${glowSize * 2.5}px`,
    height: `${glowSize * 2.5}px`,

    '--glow-size': `${glowSize}px`,
    '--glow-color': glowColor,
  }

  /* ======================== JSX ======================== */
  return (
    <>
      {isExploding && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 30, opacity: [1, 1, 0] }}
          transition={{ duration: explosionDuration, ease: 'easeOut', times: [0, 0.4, 1] }}
          onAnimationStart={() => {
            setTimeout(() => {
              navigateToTarget()
            }, explosionNavDelay * 1000)
          }}
          onAnimationComplete={() => {
            setIsExploding(false)
          }}
          style={{
            position: 'absolute',
            top: `${explosionVerticalOffset}px`,
            left: '43%',
            transform: 'translate(-43%, -43%)',
            transformOrigin: 'center center',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 20%, ${glowColor}99 50%, ${glowColor}33 70%, transparent 90%)`,
            zIndex: 999,
            willChange: 'transform, opacity',
            pointerEvents: 'none',
          }}
        />
      )}

      <motion.div
        className="relative flex items-center justify-center"
        style={{
          height: `${containerHeight}px`,
          transform: `translateY(${verticalOffset}px)`,
        }}
      >
        {/* 独立的阴影层 */}
        <motion.div
          className="absolute bottom-0 h-[80px] w-[90%] rounded-[50%] bg-black/20"
          style={{
            filter: 'blur(25px)',
            transform: 'translateY(30px)',
            zIndex: 0,
            willChange: 'opacity',
          }}
          variants={shadowVariants}
          initial="hidden"
          animate="visible"
        />

        {/* 石子路 */}
        <motion.div
          className="absolute z-20"
          variants={roadVariants}
          initial="hidden"
          animate="visible"
          style={{
            bottom: `${roadBottom}px`,
            pointerEvents: 'none',
          }}
        >
          <Image
            src="/static/images/road2.avif"
            alt="Stone road"
            width={roadWidth}
            height={Math.round(roadWidth * 0.3)}
            className="object-contain"
          />
        </motion.div>

        {/* 道路上的动态阴影 */}
        {roadShadowEnabled && isGlowVisible && (
          <motion.div
            className="absolute"
            style={{
              x: `calc(-50% + ${roadShadowOffsetX}px)`,
              scaleY: roadShadowScaleY,
              transformOrigin: 'top center',
              height: roadShadowMaxHeight,
              zIndex: 21,
              top: `${containerHeight - roadBottom - roadShadowOffsetY}px`,
              left: '50%',
              width: `${roadShadowWidth}px`,
              backgroundColor: roadShadowColor,
              filter: `blur(${roadShadowBlur}px)`,
              borderRadius: '0 0 50% 50%',
            }}
          />
        )}

        {/* 房子 */}
        <motion.div
          className="absolute z-10"
          variants={houseVariants}
          initial="hidden"
          animate="visible"
          style={{
            bottom: `${houseBottom}px`,
            pointerEvents: 'none',
          }}
        >
          <Image
            src="/static/images/house2.avif"
            alt="House"
            width={houseWidth}
            height={Math.round(houseWidth * 1.2)}
            className="object-contain"
          />
        </motion.div>

        {/* 树阴影 */}
        <motion.div
          className="absolute z-40"
          variants={treeShadowVariants}
          initial="hidden"
          animate="visible"
          style={{
            x: `calc(-50% + ${shadowOffsetX}px)`,
            bottom: `${treeBottom + shadowOffsetY}px`,
            left: `50%`,
            willChange: 'opacity',
          }}
        >
          <div
            style={{
              width: `${treeWidth * shadowWidth}px`,
              height: `${Math.round(treeWidth * 1.5) * shadowLength}px`,
              position: 'relative',
              transform: `scaleY(${shadowLength}) scaleX(1)`,
              transformOrigin: 'top center',
              overflow: 'hidden',
            }}
          >
            <Image
              src="/static/images/tree2.avif"
              alt="Tree shadow"
              width={treeWidth}
              height={Math.round(treeWidth * 1.5)}
              className="object-contain"
              style={{
                width: '100%',
                height: 'auto',
                filter: `brightness(0) blur(${shadowBlur}px)`,
                opacity: shadowOpacity,
                transform: `scaleY(-${shadowHeight})`,
              }}
            />
          </div>
        </motion.div>

        {/* 两侧大树 */}
        <motion.div
          className="absolute z-30"
          variants={treeVariants}
          initial="hidden"
          animate="visible"
          style={{
            bottom: `${treeBottom}px`,
            pointerEvents: 'none',
          }}
        >
          <Image
            src="/static/images/tree2.avif"
            alt="Trees"
            width={treeWidth}
            height={Math.round(treeWidth * 1.5)}
            className="object-contain"
            style={{ maxWidth: 'none' }}
          />
        </motion.div>

        {glowEnabled && isGlowVisible && (
          <>
            <style jsx global>{`
              .glow-halo,
              .glow-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
              }

              .glow-halo {
                width: var(--glow-size); /* 使用CSS变量 */
                height: var(--glow-size);
                background-color: var(--glow-color); /* 使用CSS变量 */
                filter: blur(25px);
                transition: background-color 0.3s ease; /* 可选：颜色切换时平滑过渡 */
              }
              .glow-core {
                width: calc(var(--glow-size) * 0.3); /* 使用CSS变量进行计算 */
                height: calc(var(--glow-size) * 0.3);
                background-color: #ffffff;
                filter: blur(8px);
                transition: background-color 0.3s ease;
              }
            `}</style>

            <motion.div
              ref={glowRef}
              className="absolute z-50 cursor-pointer"
              onTap={handleGlowClick}
              onClick={handleGlowClick}
              data-interactive={'true'}
              style={glowStyle}
            >
              <div className="relative h-full w-full">
                <div className="glow-halo" />
                <div className="glow-core" />
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  )
}
