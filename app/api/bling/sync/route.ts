import { NextRequest, NextResponse } from 'next/server'
import { fetchBlingProducts, fetchBlingOrders } from '@/lib/bling'
import { getPrisma } from '@/lib/prisma'
import { upsertOrderFromBling, upsertProductFromBling, recordSyncLog } from '@/lib/blingMappers'

// Manual sync trigger. Requires BLING_API_TOKEN. If DATABASE_URL is not set,
// endpoint returns 503 to avoid runtime errors until DB is configured.

export async function POST(_req: NextRequest) {
  if (!process.env.BLING_API_TOKEN) {
    return NextResponse.json({ ok: false, error: 'BLING_API_TOKEN not configured' }, { status: 400 })
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: 'DATABASE_URL not configured. Install Prisma and run migrations before syncing.' },
      { status: 503 },
    )
  }

  // Fetch remote data (example)
  const [products, orders] = await Promise.all([
    fetchBlingProducts({ limit: 50 }),
    fetchBlingOrders({ limit: 50 }),
  ])

  const prisma = await getPrisma()

  const prodList: any[] = Array.isArray(products?.data) ? products.data : Array.isArray(products) ? products : []
  const orderList: any[] = Array.isArray(orders?.data) ? orders.data : Array.isArray(orders) ? orders : []

  let productsUpserted = 0
  for (const p of prodList) {
    try {
      const res = await upsertProductFromBling(prisma, p)
      productsUpserted += 1
      await recordSyncLog(prisma, { source: 'bling', entity: 'product', action: res?.action || 'upsert', externalId: p?.id || p?.codigo, details: null })
    } catch (e) {
      // keep going
    }
  }

  let ordersUpserted = 0
  for (const o of orderList) {
    try {
      const res = await upsertOrderFromBling(prisma, o)
      ordersUpserted += 1
      await recordSyncLog(prisma, { source: 'bling', entity: 'order', action: res?.action || 'upsert', externalId: o?.id || o?.numero, details: null })
    } catch (e) {
      // keep going
    }
  }

  return NextResponse.json({ ok: true, fetched: { products: prodList.length, orders: orderList.length }, upserted: { products: productsUpserted, orders: ordersUpserted } })
}
