'use client'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/client'
import Cookies from 'js-cookie'
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion'
import dynamic from 'next/dynamic'

const DynamicInlineMath = dynamic(() => import('./DynamicKatex'), {
  loading: () => <span style={{ fontFamily: 'monospace' }}>...</span>,
  ssr: false,
})

const HINTS = [
  '需要提示的话……',
  '误打误撞进入了错误页面，居然发现了惊喜',
  '难道……还有音效吗',
  '看不见的东西吗……FS亲传？',
  '其实我也是游戏人物……',
]

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const mascotVariants: Variants = {
  idle: {
    rotateY: 0,
    rotate: [-2, 2, -2],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'mirror' as const,
      ease: 'easeInOut' as const,
    },
  },
  spin: {
    rotateY: 360,
    transition: {
      duration: 0.5,
      ease: 'easeInOut' as const,
    },
  },
}

interface GuessedGame {
  name: string
  description: string
}

export default function GuessGame() {
  const supabase = createClient()
  const mascotControls = useAnimation()
  // 游戏状态
  const [totalGames, setTotalGames] = useState<number | null>(null)
  const [guessedGames, setGuessedGames] = useState<GuessedGame[]>([])
  const [remainingCount, setRemainingCount] = useState<number | null>(null)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  // 用户与表单状态

  const [userId, setUserId] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  // 验证码状态 (与评论区逻辑相同)
  const [captchaProblem, setCaptchaProblem] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaValidation, setCaptchaValidation] = useState('')
  useEffect(() => {
    let currentUserId = Cookies.get('game-guesser-id')
    if (!currentUserId) {
      currentUserId = generateUUID()
      Cookies.set('game-guesser-id', currentUserId, { expires: 365 })
    }
    setUserId(currentUserId)
    const savedGuesses = Cookies.get('guessed-games')
    if (savedGuesses) {
      try {
        setGuessedGames(JSON.parse(savedGuesses))
      } catch (e) {
        console.error('Failed to parse guessed games from cookie', e)
      }
    }
    const fetchTotalGames = async () => {
      const { count } = await supabase.from('games').select('*', { count: 'exact', head: true })
      setTotalGames(count)
    }
    fetchTotalGames()
  }, [supabase])
  useEffect(() => {
    if (totalGames !== null) {
      const remaining = totalGames - guessedGames.length
      setRemainingCount(remaining)
      if (remaining === 0 && totalGames > 0) {
        setSuccessMessage(
          '恭喜你，找出了本站所有的彩蛋！ 你真是个无可救药的头号玩家，这你属于你的KEY：“Af0*kYVzEyABIGBx6I2nP@m1” 请附上KEY并写邮件到Me@hiripple.com，期待中～'
        )
      }
    }
  }, [totalGames, guessedGames])

  useEffect(() => {
    if (userId) {
      Cookies.set('guessed-games', JSON.stringify(guessedGames), { expires: 365 })
    }
  }, [guessedGames, userId])

  const fetchCaptcha = useCallback(async () => {
    const { data } = await supabase.functions.invoke('generate-captcha')
    if (data) {
      setCaptchaProblem(data.problem)
      setCaptchaValidation(data.validation)
    }
  }, [supabase])

  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !userId) return

    setIsLoading(true)
    setError(null)

    const { data: response, error: invokeError } = await supabase.functions.invoke('guess-game', {
      body: {
        guess: inputValue,
        captchaAnswer,
        validation: captchaValidation,
        userId,
      },
    })

    setIsLoading(false)
    setCaptchaAnswer('')
    fetchCaptcha()

    if (invokeError || response.error) {
      setError(invokeError?.message || response.error.message)
    } else {
      if (!guessedGames.some((g) => g.name === response.data.name)) {
        setGuessedGames((prev) => [...prev, response.data])
      }
      setInputValue('')
    }
  }
  const handleHintClick = async () => {
    setCurrentHintIndex((prevIndex) => (prevIndex + 1) % HINTS.length)
    await mascotControls.start('spin')
    mascotControls.start('idle')
  }
  return (
    <div className="mb-12 space-y-8 rounded-lg border-2 border-dashed border-gray-400 p-8 dark:border-gray-600">
      <div className="flex flex-col items-center justify-center gap-0 md:flex-row">
        <div className="text-center md:text-right">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
            找出彩蛋吧！
          </h2>
          <p className="mt-4 text-3xl text-gray-600 dark:text-gray-400">剩下的游戏总数为：</p>
        </div>

        <div className="relative h-48 w-64 shrink-0">
          <Image
            src="/static/images/tv.png"
            alt="TV"
            width={256}
            height={192}
            className="h-full w-full object-contain"
            priority
          />
          <div className="absolute inset-0 flex items-end justify-start overflow-hidden pb-10 pl-16">
            <AnimatePresence mode="wait">
              <motion.span
                key={remainingCount}
                className="w-24 text-center font-mono text-7xl font-bold text-gray-900 dark:text-gray-800"
                style={{ textShadow: '0 0 8px rgba(0,0,0,0.3)' }}
                // 定义动画效果
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {remainingCount ?? '?'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* 猜中所有游戏后的信息 */}
      {remainingCount === 0 && successMessage && (
        <div className="rounded-md bg-green-100 p-4 text-center text-lg font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {remainingCount !== 0 && (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="请输入游戏名称（含空格，不含标点符号）..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-[#793EC3] focus:ring-[#793EC3] dark:border-gray-600 dark:bg-gray-800"
          />
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gray-200 p-2 font-mono dark:bg-gray-700">
                <DynamicInlineMath math={captchaProblem || '...'} />
              </span>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="= ?"
                required
                className="w-24 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#793EC3] focus:ring-[#793EC3] dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#793EC3] px-6 py-2 text-white shadow-sm hover:bg-[#52288C] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isLoading ? '验证中...' : '提交'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}
        </form>
      )}

      <div className="flex flex-col items-start gap-8 border-t border-gray-200 pt-8 md:flex-row dark:border-gray-700">
        <div className="relative w-full shrink-0 pt-12 md:w-56">
          <div
            className="group relative mx-auto w-30 cursor-pointer md:ml-12"
            onClick={handleHintClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleHintClick()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="切换提示"
          >
            <motion.div variants={mascotVariants} animate={mascotControls} initial="idle">
              <Image
                src="/static/images/hint.png"
                alt="Hint Mascot"
                width={120}
                height={120}
                className="h-auto w-full"
              />
            </motion.div>
            <div className="absolute -top-2 left-1/2 w-max max-w-sm -translate-x-1/2 -translate-y-full transform rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-700 shadow-lg dark:bg-gray-700 dark:text-gray-200">
              {HINTS[currentHintIndex]}
              <div className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform bg-gray-100 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <FaInfoCircle />
            游戏规则
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>
              找出本站样式中包含的游戏彩蛋吧，请输入完整官译中/英文标题（不含标点、推荐英文）。
            </li>
            <li>博文正文、Sparks、评论等不参与～</li>
            <li>彩蛋不会存在于代码之中，请放心在前端寻找，PC端谷歌浏览器更佳。</li>
            <li>
              如果一个元素在某个游戏系列多次出现，那么只需要输入系列名，否则需要指定具体标题。
            </li>
            <li>目标是找到所有游戏，清空剩余数量！</li>
            <li>虽然完成了没有奖励，但是可以得到Ripp的衷心称赞！要不发个邮箱交流一番？</li>
          </ul>
        </div>
      </div>

      {guessedGames.length > 0 && (
        <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="text-xl font-semibold">已找出作品：</h3>
          <ul className="space-y-3">
            {guessedGames.map((game) => (
              <li key={game.name} className="flex items-start gap-3">
                <FaCheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{game.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
