import { NextResponse } from 'next/server'
import versionData from '../../../../version.json'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(versionData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { version: '1.0.0', build: 1, error: error.message },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  }
}
