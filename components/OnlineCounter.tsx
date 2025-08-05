'use client'

import { useEffect, useState, useContext, useRef } from 'react'
import { LanguageContext } from '@/contexts/LanguageProvider'
import { v4 as uuid } from 'uuid'
import { AppMessages } from '@/contexts/LanguageProvider'
import { createClient } from '@/lib/client'
import { randomNames } from '@/lib/name'
const supabase = createClient()

interface DanmakuMessage {
  id: string
  text: string
  color: string
  timestamp: number
  userId: string
}

const getTranslatedText = (
  messages: AppMessages | undefined,
  key: string,
  fallback: string
): string => {
  const result = messages?.OnlineCounter?.[key]
  if (typeof result === 'string') {
    return result
  }
  return fallback
}

export default function OnlineCounter() {
  const [userName] = useState(() => {
    const randomIndex = Math.floor(Math.random() * randomNames.length)
    return randomNames[randomIndex]
  })
  const [count, setCount] = useState(1)
  const [sid] = useState(() => uuid())
  const [showInput, setShowInput] = useState(false)
  const [danmakuText, setDanmakuText] = useState('')
  const [danmakuList, setDanmakuList] = useState<DanmakuMessage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const langContext = useContext(LanguageContext)

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: sid } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      setCount(Object.keys(channel.presenceState()).length)
    })
    channel.on('broadcast', { event: 'danmaku' }, ({ payload }) => {
      const newDanmaku: DanmakuMessage = {
        id: uuid(),
        text: payload.text,
        color: 'inherit',
        timestamp: Date.now(),
        userId: payload.userId,
      }

      setDanmakuList((prev) => [...prev, newDanmaku])

      setTimeout(() => {
        setDanmakuList((prev) => prev.filter((d) => d.id !== newDanmaku.id))
      }, 5000)
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') channel.track({ online_at: Date.now() })
    })

    return () => {
      channel.unsubscribe()
    }
  }, [sid])
  const handleCounterClick = () => {
    setShowInput(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const sendDanmaku = async () => {
    const textToSend = danmakuText.trim()
    if (!textToSend) return
    const formattedText = `${userName}: ${textToSend}`

    const channel = supabase.channel('online-users')
    await channel.send({
      type: 'broadcast',
      event: 'danmaku',
      payload: {
        text: formattedText,
        userId: sid,
      },
    })

    const newDanmaku: DanmakuMessage = {
      id: uuid(),
      text: formattedText,
      color: 'inherit',
      timestamp: Date.now(),
      userId: sid,
    }

    setDanmakuList((prev) => [...prev, newDanmaku])

    setTimeout(() => {
      setDanmakuList((prev) => prev.filter((d) => d.id !== newDanmaku.id))
    }, 6000)
    setDanmakuText('')
    setShowInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendDanmaku()
    } else if (e.key === 'Escape') {
      setShowInput(false)
      setDanmakuText('')
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowInput(false)
      setDanmakuText('')
    }, 150)
  }

  const text = getTranslatedText(langContext?.messages, 'text', 'Loading players...').replace(
    '{count}',
    String(count)
  )

  return (
    <div className="online-counter-container">
      <div className="danmaku-container">
        {danmakuList.map((danmaku) => (
          <div
            key={danmaku.id}
            className="danmaku-item"
            style={{
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            {danmaku.text}
          </div>
        ))}
      </div>

      {showInput ? (
        <input
          ref={inputRef}
          type="text"
          value={danmakuText}
          onChange={(e) => setDanmakuText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Press Enter to send..."
          className="online-counter danmaku-input"
          maxLength={50}
        />
      ) : (
        <span
          className="online-counter clickable cursor-pointer"
          onClick={handleCounterClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCounterClick()
            }
          }}
          title="Click to send danmaku"
        >
          {text}
        </span>
      )}
    </div>
  )
}
