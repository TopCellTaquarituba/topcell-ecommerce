import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import { setAuthCookie, signCustomerToken, hashPassword } from '@/lib/auth'

function onlyDigits(s?: string | null) {
  return (s || '').replace(/\D+/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await req.json()
    const name: string = (body.name || '').toString().trim() || 'Cliente'
    const email: string | null = (body.email || '').toString().trim() || null
    const documentDigits = onlyDigits(body.document || body.cpfCnpj)
    const phoneDigits = onlyDigits(body.phone)
    const password: string = String(body.password || '')
    if ((!email && !documentDigits) || !password) {
      return NextResponse.json({ ok: false, error: 'Informe email ou CPF/CNPJ e uma senha' }, { status: 400 })
    }
    if (documentDigits && ![11, 14].includes(documentDigits.length)) {
      return NextResponse.json({ ok: false, error: 'CPF/CNPJ inválido' }, { status: 400 })
    }

    let existing = await prisma.customer.findFirst({ where: { OR: [ email ? { email } : undefined, documentDigits ? { cpfCnpj: documentDigits } : undefined ].filter(Boolean) as any } })

    if (existing && existing.passwordHash) {
      return NextResponse.json({ ok: false, error: 'Conta já existe. Faça login.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const customer = existing
      ? await prisma.customer.update({ where: { id: existing.id }, data: { name, email, cpfCnpj: documentDigits || existing.cpfCnpj, phone: phoneDigits || existing.phone, passwordHash } })
      : await prisma.customer.create({ data: { name, email, cpfCnpj: documentDigits || null, phone: phoneDigits || null, passwordHash } })

    const token = signCustomerToken({ id: customer.id, email: customer.email })
    const res = NextResponse.json({ ok: true, customer: { id: customer.id, name: customer.name, email: customer.email } })
    setAuthCookie(res, token)
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Falha ao registrar' }, { status: 400 })
  }
}

