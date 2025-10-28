import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { upsertOrderFromBling, upsertProductFromBling, recordSyncLog } from '@/lib/blingMappers'

// Webhook endpoint for Bling ERP callbacks (orders, products, invoices, etc.)
// Configure the URL in Bling dashboard to point here.
// Add an optional secret validation if supported by your plan.

export async function POST(req: NextRequest) {
  // Optional: validate a shared secret header
  const expected = process.env.BLING_WEBHOOK_SECRET
  const received = req.headers.get('x-bling-secret') || req.headers.get('x-webhook-secret')
  if (expected && received !== expected) {
    return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: 'DATABASE_URL not configured' }, { status: 503 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  // Log minimal info (replace with DB writes once Prisma is configured)
  console.log('[Bling webhook] event', {
    type: payload?.type || payload?.event || 'unknown',
    id: payload?.id || payload?.resource?.id || null,
  })

  try {
    const prisma = await getPrisma()
    const type = (payload?.type || payload?.event || '').toString().toLowerCase()
    const resource = payload?.resource || payload?.data || payload

    let res: any = null
    if (type.includes('order') || resource?.order || resource?.pedido) {
      const orderRaw = resource?.order || resource?.pedido || resource
      res = await upsertOrderFromBling(prisma, orderRaw)
      await recordSyncLog(prisma, { source: 'bling', entity: 'order', action: res?.action || 'upsert', externalId: orderRaw?.id || orderRaw?.numero, details: { type, id: orderRaw?.id } })
    } else if (type.includes('product') || resource?.product || resource?.produto) {
      const prodRaw = resource?.product || resource?.produto || resource
      res = await upsertProductFromBling(prisma, prodRaw)
      await recordSyncLog(prisma, { source: 'bling', entity: 'product', action: res?.action || 'upsert', externalId: prodRaw?.id || prodRaw?.codigo, details: { type, id: prodRaw?.id } })
    } else {
      // Unknown event: log only
      await recordSyncLog(prisma, { source: 'bling', entity: 'unknown', action: 'ignore', externalId: null, details: payload })
    }

    return NextResponse.json({ ok: true, result: res })
  } catch (err: any) {
    console.error('[Bling webhook] error', err)
    return NextResponse.json({ ok: false, error: err?.message || 'internal error' }, { status: 500 })
  }
}
