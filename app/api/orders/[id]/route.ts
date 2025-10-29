import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrisma()
  const o = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, items: { include: { product: true } } },
  })
  if (!o) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true, order: o })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prisma = await getPrisma()
    const body = await req.json()
    const { status, invoiceNumber, labelFormat, shipping } = body || {}

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(invoiceNumber && { invoiceNumber }),
        ...(labelFormat && { labelFormat }),
        ...(shipping?.name && { shippingName: shipping.name }),
        ...(shipping?.email && { shippingEmail: shipping.email }),
        ...(shipping?.phone && { shippingPhone: shipping.phone }),
        ...(shipping?.cep && { shippingZip: shipping.cep }),
        ...(shipping?.address && { shippingAddress: shipping.address }),
        ...(shipping?.number && { shippingNumber: shipping.number }),
        ...(shipping?.complement && { shippingComplement: shipping.complement }),
        ...(shipping?.neighborhood && { shippingNeighborhood: shipping.neighborhood }),
        ...(shipping?.city && { shippingCity: shipping.city }),
        ...(shipping?.state && { shippingState: shipping.state }),
      },
    })
    return NextResponse.json({ ok: true, id: updated.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 })
  }
}

