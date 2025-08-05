import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const clientFormData = await request.formData()
  const imageFile = clientFormData.get('image_file')
  if (!imageFile || typeof imageFile === 'string') {
    return NextResponse.json({ error: 'Image file is missing or invalid.' }, { status: 400 })
  }

  const apiKey = process.env.FACEPLUSPLUS_API_KEY
  const apiSecret = process.env.FACEPLUSPLUS_API_SECRET

  if (!apiKey || !apiSecret) {
    console.error('Face++ API Key or Secret is missing on the server.')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const facePlusPlusFormData = new FormData()
  facePlusPlusFormData.append('api_key', apiKey)
  facePlusPlusFormData.append('api_secret', apiSecret)
  facePlusPlusFormData.append('return_attributes', 'gender,age,smiling,emotion,beauty,facequality')
  facePlusPlusFormData.append('image_file', imageFile)

  try {
    const response = await fetch('https://api-cn.faceplusplus.com/facepp/v3/detect', {
      method: 'POST',
      body: facePlusPlusFormData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Face++ API proxy failed:', error)
    return NextResponse.json({ error: 'Failed to call Face++ API.' }, { status: 500 })
  }
}
