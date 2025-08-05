// file: components/RetroVideoPlayer.tsx

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

const BoxArrow = ({ direction }: { direction: 'left' | 'right' }) => {
  return (
    <div className="box-arrow">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d={direction === 'left' ? 'M17 5v14L6 12z' : 'M7 5v14l11-7z'} />
      </svg>
    </div>
  )
}

type VideoPlayerProps = React.ComponentProps<'video'>

export default function RetroVideoPlayer(props: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }, [])

  const handlePlaybackSpeedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value)
    setPlaybackSpeed(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const handleEnded = () => setIsPlaying(false)
    if (video) {
      video.addEventListener('ended', handleEnded)
    }
    return () => {
      if (video) {
        video.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  return (
    <div className="retro-video-wrapper">
      <video ref={videoRef} className="video-element" onClick={togglePlay} playsInline {...props}>
        您的浏览器不支持视频元素。
        <track
          kind="captions"
          srcLang="zh"
          label="中文说明"
          src="/path/to/your/video-captions.vtt"
        />
        <track
          kind="descriptions"
          srcLang="en"
          label="Video Description"
          src="/path/to/your/video-descriptions.vtt"
        />
      </video>

      <div className="display-panel">
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
      </div>
    </div>
  )
}
