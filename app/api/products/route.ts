import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { Prisma } from '@prisma/client'
import { getPrisma } from '@/lib/prisma'

function parseNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export async function GET(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || undefined
    const category = searchParams.get('category') || undefined
    const brand = searchParams.get('brand') || undefined
    const take = Math.min(100, parseNumber(searchParams.get('limit')) || 50)
    const skip = Math.max(0, parseNumber(searchParams.get('skip')) || 0)

    const where: any = {}
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }]
    if (category) where.category = { is: { slug: category } }
    if (brand) where.brand = { is: { slug: brand } }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, brand: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ])

    // Compute stock via InventoryMovement sum (guard for empty list)
    const ids = items.map((p: any) => p.id)
    let stockMap = new Map<string, number>()
    if (ids.length > 0) {
      const movements = await prisma.inventoryMovement.groupBy({ by: ['productId'], _sum: { quantity: true }, where: { productId: { in: ids } } })
      stockMap = new Map(movements.map((m: any) => [m.productId, m._sum.quantity || 0]))
    }

    const data = items.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      image: p.image,
      images: p.images || [],
      category: p.category?.name || '',
      categorySlug: p.category?.slug || '',
      brand: p.brand?.name || '',
      rating: p.rating || 0,
      inStock: p.inStock,
      stock: stockMap.get(p.id) || 0,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({ ok: true, total, items: data })
  } catch (e: any) {
    console.error('GET /api/products error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prisma = await getPrisma()
    const { name, description = '', price, originalPrice, image = '', images = [], categoryName, brandName, stock } = body
    if (!name || price == null) return NextResponse.json({ ok: false, error: 'name and price are required' }, { status: 400 })

    const created = await prisma.product.create({
      data: {
        name,
        description,
        price: new Prisma.Decimal(String(price)),
        originalPrice: originalPrice != null ? new Prisma.Decimal(String(originalPrice)) : null,
        image,
        images,
        rating: 0,
        inStock: (stock ?? 0) > 0,
        ...(categoryName && { category: { connectOrCreate: { where: { slug: slugify(categoryName) }, create: { slug: slugify(categoryName), name: categoryName } } } }),
        ...(brandName && { brand: { connectOrCreate: { where: { slug: slugify(brandName) }, create: { slug: slugify(brandName), name: brandName } } } }),
      },
    })

    if (typeof stock === 'number' && stock !== 0) {
      await prisma.inventoryMovement.create({ data: { productId: created.id, quantity: stock, type: 'adjust', note: 'Inicial' } })
    }

    return NextResponse.json({ ok: true, id: created.id })
  } catch (e: any) {
    console.error('POST /api/products error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'invalid payload' }, { status: 500 })
  }
}

function slugify(input?: string) {
  return (input || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
