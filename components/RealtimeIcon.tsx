'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useContext, useCallback, useMemo } from 'react'
import { LanguageContext } from '@/contexts/LanguageProvider'
import { useTooltip } from '@/contexts/TooltipProvider'

type ApiStatus = { appName: string; timestamp: string }
type Activities = { [appName: string]: string }
const timeZone = 'Asia/Shanghai'

const LocalTimeClock = ({ timeZone, format }: { timeZone: string; format: string }) => {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone,
    })
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone,
        })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [timeZone])

  return <span>{format.replace('{time}', time)}</span>
}

export default function RealtimeIcon({ className = '' }: { className?: string }) {
  const { showTooltip, hideTooltip } = useTooltip()
  const langCtx = useContext(LanguageContext)
  const language = langCtx?.language ?? 'zh'

  const messages = useMemo(
    () =>
      (langCtx?.messages ?? {}) as {
        Realtime?: { timeAgo?: { now?: string; minutes?: string }; localTime?: string }
      },
    [langCtx?.messages]
  )

  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [activities, setActivities] = useState<Activities | null>(null)
  const [timeAgo, setTimeAgo] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // --- Refs ---
  const hoverRef = useRef(false)
  const posRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const lang = language || 'zh'
    import(`../public/static/realtime/activities.${lang}.json`)
      .then((module) => setActivities(module.default))
      .catch(() => {
        import(`../public/static/realtime/activities.zh.json`).then((module) =>
          setActivities(module.default)
        )
      })
  }, [language])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          'https://cnvskdxccijlakolvxot.supabase.co/functions/v1/realtime-status'
        )
        if (!response.ok) throw new Error('Failed to fetch status')
        const data: ApiStatus = await response.json()
        setApiStatus(data)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
        console.error(e)
      }
    }
    fetchStatus()
    const statusInterval = setInterval(fetchStatus, 30000)
    return () => clearInterval(statusInterval)
  }, [])

  useEffect(() => {
    if (!apiStatus?.timestamp) return
    const t = (key: 'now' | 'minutes', fallback: string) =>
      messages?.Realtime?.timeAgo?.[key] || fallback

    const calculate = () => {
      const diffInSeconds = Math.floor(
        (Date.now() - new Date(apiStatus.timestamp).getTime()) / 1000
      )
      if (diffInSeconds < 60) {
        setTimeAgo(t('now', 'just now'))
      } else {
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        setTimeAgo(
          t('minutes', '{minutes} minutes ago').replace('{minutes}', String(diffInMinutes))
        )
      }
    }
    calculate()
    const timer = setInterval(calculate, 60000)
    return () => clearInterval(timer)
  }, [apiStatus?.timestamp, messages])

  const statusContent = useMemo(() => {
    if (error) return `状态获取失败: ${error}`
    if (!apiStatus || !activities) return '正在获取状态...'
    const activity = activities[apiStatus.appName] || activities['Unknown'] || '在做神秘的事情'
    return `${activity} (${timeAgo})`
  }, [apiStatus, activities, timeAgo, error])

  const enter = (e: React.MouseEvent<HTMLImageElement>) => {
    hoverRef.current = true
    posRef.current = { x: e.clientX, y: e.clientY }
    showTooltip(
      <>
        {statusContent}
        <br />
        ──────────
        <br />
        <LocalTimeClock
          timeZone={timeZone}
          format={messages?.Realtime?.localTime || 'Local Time GMT+8 {time}'}
        />
      </>,
      e
    )
  }
  const move = (e: React.MouseEvent<HTMLImageElement>) => {
    posRef.current = { x: e.clientX, y: e.clientY }
  }
  const leave = () => {
    hoverRef.current = false
    hideTooltip()
  }

  return (
    <span className={`realtime-icon relative inline-block ${className}`}>
      <Image
        src="/static/images/realtime-icon.png"
        alt="Realtime status"
        fill
        sizes="30px"
        className="select-none"
        onMouseEnter={enter}
        onMouseMove={move}
        onMouseLeave={leave}
      />
    </span>
  )
}
