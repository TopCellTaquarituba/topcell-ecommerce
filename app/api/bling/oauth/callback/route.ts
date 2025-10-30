import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getBlingConfig, saveToken } from '@/lib/bling'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const stateCookie = req.cookies.get('bling_oauth_state')?.value
  if (!code) return NextResponse.json({ ok: false, error: 'missing code' }, { status: 400 })
  if (!state || !stateCookie || state !== stateCookie) {
    return NextResponse.json({ ok: false, error: 'invalid state' }, { status: 400 })
  }
  const cfg = getBlingConfig()
  const form = new URLSearchParams()
  form.set('grant_type', 'authorization_code')
  form.set('code', code)
  form.set('client_id', cfg.clientId)
  form.set('client_secret', cfg.clientSecret)
  form.set('redirect_uri', cfg.redirectUri)
  const tokenRes = await fetch(cfg.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString() })
  if (!tokenRes.ok) {
    const t = await tokenRes.text()
    return NextResponse.json({ ok: false, error: 'token exchange failed', details: t }, { status: 400 })
  }
  const json = await tokenRes.json() as any
  await saveToken({ accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in, scope: json.scope })

  const res = NextResponse.redirect('/admin/integrations/bling')
  res.cookies.set('bling_oauth_state', '', { path: '/', maxAge: 0 })
  return res
}

