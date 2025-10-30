import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { blingFetch, mapBlingProductToLocal } from '@/lib/bling'
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
    for (const p of items) {
      const mapped = mapBlingProductToLocal(p)
      if (!mapped.externalId) continue
      upserts.push(
        prisma.product.upsert({
          where: { externalId: mapped.externalId },
          update: {
            name: mapped.name,
            description: mapped.description,
            price: new Prisma.Decimal(String(mapped.price || 0)),
            image: mapped.image || '',
            images: mapped.images || [],
            ...(mapped.weightGrams != null ? { weightGrams: mapped.weightGrams } : {}),
            ...(mapped.lengthCm != null ? { lengthCm: mapped.lengthCm } : {}),
            ...(mapped.heightCm != null ? { heightCm: mapped.heightCm } : {}),
            ...(mapped.widthCm != null ? { widthCm: mapped.widthCm } : {}),
          },
          create: {
            externalId: mapped.externalId,
            name: mapped.name,
            description: mapped.description,
            price: new Prisma.Decimal(String(mapped.price || 0)),
            image: mapped.image || '',
            images: mapped.images || [],
            inStock: true,
            rating: 0,
            ...(mapped.weightGrams != null ? { weightGrams: mapped.weightGrams } : {}),
            ...(mapped.lengthCm != null ? { lengthCm: mapped.lengthCm } : {}),
            ...(mapped.heightCm != null ? { heightCm: mapped.heightCm } : {}),
            ...(mapped.widthCm != null ? { widthCm: mapped.widthCm } : {}),
          },
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

