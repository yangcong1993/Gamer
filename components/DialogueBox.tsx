'use client'

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react'
import Image from 'next/image'
import { useGamepadVibration } from '@/lib/useGamepadVibration'

type DialogueSegment = {
  text: string
  face?: string
}

interface Dialogue {
  text?: string
  segments: readonly DialogueSegment[]
  face: string
  isNameInput?: boolean
  isNameConfirmation?: boolean
  confirmText?: string
  denyText?: string
}

interface DialogueBoxProps {
  dialogue: Dialogue
  onFinished: () => void
  onNameInput?: (name: string) => void
  onNameConfirmation?: (confirmed: boolean) => void
  userName?: string
  audioSrc: string
  typingSpeed?: number
}

export interface DialogueBoxHandle {
  triggerInteraction: () => void
  triggerNegativeAction: () => void
}

export const DialogueBox = forwardRef<DialogueBoxHandle, DialogueBoxProps>(
  (
    {
      dialogue,
      onFinished,
      onNameInput,
      onNameConfirmation,
      userName = '玩家',
      audioSrc,
      typingSpeed = 50,
    },
    ref
  ) => {
    // --- State ---
    const [displayedText, setDisplayedText] = useState('')
    const [isTypingComplete, setIsTypingComplete] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
    const [currentFace, setCurrentFace] = useState(dialogue.face)
    const { vibrateClick, vibrateTyping } = useGamepadVibration()
    // --- Refs ---
    const audioRef = useRef<HTMLAudioElement>(null)
    const textIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const processText = useCallback(
      (text: string): string => {
        return text.replace(/{name}/g, userName)
      },
      [userName]
    )

    // --- Hooks ---
    const textSegments = useMemo(() => {
      if (dialogue.segments) {
        return dialogue.segments.map((s) => ({
          ...s,
          text: processText(s.text),
        }))
      }
      if (dialogue.text) {
        return processText(dialogue.text)
          .split('|')
          .map((t) => ({ text: t.trim(), face: dialogue.face }))
      }
      return []
    }, [dialogue, processText])

    useImperativeHandle(ref, () => ({
      triggerInteraction() {
        vibrateClick()
        const currentSegment = textSegments[currentSegmentIndex]
        if (!currentSegment) return

        if (!isTypingComplete) {
          if (textIntervalRef.current) clearInterval(textIntervalRef.current)
          setDisplayedText(currentSegment.text)
          setIsTypingComplete(true)

          const audioEl = audioRef.current
          if (audioEl) {
            audioEl.loop = false
          }
          return
        }

        const isFinalSegment = currentSegmentIndex === textSegments.length - 1

        if (isFinalSegment) {
          if (dialogue.isNameConfirmation) {
            onNameConfirmation?.(true)
          } else if (dialogue.isNameInput) {
            const inputEl = inputRef.current
            if (inputEl && document.activeElement !== inputEl) {
              inputEl.focus()
            }
          } else {
            onFinished()
          }
        } else {
          setIsTypingComplete(false)
          setCurrentSegmentIndex((prev) => prev + 1)
        }
      },
      triggerNegativeAction() {
        const isFinalSegment = currentSegmentIndex === textSegments.length - 1
        if (dialogue.isNameConfirmation && isTypingComplete && isFinalSegment) {
          onNameConfirmation?.(false)
          vibrateClick()
        }
      },
    }))

    useEffect(() => {
      setCurrentSegmentIndex(0)
      setDisplayedText('')
      setIsTypingComplete(false)
    }, [textSegments])

    useEffect(() => {
      if (currentSegmentIndex >= textSegments.length) return

      const currentSegment = textSegments[currentSegmentIndex]
      const audioEl = audioRef.current
      setCurrentFace(currentSegment.face || dialogue.face)
      setIsTypingComplete(false)
      setDisplayedText('')
      let charIndex = 0

      if (audioEl) {
        audioEl.currentTime = 0
        audioEl.loop = true
        const playPromise = audioEl.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name !== 'AbortError') {
              console.error('Audio play failed:', error)
            }
          })
        }
      }

      textIntervalRef.current = setInterval(() => {
        if (charIndex < currentSegment.text.length) {
          setDisplayedText(currentSegment.text.slice(0, charIndex + 1))
          vibrateTyping()
          charIndex++
        } else {
          if (textIntervalRef.current) clearInterval(textIntervalRef.current)
          setIsTypingComplete(true)
          if (audioEl) {
            audioEl.loop = false
          }
          if (dialogue.isNameInput) {
            setTimeout(() => inputRef.current?.focus(), 100)
          }
        }
      }, typingSpeed)

      return () => {
        if (textIntervalRef.current) clearInterval(textIntervalRef.current)
        if (audioEl) {
          audioEl.pause()
        }
      }
    }, [
      textSegments,
      currentSegmentIndex,
      dialogue.face,
      dialogue.isNameInput,
      typingSpeed,
      vibrateTyping,
    ])

    // --- 事件处理器和 JSX (保持不变) ---
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault()
        onNameInput?.(inputValue.trim())
      }
    }

    const handleClick = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.triggerInteraction()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleClick()
      }
    }

    const isFinalSegment = currentSegmentIndex === textSegments.length - 1

    return (
      <div
        className="dialogue-box"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={-1}
      >
        <div className="dialogue-text">
          {displayedText}
          {dialogue.isNameInput && isTypingComplete && isFinalSegment && (
            <div className="name-input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="name-input"
                placeholder="请输入昵称..."
                maxLength={20}
              />
            </div>
          )}
          {dialogue.isNameConfirmation && isTypingComplete && isFinalSegment && (
            <div className="confirmation-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vibrateClick()
                  onNameConfirmation?.(true)
                }}
                className="confirm-button yes"
                type="button"
              >
                {dialogue.confirmText || '愿意'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vibrateClick()
                  onNameConfirmation?.(false)
                }}
                className="confirm-button no"
                type="button"
              >
                {dialogue.denyText || '不愿意'}
              </button>
            </div>
          )}
        </div>

        <div className="dialogue-face">
          <Image
            key={currentFace}
            src={`/static/faces/${currentFace}`}
            alt="Character Expression"
            width={96}
            height={96}
            unoptimized
          />
        </div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} src={audioSrc} preload="auto" />
      </div>
    )
  }
)

DialogueBox.displayName = 'DialogueBox'
