import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getBlingConfig } from '@/lib/bling'

function randomState() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export async function GET(req: NextRequest) {
  const cfg = getBlingConfig()
  const state = randomState()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    scope: 'read write',
    state,
  })
  const url = `${cfg.authUrl}?${params.toString()}`
  // Optional debug mode: return the URL instead of redirecting
  const { searchParams } = new URL(req.url)
  if (searchParams.get('debug') === '1') {
    return NextResponse.json({
      ok: true,
      authorizeUrl: url,
      clientId: cfg.clientId,
      redirectUri: cfg.redirectUri,
    })
  }
  const res = NextResponse.redirect(url)
  res.cookies.set('bling_oauth_state', state, { httpOnly: true, path: '/', maxAge: 300, sameSite: 'lax' })
  return res
}
