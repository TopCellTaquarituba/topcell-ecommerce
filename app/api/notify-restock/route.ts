import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await req.json().catch(() => ({})) as any
    const productId = String(body.productId || '')
    const email = String(body.email || '').trim()
    if (!productId || !email) return NextResponse.json({ ok: false, error: 'productId and email are required' }, { status: 400 })
    if (!isValidEmail(email)) return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ ok: false, error: 'product_not_found' }, { status: 404 })

    const to = process.env.STORE_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER
    const subject = `Pedido de notificação de estoque: ${product.name}`
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h3>Alguém pediu aviso de reposição</h3>
        <ul>
          <li><strong>Produto:</strong> ${product.name}</li>
          <li><strong>ID:</strong> ${product.id}</li>
          <li><strong>Email do cliente:</strong> ${email}</li>
        </ul>
      </div>
    `
    if (to) {
      await sendEmail({ to, subject, html }).catch(() => ({ ok: false }))
    } else {
      // Fallback quando SMTP não está configurado
      console.log('[notify-restock]', { productId, email })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 })
  }
}

