import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getPrisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, payment_method_id, transaction_amount, installments, payer, orderId, payment_type_id } = body

    const isPix = payment_method_id === 'pix' || payment_type_id === 'bank_transfer'

    if (!payment_method_id || !transaction_amount || !payer?.email || !orderId) {
      return NextResponse.json({ error: 'Dados de pagamento incompletos' }, { status: 400 })
    }
    if (!isPix && (!token || !installments)) {
      return NextResponse.json({ error: 'Dados de pagamento incompletos' }, { status: 400 })
    }

    const prisma = await getPrisma()

    // 1. Verifique se o pedido existe e se o valor bate
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Segurança: garanta que o valor do pagamento corresponde ao valor do pedido
    if (Number(order.total) !== transaction_amount) {
      return NextResponse.json({ error: 'Valor do pedido inválido' }, { status: 400 })
    }

    // 2. Crie o pagamento no Mercado Pago
    const payment = new Payment(client)
    const idempotencyKey = order.id // Evita duplicidade

    // Monta notification_url apenas se tivermos uma URL válida
    const envBase = process.env.MP_WEBHOOK_BASE_URL || process.env.BASE_URL || ''
    const origin = (req as any)?.nextUrl?.origin || ''
    const baseForWebhook = envBase || origin
    let notificationUrl: string | null = null
    try {
      if (baseForWebhook) notificationUrl = new URL('/api/mp/webhook', baseForWebhook).toString()
    } catch {}

    if (isPix) {
      const paymentResponse: any = await payment.create({
        body: {
          transaction_amount,
          description: `Pedido #${order.number}`,
          payment_method_id,
          payer: { email: payer.email, first_name: payer.first_name, last_name: payer.last_name },
          external_reference: order.id,
          ...(notificationUrl ? { notification_url: notificationUrl } : {}),
        },
        requestOptions: { idempotencyKey },
      })

      await prisma.order.update({ where: { id: order.id }, data: { paymentProviderId: String(paymentResponse.id) } })

      const pixData = paymentResponse?.point_of_interaction?.transaction_data
      return NextResponse.json({
        status: paymentResponse.status,
        id: paymentResponse.id,
        ...(pixData ? { pix: { qr_code: pixData.qr_code, qr_code_base64: pixData.qr_code_base64, ticket_url: pixData.ticket_url } } : {}),
      })
    }

    const paymentResponse: any = await payment.create({
      body: {
        transaction_amount,
        token,
        description: `Pedido #${order.number}`,
        installments,
        payment_method_id,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: payer.identification?.type && payer.identification?.number
            ? { type: payer.identification.type, number: payer.identification.number }
            : undefined,
        },
        // Referência para localizar o pedido no webhook
        external_reference: order.id,
        // URL que o Mercado Pago chamará para notificar sobre o status
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      },
      requestOptions: { idempotencyKey },
    })

    await prisma.order.update({ where: { id: order.id }, data: { paymentProviderId: String(paymentResponse.id) } })
    return NextResponse.json({ status: paymentResponse.status, id: paymentResponse.id })
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json({ error: 'Falha ao processar pagamento', details: error?.message || String(error) }, { status: 500 })
  }
}
