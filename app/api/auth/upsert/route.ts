import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import { setAuthCookie, signCustomerToken } from '@/lib/auth'

function onlyDigits(s?: string | null) {
  return (s || '').replace(/\D+/g, '')
}

function parseBirthDate(input?: string | null): Date | null {
  if (!input) return null
  let s = input.trim()
  // Accept formats: dd/mm/yyyy, yyyy-mm-dd, ddmmyyyy, yyyymmdd
  if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(s)) {
    const [a,b,c] = s.split(/[\/-]/)
    const dd = Number(a)
    const mm = Number(b) - 1
    const yyyy = Number(c)
    const d = new Date(yyyy, mm, dd)
    return isNaN(d.getTime()) ? null : d
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }
  const digits = onlyDigits(s)
  if (digits.length === 8) {
    // try ddmmyyyy then yyyymmdd
    const dd = Number(digits.slice(0,2))
    const mm = Number(digits.slice(2,4)) - 1
    const yyyy = Number(digits.slice(4))
    let d = new Date(yyyy, mm, dd)
    if (!isNaN(d.getTime())) return d
    const yyyy2 = Number(digits.slice(0,4))
    const mm2 = Number(digits.slice(4,6)) - 1
    const dd2 = Number(digits.slice(6))
    d = new Date(yyyy2, mm2, dd2)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await req.json()
    const name: string = (body.name || '').toString().trim() || 'Cliente'
    const email: string | null = (body.email || '').toString().trim() || null
    const phoneDigits = onlyDigits(body.phone)
    const documentDigits = onlyDigits(body.document || body.cpfCnpj)
    const birthDate = parseBirthDate(body.birthDate)

    if (!email || !phoneDigits || !documentDigits) {
      return NextResponse.json({ ok: false, error: 'email, telefone e CPF/CNPJ são obrigatórios' }, { status: 400 })
    }

    if (![11,14].includes(documentDigits.length)) {
      return NextResponse.json({ ok: false, error: 'CPF/CNPJ inválido' }, { status: 400 })
    }

    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { cpfCnpj: documentDigits },
          { email },
        ],
      },
    })

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name,
          email,
          phone: phoneDigits,
          cpfCnpj: documentDigits,
          ...(birthDate ? { birthDate } : {}),
        },
      })
    } else {
      customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone: phoneDigits,
          cpfCnpj: documentDigits,
          ...(birthDate ? { birthDate } : {}),
        },
      })
    }

    const token = signCustomerToken({ id: customer.id, email: customer.email })
    const res = NextResponse.json({ ok: true, customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, cpfCnpj: customer.cpfCnpj, birthDate: customer.birthDate } })
    setAuthCookie(res, token)
    return res
  } catch (e: any) {
    console.error('POST /api/auth/upsert error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'falha ao autenticar' }, { status: 400 })
  }
}

