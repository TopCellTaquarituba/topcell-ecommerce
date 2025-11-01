import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getPrisma } from '@/lib/prisma'
import { exportOrderToBling } from '@/lib/bling' // Criaremos este arquivo a seguir

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    // Processar apenas notificações de pagamento
    if (type === 'payment' && data?.id) {
      const paymentId = data.id
      const payment = new Payment(client)
      const paymentInfo = await payment.get({ id: paymentId })

      if (!paymentInfo || !paymentInfo.external_reference) {
        console.warn(`Webhook MP: Pagamento ${paymentId} sem referência externa.`)
        return NextResponse.json({ status: 'ok' })
      }

      const orderId = paymentInfo.external_reference
      const prisma = await getPrisma()

      // Encontrar o pedido no nosso banco de dados
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      })

      if (!order) {
        console.error(`Webhook MP: Pedido com ID ${orderId} não encontrado.`)
        return NextResponse.json({ status: 'ok' })
      }

      // Mapear status do MP para o status do nosso sistema
      let newStatus = order.status
      switch (paymentInfo.status) {
        case 'approved':
          newStatus = 'paid'
          break
        case 'in_process':
          newStatus = 'pending'
          break
        case 'rejected':
        case 'cancelled':
          newStatus = 'cancelled'
          break;
      }

      // Atualizar o status do pedido se ele mudou
      if (order.status !== newStatus) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        })

        // Se o pedido foi pago, exportar para o Bling
        if (newStatus === 'paid') {
          await exportOrderToBling(order)
        }
      }
    }

    return NextResponse.json({ status: 'received' })

  } catch (error: any) {
    console.error('Erro no webhook do Mercado Pago:', error)
    return NextResponse.json({ error: 'Falha no processamento do webhook' }, { status: 500 })
  }
}