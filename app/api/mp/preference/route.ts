import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import type { Product } from '@prisma/client'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await req.json().catch(() => ({}))
    const orderId: string | undefined = body.orderId
    const itemsInput: Array<{ productId: string; quantity: number }> = Array.isArray(body.items) ? body.items : []

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ ok: false, error: 'MP_ACCESS_TOKEN not configured' }, { status: 500 })
    }

    if (!orderId || !itemsInput.length) {
      return NextResponse.json({ ok: false, error: 'orderId and items are required' }, { status: 400 })
    }

    const productIds = itemsInput.map((i) => String(i.productId))
    const products: Product[] = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const priceMap = new Map<string, any>(products.map((p: Product) => [p.id, p.price as any]))
    const nameMap = new Map<string, string>(products.map((p: Product) => [p.id, p.name]))

    const items = itemsInput.map((it) => ({
      id: String(it.productId),
      title: nameMap.get(String(it.productId)) || 'Produto',
      quantity: Math.max(1, Number(it.quantity || 1)),
      unit_price: Number(priceMap.get(String(it.productId)) || 0),
      currency_id: 'BRL',
    }))

    const origin = req.headers.get('origin') || process.env.BASE_URL || 'http://localhost:3000'

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const pref = new Preference(client)
    const prefRes = await pref.create({
      body: {
        items,
        external_reference: String(orderId),
        back_urls: {
          success: `${origin}/checkout/success`,
          failure: `${origin}/checkout/failure`,
          pending: `${origin}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${origin}/api/mp/webhook`,
      },
    })

    return NextResponse.json({ ok: true, id: prefRes.id, init_point: (prefRes as any).init_point, sandbox_init_point: (prefRes as any).sandbox_init_point })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
