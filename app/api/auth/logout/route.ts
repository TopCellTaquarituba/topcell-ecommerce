import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { clearAuthCookie } from '@/lib/auth'

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  clearAuthCookie(res)
  return res
}

