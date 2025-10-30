import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getBlingConfig, saveToken } from '@/lib/bling'

function tryParseJson(text: string): any {
  try { return JSON.parse(text) } catch { return null }
}

function basicHeader(id: string, secret: string): string {
  try {
    // Node runtime
    // eslint-disable-next-line no-undef
    if (typeof Buffer !== 'undefined') {
      // eslint-disable-next-line no-undef
      return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64')
    }
  } catch {}
  try {
    // Edge/runtime with btoa
    // eslint-disable-next-line no-undef
    if (typeof btoa !== 'undefined') {
      // eslint-disable-next-line no-undef
      return 'Basic ' + btoa(`${id}:${secret}`)
    }
  } catch {}
  return ''
}

export async function GET(req: NextRequest) {
  try {
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
    form.set('redirect_uri', cfg.redirectUri)
    // Some providers accept both Basic and body credentials; include both for compatibility
    form.set('client_id', cfg.clientId)
    form.set('client_secret', cfg.clientSecret)
    const auth = basicHeader(cfg.clientId, cfg.clientSecret)
    const ac = new AbortController()
    const to = setTimeout(() => ac.abort(), 15000)
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        ...(auth ? { 'Authorization': auth } : {}),
      },
      body: form.toString(),
      signal: ac.signal,
    }).finally(() => clearTimeout(to))
    const raw = await tokenRes.text()
    if (!tokenRes.ok) {
      return NextResponse.json({ ok: false, error: 'token exchange failed', status: tokenRes.status, details: tryParseJson(raw) || raw }, { status: 400 })
    }
    const json = tryParseJson(raw)
    if (!json) {
      return NextResponse.json({ ok: false, error: 'token parse failed', details: raw }, { status: 400 })
    }
    await saveToken({ accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in, scope: json.scope })

    const res = NextResponse.redirect('/admin/integrations/bling')
    res.cookies.set('bling_oauth_state', '', { path: '/', maxAge: 0 })
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'callback exception', message: e?.message, stack: e?.stack }, { status: 500 })
  }
}
