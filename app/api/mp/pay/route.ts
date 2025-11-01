import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getPrisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, payment_method_id, transaction_amount, installments, payer, orderId } = body

    if (!token || !payment_method_id || !transaction_amount || !installments || !payer || !orderId) {
      return NextResponse.json({ error: 'Dados de pagamento incompletos' }, { status: 400 })
    }

    const prisma = await getPrisma()

    // 1. Verifique se o pedido existe e se o valor bate
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Segurança: Garanta que o valor do pagamento corresponde ao valor do pedido
    if (Number(order.total) !== transaction_amount) {
      return NextResponse.json({ error: 'Valor do pedido inválido' }, { status: 400 })
    }

    // 2. Crie o pagamento no Mercado Pago
    const payment = new Payment(client)

    const idempotencyKey = order.id // Usar o ID do pedido para evitar duplicidade

    const paymentResponse = await payment.create({
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
          identification: {
            type: payer.identification.type,
            number: payer.identification.number,
          },
        },
        // Referência para localizar o pedido no webhook
        external_reference: order.id,
        // URL que o Mercado Pago chamará para notificar sobre o status
        notification_url: `${process.env.BASE_URL}/api/mp/webhook`,
      },
      requestOptions: {
        idempotencyKey,
      },
    })

    // 3. Atualize o pedido com o ID do pagamento do Mercado Pago
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProviderId: String(paymentResponse.id) },
    })

    return NextResponse.json({ status: paymentResponse.status, id: paymentResponse.id })

  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json({ error: 'Falha ao processar pagamento', details: error.message }, { status: 500 })
  }
}