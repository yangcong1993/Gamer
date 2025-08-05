// file: app/api/image/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.hiripple.com/api/pic?type=0&image=1', {
      headers: {
        Referer: 'https://hiripple.com',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error('Failed to fetch image from external API')
    }
    return NextResponse.json({ imageUrl: res.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}
