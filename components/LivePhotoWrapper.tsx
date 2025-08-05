// file: components/LivePhotoWrapper.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { Tags } from 'exifreader'
import LivePhoto from './LivePhoto'
import {
  FaMapMarkerAlt,
  FaCircle,
  FaClock,
  FaRuler,
  FaCameraRetro,
  FaCompressAlt,
} from 'react-icons/fa'
import { MdCameraAlt, MdSpeed } from 'react-icons/md'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    setIsMobile(mobile)
  }, [])
  return isMobile
}

const getLocationName = async (lat: string, lng: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
  if (!apiKey) return `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lng).toFixed(2)}°`
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=zh&apiKey=${apiKey}`
    )
    if (!response.ok) throw new Error('Geocoding failed')
    const data = await response.json()
    if (data.features?.length > 0) {
      const p = data.features[0].properties
      return [p.street, p.suburb, p.city, p.country].filter(Boolean).join(', ')
    }
    return `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lng).toFixed(2)}°`
  } catch (error) {
    return `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lng).toFixed(2)}°`
  }
}

const ExifItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number | null | undefined
}) => {
  if (!value) return null
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex-shrink-0 text-gray-300 dark:text-gray-400">{icon}</div>
      <span className="text-white">{String(value)}</span>
    </div>
  )
}

// --- EXIF 整体显示组件 (UI部分) ---
const ExifDisplay = ({ exifData }: { exifData: Tags }) => {
  const [locationName, setLocationName] = useState<string | null>(null)

  useEffect(() => {
    const lat = exifData?.GPSLatitude?.description
    const lng = exifData?.GPSLongitude?.description
    if (lat && lng) {
      const cleanedLat = String(lat).replace(/[NSEW]$/i, '')
      const cleanedLng = String(lng).replace(/[NSEW]$/i, '')
      getLocationName(cleanedLat, cleanedLng).then(setLocationName)
    }
  }, [exifData])

  const model = exifData.Model?.description
  const fNumber = exifData.FNumber?.description
  const exposureTime = exifData.ExposureTime?.description
  const iso = exifData.ISOSpeedRatings?.description
  const focalLength = exifData.FocalLenIn35mmFilm?.description || exifData.FocalLength?.description
  const megapixels =
    exifData.PixelXDimension?.description && exifData.PixelYDimension?.description
      ? Math.round(
          (Number(exifData.PixelXDimension.description) *
            Number(exifData.PixelYDimension.description)) /
            1000000
        )
      : null

  const items = [
    { icon: <MdSpeed />, label: 'ISO', value: iso ? `ISO${iso}` : null },
    { icon: <FaRuler />, label: '焦距', value: focalLength ? `${focalLength}mm` : null },
    { icon: <FaCircle />, label: '光圈', value: fNumber },
    { icon: <FaClock />, label: '快门', value: exposureTime ? `${exposureTime}s` : null },
    { icon: <FaCompressAlt />, label: '像素', value: megapixels ? `${megapixels}MP` : null },
    { icon: <FaCameraRetro />, label: '设备', value: model },
  ].filter((item) => item.value)

  return (
    <div className="absolute right-2 bottom-2 z-20 flex flex-col items-start space-y-1 rounded-lg bg-gray-900/60 p-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover:opacity-100 dark:bg-black/60">
      {items.map((item, index) => (
        <ExifItem key={index} {...item} />
      ))}
      {locationName && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${exifData.GPSLatitude?.description},${exifData.GPSLongitude?.description}`}
          target="_blank"
          rel="noopener noreferrer"
          className="!hover:text-purple-800 flex items-center space-x-2 text-sm font-medium !text-purple-600 transition-colors"
        >
          <FaMapMarkerAlt className="flex-shrink-0" />
          <span>{locationName}</span>
        </a>
      )}
    </div>
  )
}

export interface LivePhotoProps {
  photoSrc: string
  videoSrc: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  aspectRatio?: string
}

const LivePhotoWrapper = (props: LivePhotoProps) => {
  const { photoSrc } = props
  const isMobile = useIsMobile()
  const [exifData, setExifData] = useState<Tags | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFetchExif = useCallback(async () => {
    if (isMobile || exifData || isLoading) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(photoSrc, {
        headers: {
          Range: 'bytes=0-35535',
        },
      })

      if (!response.ok && response.status !== 206) {
        throw new Error(`服务器响应错误: ${response.statusText}`)
      }

      const ExifReader = (await import('exifreader')).default

      const tags = await ExifReader.load(await response.arrayBuffer())

      setExifData(tags)
    } catch (error) {
      console.error('无法加载EXIF数据:', error)
    } finally {
      setIsLoading(false)
    }
  }, [photoSrc, isMobile, exifData, isLoading])

  return (
    <div className="group relative" onMouseEnter={handleFetchExif}>
      <LivePhoto {...props} />
      {!isMobile && exifData && <ExifDisplay exifData={exifData} />}
    </div>
  )
}

export default LivePhotoWrapper
