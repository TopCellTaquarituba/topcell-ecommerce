import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { blingFetch, mapBlingProductToLocal } from '@/lib/bling'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const detailRes = await blingFetch(`/produtos/${encodeURIComponent(id)}`, { method: 'GET' })
      const detailText = await detailRes.text()
      let detailJson: any = null
      try { detailJson = JSON.parse(detailText) } catch { /* keep raw */ }
      const mapped = mapBlingProductToLocal(detailJson?.data || detailJson || {})
      return NextResponse.json({
        ok: true,
        mode: 'detail',
        id,
        status: detailRes.status,
        detail: detailJson ?? detailText,
        extracted: mapped,
      })
    }

    // default: lista simples para inspecionar payload
    const res = await blingFetch('/produtos?page=1&limit=5', { method: 'GET' })
    const text = await res.text()
    let json: any = null
    try { json = JSON.parse(text) } catch { /* keep raw */ }
    const mapped = Array.isArray(json?.data) ? json.data.map((p: any) => mapBlingProductToLocal(p)) : []

    return NextResponse.json({
      ok: true,
      mode: 'list',
      status: res.status,
      raw: json ?? text,
      mapped,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'debug failed' }, { status: 500 })
  }
}
