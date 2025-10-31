import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { blingFetch, mapBlingProductToLocal, fetchBlingProductImage, fetchBlingProductImages, fetchBlingProductDetail } from '@/lib/bling'
import { Prisma } from '@prisma/client'
import { getPrisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const { page = 1, limit = 100 } = await req.json().catch(() => ({}))
    const url = `/produtos?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`
    const res = await blingFetch(url, { method: 'GET' })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ ok: false, error: 'bling fetch failed', details: t }, { status: 400 })
    }
    const json: any = await res.json()
    const items = Array.isArray(json?.data) ? json.data : (json?.data ? [json.data] : [])

    const upserts = [] as Promise<any>[]
    const slugify = (input?: string) =>
      (input || '')
        .toString()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    for (const p of items) {
      const mapped = mapBlingProductToLocal(p)
      if (!mapped.externalId) continue
      // Ensure description and stock by fetching detail when needed or when list payload lacks fields
      const needDetail = !mapped.description || mapped.stockQty == null
      if (needDetail) {
        const det = await fetchBlingProductDetail(mapped.externalId)
        if (det) {
          const detMapped = mapBlingProductToLocal(det)
          if (!mapped.description && detMapped.description) mapped.description = detMapped.description
          if (mapped.stockQty == null && detMapped.stockQty != null) {
            mapped.stockQty = detMapped.stockQty
            mapped.inStock = Boolean(detMapped.stockQty > 0)
          }
          // Also try images from detail if still missing
          if (!mapped.image) {
            const fromDet = detMapped.image
            if (fromDet) {
              mapped.image = fromDet
              mapped.images = [fromDet]
            }
          }
        }
      }
      if (!mapped.image) {
        // Try multiple sources for images
        const list = await fetchBlingProductImages(mapped.externalId)
        if (list.length) {
          mapped.image = list[0]
          mapped.images = list
        } else {
          // last resort: single image from detail
          const fetched = await fetchBlingProductImage(mapped.externalId)
          if (fetched) {
            mapped.image = fetched
            mapped.images = [fetched]
          }
        }
      }
      const categoryData = mapped.categoryName
        ? {
            category: {
              connectOrCreate: {
                where: { slug: slugify(mapped.categoryName) },
                create: { slug: slugify(mapped.categoryName), name: mapped.categoryName },
              },
            },
          }
        : {}
      const brandData = mapped.brandName
        ? {
            brand: {
              connectOrCreate: {
                where: { slug: slugify(mapped.brandName) },
                create: { slug: slugify(mapped.brandName), name: mapped.brandName },
              },
            },
          }
        : {}

      upserts.push(
        prisma.product.upsert({
          where: { externalId: mapped.externalId },
          update: {
            name: mapped.name,
            description: mapped.description,
            price: new Prisma.Decimal(String(mapped.price || 0)),
            image: mapped.image || '',
            images: mapped.images || [],
            ...(mapped.inStock != null ? { inStock: Boolean(mapped.inStock) } : {}),
            ...(mapped.weightGrams != null ? { weightGrams: mapped.weightGrams } : {}),
            ...(mapped.lengthCm != null ? { lengthCm: mapped.lengthCm } : {}),
            ...(mapped.heightCm != null ? { heightCm: mapped.heightCm } : {}),
            ...(mapped.widthCm != null ? { widthCm: mapped.widthCm } : {}),
            ...categoryData,
            ...brandData,
          },
          create: {
            externalId: mapped.externalId,
            name: mapped.name,
            description: mapped.description,
            price: new Prisma.Decimal(String(mapped.price || 0)),
            image: mapped.image || '',
            images: mapped.images || [],
            inStock: Boolean(mapped.inStock ?? true),
            rating: 0,
            ...(mapped.weightGrams != null ? { weightGrams: mapped.weightGrams } : {}),
            ...(mapped.lengthCm != null ? { lengthCm: mapped.lengthCm } : {}),
            ...(mapped.heightCm != null ? { heightCm: mapped.heightCm } : {}),
            ...(mapped.widthCm != null ? { widthCm: mapped.widthCm } : {}),
            ...categoryData,
            ...brandData,
          },
        }).then(async (prod: { id: string }) => {
          if (mapped.stockQty != null) {
            const agg = await prisma.inventoryMovement.aggregate({ _sum: { quantity: true }, where: { productId: prod.id } })
            const current = Number(agg._sum.quantity || 0)
            const target = Number(mapped.stockQty)
            const delta = target - current
            if (delta !== 0) {
              await prisma.inventoryMovement.create({ data: { productId: prod.id, quantity: delta, type: 'adjust', note: 'Bling sync' } })
            }
          }
          return prod
        })
      )
    }

    const results = await Promise.all(upserts)
    return NextResponse.json({ ok: true, imported: results.length })
  } catch (e: any) {
    console.error('POST /api/bling/products/pull error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
