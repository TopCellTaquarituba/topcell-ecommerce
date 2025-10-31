import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getPrisma } from '@/lib/prisma'

function slugify(input?: string) {
  return (input || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function GET() {
  try {
    const prisma = await getPrisma()
    const items = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    const data = items.map((c: any) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description || '', image: c.image || '' }))
    return NextResponse.json({ ok: true, items: data })
  } catch (e: any) {
    console.error('GET /api/categories error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await req.json().catch(() => ({})) as any
    const name = String(body?.name || '').trim()
    if (!name) return NextResponse.json({ ok: false, error: 'Nome � obrigat�rio' }, { status: 400 })
    const providedSlug = String(body?.slug || '').trim()
    const slug = slugify(providedSlug || name)
    const description = body?.description ? String(body.description) : undefined
    const image = body?.image ? String(body.image) : undefined

    const created = await prisma.category.upsert({
      where: { slug },
      update: { name, ...(description !== undefined && { description }), ...(image !== undefined && { image }) },
      create: { name, slug, ...(description !== undefined && { description }), ...(image !== undefined && { image }) },
    })

    return NextResponse.json({ ok: true, item: { id: created.id, slug: created.slug, name: created.name, description: created.description || '', image: created.image || '' } })
  } catch (e: any) {
    console.error('POST /api/categories error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
