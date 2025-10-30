import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { blingFetch, fetchBlingProductImages, mapBlingProductToLocal } from '@/lib/bling'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    const detailRes = await blingFetch(`/produtos/${encodeURIComponent(id)}`, { method: 'GET' })
    const detailText = await detailRes.text()
    let detailJson: any = null
    try { detailJson = JSON.parse(detailText) } catch { /* keep raw */ }

    const images = await fetchBlingProductImages(id)
    const mapped = mapBlingProductToLocal(detailJson?.data || detailJson || {})

    return NextResponse.json({
      ok: true,
      id,
      detailStatus: detailRes.status,
      detail: detailJson ?? detailText,
      extracted: {
        primary: mapped.image || null,
        images,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'debug failed' }, { status: 500 })
  }
}

