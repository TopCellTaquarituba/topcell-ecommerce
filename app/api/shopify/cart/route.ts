import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { createShopifyCart, getShopifyProductByHandle } from '@/lib/shopify'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    let { lines, handle } = body as { lines?: Array<{ merchandiseId: string; quantity: number }>; handle?: string }
    if ((!lines || !Array.isArray(lines) || lines.length === 0) && handle) {
      const p = await getShopifyProductByHandle(handle)
      const v = p?.variants?.nodes?.[0]
      if (!v?.id) return NextResponse.json({ ok: false, error: 'product_has_no_variants' }, { status: 400 })
      lines = [{ merchandiseId: v.id, quantity: 1 }]
    }
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ ok: false, error: 'lines_required' }, { status: 400 })
    }
    const cart = await createShopifyCart(lines)
    return NextResponse.json({ ok: true, cart })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 })
  }
}

