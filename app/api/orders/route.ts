import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'
import type { Order } from '@prisma/client'

type QueryBool = string | string[] | undefined

function parseArray(param: string | null): string[] | undefined {
  if (!param) return undefined
  return param
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toNumber(v: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function toDate(v: string | null): Date | undefined {
  if (!v) return undefined
  const d = new Date(v)
  return isNaN(d.getTime()) ? undefined : d
}

function decimalToNumber(x: any): number {
  if (x == null) return 0
  if (typeof x === 'number') return x
  if (typeof x === 'string') return Number(x)
  if (typeof x === 'object' && 'toNumber' in x) {
    try {
      // Prisma Decimal
      // @ts-ignore
      return x.toNumber()
    } catch {}
  }
  return Number(x)
}

function buildDemoData() {
  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'canceled'] as const
  const categories = ['Smartphones', 'Notebooks', 'Acessórios', 'Tablets']
  const products = [
    { id: 'p1', name: 'iPhone 15 Pro', category: 'Smartphones', price: 8999 },
    { id: 'p2', name: 'Galaxy S24', category: 'Smartphones', price: 7499 },
    { id: 'p3', name: 'MacBook Pro 16"', category: 'Notebooks', price: 22999 },
    { id: 'p4', name: 'AirPods Pro 2', category: 'Acessórios', price: 2299 },
    { id: 'p5', name: 'iPad Pro 12.9"', category: 'Tablets', price: 10999 },
  ]

  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const makeDate = (daysAgo: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - daysAgo)
    return new Date(d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()))
  }

  const orders = Array.from({ length: 40 }).map((_, idx) => {
    const prod = products[idx % products.length]
    const qty = (idx % 3) + 1
    const status = statuses[idx % statuses.length]
    const createdAt = makeDate(idx % 14)
    const total = prod.price * qty
    return {
      id: 'o' + (1000 + idx),
      number: String(1000 + idx),
      status,
      total,
      createdAt,
      updatedAt: createdAt,
      customer: { id: 'c' + (1 + (idx % 10)), name: `Cliente ${(idx % 10) + 1}` },
      items: [
        {
          id: 'oi' + idx,
          quantity: qty,
          price: prod.price,
          product: { id: prod.id, name: prod.name, category: { name: prod.category } },
        },
      ],
    }
  })

  return { orders: [] }
}

