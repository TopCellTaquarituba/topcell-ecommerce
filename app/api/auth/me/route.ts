import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import { getAuthTokenFromRequest, verifyCustomerToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req)
    if (!token) return NextResponse.json({ ok: false, authenticated: false }, { status: 200 })
    const payload = verifyCustomerToken(token)
    if (!payload?.sub) return NextResponse.json({ ok: false, authenticated: false }, { status: 200 })
    const prisma = await getPrisma()
    const c = await prisma.customer.findUnique({ where: { id: payload.sub } })
    if (!c) return NextResponse.json({ ok: false, authenticated: false }, { status: 200 })
    return NextResponse.json({ ok: true, authenticated: true, customer: { id: c.id, name: c.name, email: c.email, phone: c.phone, cpfCnpj: c.cpfCnpj, birthDate: c.birthDate } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, authenticated: false, error: e?.message || 'failed' }, { status: 200 })
  }
}

