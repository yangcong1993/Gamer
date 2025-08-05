'use client'
import { useRef, useEffect, useCallback, useState } from 'react'

interface PhotoCaptureProps {
  onPhotoTaken: (imageData: Blob) => void
  onCancel: () => void
}

export const PhotoCapture = ({ onPhotoTaken, onCancel }: PhotoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  // 启动摄像头
  useEffect(() => {
    let mounted = true

    const openCamera = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (mounted) {
              setIsLoading(false)
            }
          }
        }
      } catch (err) {
        console.error('无法访问摄像头:', err)
        if (mounted) {
          setError('无法访问摄像头，请检查权限设置')
          setIsLoading(false)
        }
      }
    }

    openCamera()

    return () => {
      mounted = false
      cleanupCamera()
    }
  }, [cleanupCamera])

  // 拍照逻辑
  const handleTakePhoto = useCallback(() => {
    const video = videoRef.current
    const stream = streamRef.current

    if (!video || !stream || video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.warn('视频未准备就绪')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) {
      console.error('无法获取canvas上下文')
      return
    }
    context.scale(-1, 1)
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    cleanupCamera()
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onPhotoTaken(blob)
        } else {
          console.error('无法生成图片数据')
          setError('拍照失败，请重试')
        }
      },
      'image/jpeg',
      0.8
    )
  }, [onPhotoTaken, cleanupCamera])
  const handleCancel = useCallback(() => {
    cleanupCamera()
    onCancel()
  }, [onCancel, cleanupCamera])
  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    window.location.reload()
  }, [])

  return (
    <div className="photo-capture-overlay">
      <div className="photo-capture-modal">
        <p className="photo-capture-notice">照片仅用于实时分析，不会被保存</p>

        {error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={handleRetry} className="retry-btn">
              重试
            </button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="loading-container">
                <p>正在启动摄像头...</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`photo-capture-video ${isLoading ? 'loading' : ''}`}
            />
          </>
        )}

        <div className="photo-capture-buttons">
          <button onClick={handleTakePhoto} className="capture-btn" disabled={isLoading || !!error}>
            拍照
          </button>
          <button onClick={handleCancel} className="cancel-btn">
            取消
          </button>
        </div>
      </div>

      <style jsx global>{`
        .photo-capture-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          pointer-events: auto;
        }

        .photo-capture-modal {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 90vw;
          max-height: 90vh;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .photo-capture-notice {
          color: #555;
          margin: 0 0 15px 0;
          text-align: center;
          font-size: 14px;
        }

        .photo-capture-video {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 8px;
          transform: scaleX(-1);
          transition: opacity 0.3s ease;
        }

        .photo-capture-video.loading {
          opacity: 0.5;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          color: #666;
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }

        .error-message {
          color: #d32f2f;
          margin-bottom: 15px;
          text-align: center;
        }

        .photo-capture-buttons {
          margin-top: 20px;
          display: flex;
          gap: 15px;
        }

        .capture-btn,
        .cancel-btn,
        .retry-btn {
          padding: 12px 24px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .capture-btn {
          background-color: #4caf50;
          color: white;
        }

        .capture-btn:hover:not(:disabled) {
          background-color: #45a049;
        }

        .capture-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .cancel-btn {
          background-color: #f44336;
          color: white;
        }

        .cancel-btn:hover {
          background-color: #da362a;
        }

        .retry-btn {
          background-color: #2196f3;
          color: white;
        }

        .retry-btn:hover {
          background-color: #1976d2;
        }

        @media (max-width: 480px) {
          .photo-capture-modal {
            padding: 15px;
            margin: 10px;
          }

          .photo-capture-buttons {
            flex-direction: column;
            width: 100%;
          }

          .capture-btn,
          .cancel-btn,
          .retry-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
