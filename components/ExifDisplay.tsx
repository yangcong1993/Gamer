'use client'
import {
  FaCamera,
  FaMapMarkerAlt,
  FaCameraRetro,
  FaCog,
  FaCircle,
  FaClock,
  FaTachometerAlt,
  FaRuler,
  FaExpand,
  FaVideo,
  FaEye,
  FaCompressAlt,
} from 'react-icons/fa'
import { CgCamera } from 'react-icons/cg'
import { MdCameraAlt, MdSpeed } from 'react-icons/md'
import { useState, useEffect } from 'react'

// 定义 EXIF 数据的类型
interface ExifTag {
  value?: string | number | boolean | null
  description?: string
}

interface ExifData {
  Model?: ExifTag
  LensModel?: ExifTag
  FNumber?: ExifTag
  ExposureTime?: ExifTag
  ISOSpeedRatings?: ExifTag
  FocalLenIn35mmFilm?: ExifTag
  FocalLength?: ExifTag
  ExposureCompensation?: ExifTag
  PixelXDimension?: ExifTag
  PixelYDimension?: ExifTag
  GPSLatitude?: ExifTag
  GPSLongitude?: ExifTag
  [key: string]: ExifTag | undefined
}

// EXIF项目接口
interface ExifItemProps {
  icon: React.ReactNode
  label: string
  value: string | number | undefined | null
}

const ExifItem = ({ icon, label, value }: ExifItemProps) => {
  if (!value) return null
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex-shrink-0 text-gray-300 dark:text-gray-400">{icon}</div>
      <span className="text-white">{value}</span>
    </div>
  )
}

const getLocationName = async (lat: string, lng: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

  if (!apiKey) {
    console.warn('Geoapify API key is missing.')
    return `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lng).toFixed(2)}°`
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=zh&apiKey=${apiKey}`
    )
    if (!response.ok) throw new Error('Geocoding failed with Geoapify')
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      const properties = data.features[0].properties
      const locationParts = [
        properties.street,
        properties.suburb,
        properties.city,
        properties.country,
      ].filter(Boolean)

      if (locationParts.length > 0) {
        return locationParts.join(', ')
      }
    }
    return `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lng).toFixed(2)}°`
  } catch (error) {
    console.warn('Reverse geocoding with Geoapify failed:', error)
    return `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lng).toFixed(2)}°`
  }
}

export const ExifDisplay = ({ exifData }: { exifData: ExifData }) => {
  const [locationName, setLocationName] = useState<string | null>(null)

  useEffect(() => {
    const rawLatitude = exifData?.GPSLatitude?.description
    const rawLongitude = exifData?.GPSLongitude?.description

    if (rawLatitude && rawLongitude) {
      const cleanedLatitude = rawLatitude.replace(/[NSEW]$/i, '')
      const cleanedLongitude = rawLongitude.replace(/[NSEW]$/i, '')
      getLocationName(cleanedLatitude, cleanedLongitude).then(setLocationName)
    }
  }, [exifData])

  if (!exifData) return null

  const model = exifData.Model?.description
  const lensModel = exifData.LensModel?.description
  const fNumber = exifData.FNumber?.description
  const exposureTime = exifData.ExposureTime?.description
  const iso = exifData.ISOSpeedRatings?.description
  const focalLength = exifData.FocalLenIn35mmFilm?.description || exifData.FocalLength?.description
  const exposureCompensation = exifData.ExposureCompensation?.description
  const pixelXDimension = exifData.PixelXDimension?.description
  const pixelYDimension = exifData.PixelYDimension?.description

  const formattedExposureTime = exposureTime ? `${exposureTime}s` : null
  const deviceModel = model
  const cameraInfo = lensModel
    ? lensModel
        .replace(model || '', '')
        .replace(/f\/[\d.]+/g, '')
        .trim()
    : null

  const latitude = exifData.GPSLatitude?.description
  const longitude = exifData.GPSLongitude?.description
  const megapixels =
    pixelXDimension && pixelYDimension
      ? Math.round((Number(pixelXDimension) * Number(pixelYDimension)) / 1000000)
      : null

  const getLensInfo = (lensModel: string | undefined, model: string | undefined) => {
    if (!lensModel) return null
    if (model && lensModel.includes(model)) {
      const parts = lensModel.split(' ')
      const relevantParts = parts.filter(
        (part) => part.includes('mm') || part.includes('f/') || part.includes('camera')
      )
      return relevantParts.join(' ') || '主摄'
    }
    return lensModel
  }

  const simplifiedLensInfo = getLensInfo(lensModel, model)
  const locationDisplay =
    locationName ||
    (latitude && longitude
      ? `${parseFloat(latitude).toFixed(2)}°, ${parseFloat(longitude).toFixed(2)}°`
      : null)

  const items: ExifItemProps[] = [
    { icon: <MdSpeed />, label: 'ISO', value: iso ? `ISO${iso}` : null },
    { icon: <FaRuler />, label: '焦距', value: focalLength ? `${focalLength}mm` : null },
    { icon: <FaCircle />, label: '光圈', value: fNumber },
    { icon: <FaClock />, label: '快门', value: formattedExposureTime },
    { icon: <FaCompressAlt />, label: '像素', value: megapixels ? `${megapixels}MP` : null },
    { icon: <FaCameraRetro />, label: '设备', value: deviceModel },
    { icon: <MdCameraAlt />, label: '镜头', value: cameraInfo },
  ].filter((item) => item.value)

  return (
    <div className="absolute right-4 bottom-4 z-10 space-y-1 rounded-lg bg-gray-900/60 p-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover:opacity-100 dark:bg-black/60">
      {items.map((item, index) => (
        <ExifItem key={index} icon={item.icon} label={item.label} value={item.value} />
      ))}

      {locationDisplay && latitude && longitude && (
        <a
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="!hover:text-[#52288C] flex items-center space-x-2 text-sm font-medium !text-[#793EC3] transition-colors"
        >
          <FaMapMarkerAlt className="flex-shrink-0" />
          <span>{locationDisplay}</span>
        </a>
      )}
    </div>
  )
}
