import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getPrisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ ok: false, error: 'MP_ACCESS_TOKEN not configured' }, { status: 500 })
    }
    const prisma = await getPrisma()
    const body = await req.json()
    const orderId: string = String(body.orderId || '')
    const formData: any = body.formData || {}
    if (!orderId || !formData) return NextResponse.json({ ok: false, error: 'orderId and formData are required' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ ok: false, error: 'order not found' }, { status: 404 })
    const amount = Number(order.total)

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const payment = new Payment(client)

    // Card payment
    if (formData.token) {
      const payload: any = {
        transaction_amount: amount,
        token: formData.token,
        installments: Number(formData.installments || 1),
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: formData.payer?.email || 'cliente@example.com',
          identification: formData.payer?.identification, // { type: 'CPF', number }
        },
        external_reference: orderId,
      }
      const resp = await payment.create({ body: payload })
      return NextResponse.json({ ok: true, id: resp.id, status: (resp as any).status })
    }

    // PIX payment
    const pixPayload: any = {
      transaction_amount: amount,
      description: `Pedido ${order.number || order.id}`,
      payment_method_id: 'pix',
      payer: {
        email: formData.payer?.email || 'cliente@example.com',
        first_name: formData.payer?.first_name || 'Cliente',
        last_name: formData.payer?.last_name || '',
        identification: formData.payer?.identification, // { type: 'CPF', number }
      },
      external_reference: orderId,
    }
    const resp = await payment.create({ body: pixPayload })
    const t = (resp as any)?.point_of_interaction?.transaction_data
    return NextResponse.json({ ok: true, id: resp.id, status: (resp as any).status, pix: { qr_code: t?.qr_code, qr_code_base64: t?.qr_code_base64, ticket_url: t?.ticket_url } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 })
  }
}
