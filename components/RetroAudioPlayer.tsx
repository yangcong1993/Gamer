// file: components/RetroAudioPlayer.tsx

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
const BoxArrow = ({ direction }: { direction: 'left' | 'right' }) => {
  return (
    <div className="box-arrow">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d={direction === 'left' ? 'M17 5v14L6 12z' : 'M7 5v14l11-7z'} />
      </svg>
    </div>
  )
}

const RetroAudioPlayer = ({ src, title = '负光者' }: { src: string; title?: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  const handlePlaybackSpeedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value)
    setPlaybackSpeed(newSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    const handleEnded = () => setIsPlaying(false)
    if (audio) {
      audio.addEventListener('ended', handleEnded)
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  return (
    // 主容器，带边框
    <div className="retro-audio-player">
      <div className="gif-visualizer">
        <Image
          src={isPlaying ? '/static/images/play.gif' : '/static/images/stop.gif'}
          alt={isPlaying ? 'Playing animation' : 'Stopped animation'}
          width={250}
          height={180}
          unoptimized
        />
      </div>

      {/* 显示面板 */}
      <div className="display-panel">
        <div className="track-title-row">
          <span>当前曲目</span>
          <div className="track-display-box">
            <BoxArrow direction="left" />
            <div className="title-text">{title}</div>
            <BoxArrow direction="right" />
          </div>
        </div>
        <div className="controls-row">
          <div className="control-group">
            <span>播放速度: {(playbackSpeed * 100).toFixed(0)}%</span>
            <div className="slider-box">
              <BoxArrow direction="left" />
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={playbackSpeed}
                onChange={handlePlaybackSpeedChange}
                aria-label="Playback Speed"
              />
              <BoxArrow direction="right" />
            </div>
          </div>
          <div className="control-group">
            <span>音量: {(volume * 100).toFixed(0)}%</span>
            <div className="slider-box">
              <BoxArrow direction="left" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />
              <BoxArrow direction="right" />
            </div>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="action-buttons">
        <button onClick={stop} aria-label="Stop">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <audio ref={audioRef} src={src} preload="metadata">
        您的浏览器不支持音频元素。
        <track
          kind="captions"
          srcLang="en"
          label="English captions"
          src="/path/to/your/captions.vtt"
        />
      </audio>
    </div>
  )
}

export default RetroAudioPlayer
