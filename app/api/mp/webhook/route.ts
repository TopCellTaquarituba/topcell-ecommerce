import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getPrisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

function mapStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved':
      return 'paid'
    case 'pending':
      return 'pending'
    case 'in_process':
      return 'processing'
    case 'rejected':
      return 'canceled'
    default:
      return 'pending'
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const url = new URL(req.url)
    // MP sometimes sends data on query and sometimes in body
    const body = await req.json().catch(() => ({} as any))
    const type = url.searchParams.get('type') || body?.type
    const paymentId = url.searchParams.get('data.id') || body?.data?.id || body?.id

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ ok: false, error: 'missing MP_ACCESS_TOKEN' }, { status: 500 })
    }

    // Optional signature verification (x-signature)
    try {
      const secret = process.env.MP_WEBHOOK_SECRET
      const signature = req.headers.get('x-signature') || ''
      const reqId = req.headers.get('x-request-id') || ''
      const tsMatch = /ts=(\d+)/.exec(signature || '')
      const v1Match = /v1=([a-f0-9]+)/.exec(signature || '')
      const ts = tsMatch ? tsMatch[1] : undefined
      if (secret && v1Match && ts) {
        // Build text per MP docs: id:<data.id>;request-id:<x-request-id>;ts:<ts>
        const content = `id:${paymentId};request-id:${reqId};ts:${ts}`
        const expected = require('crypto').createHmac('sha256', secret).update(content).digest('hex')
        if (expected !== v1Match[1]) {
          return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
        }
      }
    } catch { /* ignore and continue without signature check */ }

    if (type === 'payment' && paymentId) {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
      const payment = new Payment(client)
      const result = await payment.get({ id: String(paymentId) })
      const status = mapStatus((result as any)?.status || '')
      const extRef = (result as any)?.external_reference as string | undefined
      if (extRef) {
        const updated = await prisma.order.update({ where: { id: extRef }, data: { status } }).catch(() => null)
        if (updated) {
          const customer = updated.customerId ? await prisma.customer.findUnique({ where: { id: updated.customerId } }) : null
          const to = updated.shippingEmail || customer?.email
          if (to) {
            const subject = status === 'paid' ? `Pagamento aprovado - Pedido #${updated.number ?? updated.id}` : 
                             status === 'pending' ? `Pagamento em análise - Pedido #${updated.number ?? updated.id}` :
                             status === 'canceled' ? `Pagamento não aprovado - Pedido #${updated.number ?? updated.id}` : `Atualização do Pedido #${updated.number ?? updated.id}`
            const total = Number(updated.total || 0).toFixed(2).replace('.', ',')
            const html = `
              <div style="font-family:Arial,sans-serif;line-height:1.5">
                <h2 style="margin:0 0 12px">${subject}</h2>
                <p>Olá,</p>
                <p>Recebemos uma atualização do seu pagamento no Mercado Pago.</p>
                <ul>
                  <li><strong>Pedido:</strong> ${updated.number ?? updated.id}</li>
                  <li><strong>Status:</strong> ${status}</li>
                  <li><strong>Total:</strong> R$ ${total}</li>
                </ul>
                <p>Você pode acompanhar em: <a href="${process.env.BASE_URL || ''}/orders">Meus pedidos</a></p>
              </div>
            `
            await sendEmail({ to, subject, html }).catch(()=>({ ok:false }))
          }
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 200 })
  }
}

export async function GET(req: NextRequest) {
  // MP can ping GET as a verification step
  return NextResponse.json({ ok: true })
}
