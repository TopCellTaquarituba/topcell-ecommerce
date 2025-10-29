import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { Prisma } from '@prisma/client'
import { getPrisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrisma()
  const p = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true, brand: true } })
  if (!p) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  const mv = await prisma.inventoryMovement.aggregate({ _sum: { quantity: true }, where: { productId: p.id } })
  return NextResponse.json({
    ok: true,
    item: {
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
      stock: mv._sum.quantity || 0,
      createdAt: p.createdAt,
    },
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const prisma = await getPrisma()
    const { name, description, price, originalPrice, image, images, categoryName, brandName, stock, specs, customFields } = body
    async function updateWith(dataExtra: any) {
      return prisma.product.update({
        where: { id: params.id },
        data: {
          ...(name != null && { name }),
          ...(description != null && { description }),
          ...(price != null && { price: new Prisma.Decimal(String(price)) }),
          ...(originalPrice !== undefined && { originalPrice: originalPrice != null ? new Prisma.Decimal(String(originalPrice)) : null }),
          ...(image != null && { image }),
          ...(images != null && { images }),
          ...(categoryName && { category: { connectOrCreate: { where: { slug: slugify(categoryName) }, create: { slug: slugify(categoryName), name: categoryName } } } }),
          ...(brandName && { brand: { connectOrCreate: { where: { slug: slugify(brandName) }, create: { slug: slugify(brandName), name: brandName } } } }),
          ...(stock != null && { inStock: Number(stock) > 0 }),
          ...dataExtra,
        },
      })
    }

    let updated
    try {
      updated = await updateWith({
        ...(specs !== undefined && { specs }),
        ...(customFields !== undefined && { customFields }),
      })
    } catch (e: any) {
      console.warn('Update with specs/customFields failed, retrying without extra fields:', e?.code || e?.message)
      updated = await updateWith({})
    }

    if (stock != null) {
      // adjust stock to target level by creating a movement of the delta
      const agg = await prisma.inventoryMovement.aggregate({ _sum: { quantity: true }, where: { productId: updated.id } })
      const current = Number(agg._sum.quantity || 0)
      const delta = Number(stock) - current
      if (delta !== 0) {
        await prisma.inventoryMovement.create({ data: { productId: updated.id, quantity: delta, type: 'adjust', note: 'Admin update' } })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'invalid payload' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrisma()
  // delete child movements and order items referencing product first
  await prisma.orderItem.deleteMany({ where: { productId: params.id } }).catch(() => {})
  await prisma.inventoryMovement.deleteMany({ where: { productId: params.id } }).catch(() => {})
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
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
