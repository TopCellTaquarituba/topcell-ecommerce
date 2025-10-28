// Helpers to map Bling ERP API v3 payloads to Prisma models
// These are conservative mappings to common fields; adjust to your account’s shapes.

function slugify(input?: string | null) {
  return (input || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function toMoney(v: any): string {
  if (v == null) return '0'
  if (typeof v === 'number') return v.toFixed(2)
  const s = String(v).replace(',', '.')
  const n = Number(s)
  return isNaN(n) ? '0' : n.toFixed(2)
}

export async function upsertProductFromBling(prisma: any, raw: any) {
  const externalId = raw?.id || raw?.codigo || raw?.code || raw?.uuid
  if (!externalId) {
    // Create-only with a generated externalRef for traceability
    const name = raw?.name || raw?.nome || raw?.descricao || 'Produto sem nome'
    const description = raw?.description || raw?.descricao || ''
    const image = raw?.image || raw?.imagens?.[0]?.link || raw?.fotos?.[0]?.link || ''
    const price = toMoney(raw?.price || raw?.preco || raw?.valor)
    const rating = Number(raw?.rating || 0)
    const categoryName = raw?.category || raw?.categoria?.descricao
    const brandName = raw?.brand || raw?.marca
    const images = Array.isArray(raw?.imagens) ? raw.imagens.map((i: any) => i?.link).filter(Boolean) : []
    const created = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice: null,
        image,
        images,
        rating: isNaN(rating) ? 0 : rating,
        inStock: raw?.estoque != null ? Number(raw.estoque) > 0 : true,
        category: categoryName
          ? { connectOrCreate: { where: { slug: slugify(categoryName) }, create: { slug: slugify(categoryName), name: categoryName } } }
          : undefined,
        brand: brandName
          ? { connectOrCreate: { where: { slug: slugify(brandName) }, create: { slug: slugify(brandName), name: brandName } } }
          : undefined,
      },
    })
    return { action: 'created', id: created.id }
  }

  const name = raw?.name || raw?.nome || raw?.descricao || 'Produto'
  const description = raw?.description || raw?.descricao || ''
  const image = raw?.image || raw?.imagens?.[0]?.link || raw?.fotos?.[0]?.link || ''
  const price = toMoney(raw?.price || raw?.preco || raw?.valor)
  const originalPrice = raw?.originalPrice || raw?.precoDe ? toMoney(raw?.originalPrice || raw?.precoDe) : undefined
  const rating = Number(raw?.rating || 0)
  const categoryName = raw?.category || raw?.categoria?.descricao
  const brandName = raw?.brand || raw?.marca
  const images = Array.isArray(raw?.imagens)
    ? raw.imagens.map((i: any) => i?.link).filter(Boolean)
    : Array.isArray(raw?.fotos)
    ? raw.fotos.map((i: any) => i?.link).filter(Boolean)
    : []

  const updated = await prisma.product.upsert({
    where: { externalId },
    create: {
      externalId,
      name,
      description,
      price,
      originalPrice: originalPrice ?? null,
      image,
      images,
      rating: isNaN(rating) ? 0 : rating,
      inStock: raw?.estoque != null ? Number(raw.estoque) > 0 : true,
      category: categoryName
        ? { connectOrCreate: { where: { slug: slugify(categoryName) }, create: { slug: slugify(categoryName), name: categoryName } } }
        : undefined,
      brand: brandName
        ? { connectOrCreate: { where: { slug: slugify(brandName) }, create: { slug: slugify(brandName), name: brandName } } }
        : undefined,
    },
    update: {
      name,
      description,
      price,
      originalPrice: originalPrice ?? undefined,
      image,
      images,
      inStock: raw?.estoque != null ? Number(raw.estoque) > 0 : undefined,
      rating: isNaN(rating) ? undefined : rating,
      category: categoryName
        ? { connectOrCreate: { where: { slug: slugify(categoryName) }, create: { slug: slugify(categoryName), name: categoryName } } }
        : undefined,
      brand: brandName
        ? { connectOrCreate: { where: { slug: slugify(brandName) }, create: { slug: slugify(brandName), name: brandName } } }
        : undefined,
    },
  })
  return { action: 'upserted', id: updated.id }
}

export async function upsertCustomerFromBling(prisma: any, raw: any) {
  const externalId = raw?.id || raw?.codigo || raw?.uuid
  const name = raw?.name || raw?.nome || 'Cliente'
  const email = raw?.email || raw?.emails?.[0]
  const phone = raw?.phone || raw?.telefone
  if (!externalId) {
    const created = await prisma.customer.create({ data: { name, email, phone } })
    return { action: 'created', id: created.id }
  }
  const updated = await prisma.customer.upsert({
    where: { externalId },
    create: { externalId, name, email, phone },
    update: { name, email, phone },
  })
  return { action: 'upserted', id: updated.id }
}

export async function upsertOrderFromBling(prisma: any, raw: any) {
  const externalId = raw?.id || raw?.numero || raw?.uuid
  const number = raw?.numero || raw?.number
  const status = raw?.situacao || raw?.status || 'pending'
  const total = toMoney(raw?.total || raw?.valor || raw?.totalvenda)
  const customerRaw = raw?.cliente || raw?.customer

  // Upsert customer first (if available)
  let customerId: string | undefined
  if (customerRaw) {
    const c = await upsertCustomerFromBling(prisma, customerRaw)
    customerId = c?.id
  }

  const order = await prisma.order.upsert({
    where: { externalId },
    create: { externalId, number, status, total, customerId },
    update: { number, status, total, customerId },
  })

  // Items
  const items: any[] = raw?.itens || raw?.items || []
  if (Array.isArray(items)) {
    for (const it of items) {
      const prodRaw = it?.produto || it?.product || it
      const qty = Number(it?.quantidade || it?.qty || it?.quantity || 1)
      const price = toMoney(it?.valor || it?.price || it?.vlr_unit)

      // Upsert product by external reference
      const prodRes = await upsertProductFromBling(prisma, prodRaw)
      const productId = prodRes.id

      // Create or update an item uniquely by orderId+productId (no unique in schema, so simple create)
      await prisma.orderItem.create({ data: { orderId: order.id, productId, quantity: isNaN(qty) ? 1 : qty, price } })
    }
  }

  return { action: 'upserted', id: order.id }
}

export async function recordSyncLog(prisma: any, entry: { source: string; entity: string; action: string; externalId?: string | null; details?: any }) {
  await prisma.syncLog.create({ data: { source: entry.source, entity: entry.entity, action: entry.action, externalId: entry.externalId ?? null, details: entry.details ?? null } })
}

