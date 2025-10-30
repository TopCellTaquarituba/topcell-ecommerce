import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getStoredToken } from '@/lib/bling'

export async function GET(_req: NextRequest) {
  const row = await getStoredToken()
  if (!row) return NextResponse.json({ ok: true, connected: false })
  return NextResponse.json({ ok: true, connected: true, expiresAt: row.expiresAt })
}

