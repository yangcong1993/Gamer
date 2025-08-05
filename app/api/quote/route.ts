// file: app/api/quote/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.hiripple.com/api/oneword', {
      headers: {
        Referer: 'https://hiripple.com',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`[API Quote] External API Error: Status ${res.status}`)
      console.error(`[API Quote] External API Response: ${errorBody}`)
      throw new Error(`Failed to fetch from external API. Status: ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