function computeAggregates(orders: any[]) {
  const summary = orders.reduce(
    (acc, o) => {
      const total = decimalToNumber(o.total)
      acc.revenue += total
      acc.count += 1
      return acc
    },
    { revenue: 0, count: 0 }
  )
  const avgTicket = summary.count ? summary.revenue / summary.count : 0

  const byDayMap = new Map<string, { date: string; revenue: number; count: number }>()
  for (const o of orders) {
      const d = new Date(o.createdAt)
      const key = d.toISOString().slice(0,10)
      const total = decimalToNumber(o.total)
      const cur = byDayMap.get(key) || { date: key, revenue: 0, count: 0 }
      cur.revenue += total
      cur.count += 1
      byDayMap.set(key, cur)
  }
  const byDay = Array.from(byDayMap.values()).sort((a,b)=>a.date.localeCompare(b.date))

  const byStatusMap = new Map<string, number>()
  for (const o of orders) {
    byStatusMap.set(o.status, (byStatusMap.get(o.status) || 0) + 1)
  }
  const byStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count }))

  const byCategoryMap = new Map<string, { category: string; revenue: number; count: number }>()
  for (const o of orders) {
    for (const it of o.items || []) {
      const cat = it.product?.category?.name || 'Outros'
      const rev = decimalToNumber(it.price) * (it.quantity ?? 1)
      const cur = byCategoryMap.get(cat) || { category: cat, revenue: 0, count: 0 }
      cur.revenue += rev
      cur.count += it.quantity ?? 1
      byCategoryMap.set(cat, cur)
    }
  }
  const byCategory = Array.from(byCategoryMap.values()).sort((a,b)=>b.revenue-a.revenue)

  const prodMap = new Map<string, { productId: string; name: string; revenue: number; units: number }>()
  for (const o of orders) {
    for (const it of o.items || []) {
      const id = it.product?.id || 'unknown'
      const name = it.product?.name || 'Produto'
      const rev = decimalToNumber(it.price) * (it.quantity ?? 1)
      const cur = prodMap.get(id) || { productId: id, name, revenue: 0, units: 0 }
      cur.revenue += rev
      cur.units += it.quantity ?? 1
      prodMap.set(id, cur)
    }
  }
  const topProducts = Array.from(prodMap.values()).sort((a,b)=>b.revenue-a.revenue).slice(0,10)

  return { summary: { revenue: summary.revenue, count: summary.count, avgTicket }, byDay, byStatus, byCategory, topProducts }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mine = searchParams.get('mine') === '1'
  const from = toDate(searchParams.get('from'))
  const to = toDate(searchParams.get('to'))
  const statuses = parseArray(searchParams.get('status'))
  const categories = parseArray(searchParams.get('category'))
  const customerId = searchParams.get('customerId') || undefined
  const productId = searchParams.get('productId') || undefined
  const minTotal = toNumber(searchParams.get('minTotal'))
  const maxTotal = toNumber(searchParams.get('maxTotal'))
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')))
  const q = searchParams.get('q') || undefined

  const hasDb = !!process.env.DATABASE_URL

  try {
    let orders: any[] = []
    let total = 0
    let customerTotal = 0
    let statsSource: any[] = []

    if (mine && hasDb) {
      const { getAuthTokenFromRequest, verifyCustomerToken } = await import('@/lib/auth')
      const token = getAuthTokenFromRequest(req as any)
      const payload = token ? verifyCustomerToken(token) : null
      if (!payload?.sub) return NextResponse.json({ ok: true, orders: [] })
      const prisma = await getPrisma()
      const list: Order[] = await prisma.order.findMany({ where: { customerId: payload.sub }, orderBy: { createdAt: 'desc' } })
      const normalized = list.map((o: Order) => ({ id: o.id, number: o.number ?? o.id, status: o.status, total: Number(o.total as any), createdAt: o.createdAt }))
      return NextResponse.json({ ok: true, orders: normalized })
    }

    if (!hasDb) {
      const demo = buildDemoData() as { orders: any[] }
      statsSource = demo.orders
        .filter((o) => !from || new Date(o.createdAt) >= from)
        .filter((o) => !to || new Date(o.createdAt) <= to!)
        .filter((o) => !statuses || statuses.includes(o.status))
        .filter((o) => !customerId || o.customer?.id === customerId)
        .filter((o) => !minTotal || decimalToNumber(o.total) >= minTotal)
        .filter((o) => !maxTotal || decimalToNumber(o.total) <= maxTotal)
        .filter((o) => !categories || o.items?.some((it: any) => categories!.includes(it.product?.category?.name)))
        .filter((o) => !q || o.number?.includes(q) || o.customer?.name?.toLowerCase().includes(q.toLowerCase()))
      total = statsSource.length
      const start = (page - 1) * pageSize
      orders = statsSource.slice(start, start + pageSize)
    } else {
      const prisma = await getPrisma()
      const where: any = {}
      if (from || to) where.createdAt = { ...(from && { gte: from }), ...(to && { lte: to }) }
      if (statuses) where.status = { in: statuses }
      if (customerId) where.customerId = customerId
      if (minTotal || maxTotal) where.total = { ...(minTotal && { gte: minTotal }), ...(maxTotal && { lte: maxTotal }) }
      if (q) {
        where.OR = [
          { number: { contains: q } },
          { customer: { is: { name: { contains: q, mode: 'insensitive' } } } },
        ]
      }
      if (categories || productId) {
        where.items = {
          some: {
            ...(productId && { productId }),
            ...(categories && { product: { category: { name: { in: categories } } } }),
          },
        }
      }

      total = await prisma.order.count({ where })
      const skip = (page - 1) * pageSize
      const [pageOrders, statsOrders, customerCountValue] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.order.findMany({
          where,
          include: {
            customer: true,
            items: { include: { product: { include: { category: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.customer.count(),
      ])
      orders = pageOrders
      statsSource = statsOrders
      customerTotal = customerCountValue
    }

    const agg = computeAggregates(statsSource)
    const normalizedOrders = orders.map((o) => ({
      id: o.id,
      number: o.number ?? o.id,
      status: o.status,
      total: decimalToNumber(o.total),
      createdAt: o.createdAt,
      customer: { id: o.customer?.id ?? '', name: o.customer?.name ?? '' },
    }))

    return NextResponse.json({ ok: true, page, pageSize, total, customerCount: customerTotal, orders: normalizedOrders, ...agg })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed to load orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const { getAuthTokenFromRequest, verifyCustomerToken } = await import('@/lib/auth')
    const body = await req.json()
    const {
      customer = {},
      shipping = {},
      items = [],
    } = body || {}

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'items are required' }, { status: 400 })
    }

    const productIds: string[] = items.map((it: any) => String(it.productId))
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const priceMap = new Map(products.map((p: any) => [p.id, p.price]))

    let total = 0
    const orderItems = items.map((it: any) => {
      const price = priceMap.get(String(it.productId))
      if (!price) throw new Error('Produto inválido: ' + it.productId)
      const qty = Math.max(1, Number(it.quantity || 1))
      total += Number(price) * qty
      return { productId: String(it.productId), quantity: qty, price }
    })

    // Prefer authenticated customer if available
    const token = getAuthTokenFromRequest(req as any)
    const payload = token ? verifyCustomerToken(token) : null
    let customerId: string | undefined = payload?.sub
    const name = String(customer.name || shipping.name || 'Cliente')
    const email = customer.email ? String(customer.email) : null
    const phone = String(customer.phone || shipping.phone || '') || null
    if (!customerId) {
      if (email) {
        const c = await prisma.customer.upsert({ where: { email }, update: { name, phone: phone || undefined }, create: { name, email, phone } })
        customerId = c.id
      } else {
        const c = await prisma.customer.create({ data: { name, email: null, phone } })
        customerId = c.id
      }
    } else {
      // update basic info for logged customer
      await prisma.customer.update({ where: { id: customerId }, data: { name, phone: phone || undefined, ...(email ? { email } : {}) } }).catch(()=>{})
    }

    const genNumber = () => {
      const d = new Date()
      const y = d.getFullYear().toString().slice(-2)
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const s = String(Math.floor(d.getTime() % 100000)).padStart(5, '0')
      return `${y}${m}${s}`
    }

    const order = await prisma.order.create({
      data: {
        number: genNumber(),
        status: 'pending',
        total,
        customer: { connect: { id: customerId! } },
        items: { create: orderItems },
        shippingName: name,
        shippingEmail: email || undefined,
        shippingPhone: phone || undefined,
        shippingZip: shipping.cep || shipping.zip || undefined,
        shippingAddress: shipping.address || undefined,
        shippingNumber: shipping.number || undefined,
        shippingComplement: shipping.complement || undefined,
        shippingNeighborhood: shipping.neighborhood || undefined,
        shippingCity: shipping.city || undefined,
        shippingState: shipping.state || undefined,
        labelFormat: shipping.labelFormat || 'a4',
      },
      include: { items: true },
    })

    // Try to create order in Bling (non-blocking)
    try {
      const { blingFetch, buildBlingOrderPayload, getPrisma: _noop } = await import('@/lib/bling') as any
      const payload = buildBlingOrderPayload({ ...order, customer: { id: customerId, name, email, phone } })
      const resp = await blingFetch('/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (resp.ok) {
        const data = await resp.json()
        const externalId = String((data as any)?.data?.id || (data as any)?.id || '')
        if (externalId) {
          await prisma.order.update({ where: { id: order.id }, data: { externalId } })
        }
      } else {
        const t = await resp.text()
        console.warn('Bling order create failed:', t)
      }
    } catch (err) {
      console.warn('Bling integration skipped:', (err as any)?.message)
    }

    return NextResponse.json({ ok: true, id: order.id, number: order.number })
  } catch (e: any) {
    console.error('POST /api/orders error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'failed to create order' }, { status: 400 })
  }
}
