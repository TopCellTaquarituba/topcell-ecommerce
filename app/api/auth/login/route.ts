import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import { setAuthCookie, signCustomerToken, verifyPassword } from '@/lib/auth'

function onlyDigits(s?: string | null) {
  return (s || '').replace(/\D+/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await req.json()
    const identifier: string = (body.identifier || '').toString().trim()
    const password: string = String(body.password || '')
    if (!identifier || !password) {
      return NextResponse.json({ ok: false, error: 'Informe email/CPF e senha' }, { status: 400 })
    }
    const cpf = onlyDigits(identifier)
    const where = cpf ? { OR: [ { cpfCnpj: cpf }, { email: identifier } ] } : { email: identifier }
    const customer = await prisma.customer.findFirst({ where })
    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ ok: false, error: 'Usuário não encontrado' }, { status: 400 })
    }
    const ok = await verifyPassword(password, customer.passwordHash)
    if (!ok) return NextResponse.json({ ok: false, error: 'Senha inválida' }, { status: 400 })

    const token = signCustomerToken({ id: customer.id, email: customer.email })
    const res = NextResponse.json({ ok: true, customer: { id: customer.id, name: customer.name, email: customer.email } })
    setAuthCookie(res, token)
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Falha ao autenticar' }, { status: 400 })
  }
}

