import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getPrisma } from '@/lib/prisma'
import crypto from 'crypto'

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

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } })
    if (!order) return NextResponse.json({ ok: false, error: 'order not found' }, { status: 404 })
    const amount = Number(order.total)

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const payment = new Payment(client)

    const methodId = formData.payment_method_id || formData.paymentMethodId || formData.payment_type_id
    // Build a valid public notification URL only when available (MP rejects localhost)
    const rawBase = process.env.MP_NOTIFICATION_URL || process.env.BASE_URL || req.headers.get('origin') || ''
    const isValidBase = /^https?:\/\/[\w.-]+/i.test(rawBase) && !/localhost|127\.0\.0\.1/i.test(rawBase)
    const baseUrl = isValidBase ? rawBase.replace(/\/$/, '') : ''
    const notificationUrl = baseUrl ? `${baseUrl}/api/mp/webhook` : undefined
    const idempotencyKey = `order:${orderId}`
    const makeItems = () => (order.items || []).map((it: any) => ({
      id: it.productId,
      title: it.product?.name || 'Item',
      quantity: Number(it.quantity || 1),
      unit_price: Number(it.price as any) || 0,
    }))

    // Card payment (requires token)
    if (formData.token && methodId !== 'pix') {
      const payload: any = {
        transaction_amount: amount,
        token: formData.token,
        installments: Number(formData.installments || 1),
        payment_method_id: methodId || formData.payment_method_id,
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : undefined,
        binary_mode: true,
        payer: {
          email: formData.payer?.email || order.shippingEmail || 'cliente@example.com',
          identification: formData.payer?.identification, // { type: 'CPF', number }
          first_name: formData.payer?.first_name || order.shippingName?.split(' ')?.[0] || 'Cliente',
          last_name: formData.payer?.last_name || order.shippingName?.split(' ')?.slice(1).join(' '),
        },
        additional_info: {
          items: makeItems(),
          payer: { ip_address: req.headers.get('x-forwarded-for') || undefined },
          shipments: {
            receiver_address: {
              zip_code: order.shippingZip || undefined,
              street_name: order.shippingAddress || undefined,
              street_number: order.shippingNumber || undefined,
              city_name: order.shippingCity || undefined,
              state_name: order.shippingState || undefined,
            },
          },
        },
        metadata: { orderId },
        notification_url: notificationUrl,
        external_reference: orderId,
      }
      const resp = await payment.create({ body: payload, requestOptions: { idempotencyKey } }).catch((e: any) => { throw e })
      const status = (resp as any).status
      if (status === 'approved') {
        await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } }).catch(() => null)
      }
      return NextResponse.json({ ok: true, id: resp.id, status })
    }

    // PIX payment (fallback/default)
    const pixPayload: any = {
      transaction_amount: amount,
      description: `Pedido ${order.number || order.id}`,
      payment_method_id: 'pix',
      payer: {
        email: formData?.payer?.email || formData?.email || 'cliente@example.com',
        first_name: formData?.payer?.first_name || 'Cliente',
        last_name: formData?.payer?.last_name || '',
        ...(formData?.payer?.identification ? { identification: formData.payer.identification } : {}),
      },
      additional_info: { items: makeItems() },
      metadata: { orderId },
      notification_url: notificationUrl,
      external_reference: orderId,
    }
    // Set PIX expiration for 30 minutes from now
    try {
      const exp = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      pixPayload.date_of_expiration = exp
    } catch {}
    const resp = await payment.create({ body: pixPayload, requestOptions: { idempotencyKey } }).catch((e: any) => { throw e })
    const t = (resp as any)?.point_of_interaction?.transaction_data
    return NextResponse.json({ ok: true, id: resp.id, status: (resp as any).status, pix: { qr_code: t?.qr_code, qr_code_base64: t?.qr_code_base64, ticket_url: t?.ticket_url } })
  } catch (e: any) {
    let details: any = undefined
    try {
      const cause = e?.cause || e?.error || e
      details = typeof cause === 'object' ? cause : String(cause)
    } catch {}
    return NextResponse.json({ ok: false, error: e?.message || 'failed', details }, { status: 400 })
  }
}
