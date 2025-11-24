import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

import { Prisma } from '@prisma/client'
import { blingFetch, mapBlingProductToLocal, fetchBlingProductDetail, fetchBlingProductImages, fetchBlingProductImage } from '@/lib/bling'
import { getPrisma } from '@/lib/prisma'

const encoder = new TextEncoder()

function sendEvent(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: any) {
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
}

function sendComment(controller: ReadableStreamDefaultController<Uint8Array>, comment: string) {
  controller.enqueue(encoder.encode(`: ${comment}\n\n`))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1) || 1
  const limit = Number(searchParams.get('limit') || 100) || 100

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const prisma = await getPrisma()

      const log = (message: string) => sendEvent(controller, 'log', { message })
      const progress = (current: number, total: number) => sendEvent(controller, 'progress', { current, total })

      const keepAlive = setInterval(() => sendComment(controller, 'ping'), 15000)
      const abort = () => {
        clearInterval(keepAlive)
        controller.close()
      }

      req.signal.addEventListener('abort', abort)

      try {
        log('Iniciando importação do Bling...')
        const url = `/produtos?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`
        const res = await blingFetch(url, { method: 'GET' })
        if (!res.ok) {
          const t = await res.text()
          sendEvent(controller, 'error', { error: 'Falha ao buscar produtos no Bling', details: t })
          abort()
          return
        }
        const json: any = await res.json()
        const items = Array.isArray(json?.data) ? json.data : (json?.data ? [json.data] : [])
        const total = items.length
        if (!total) {
          log('Nenhum produto encontrado para importar.')
          sendEvent(controller, 'done', { imported: 0 })
          abort()
          return
        }

        log(`Produtos recebidos: ${total}`)

        const slugify = (input?: string) => {
          if (typeof input !== 'string' || !input.trim()) return undefined
          return input
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }

        let imported = 0
        for (let idx = 0; idx < items.length; idx++) {
          const p = items[idx]
          let mapped = mapBlingProductToLocal(p)
          if (!mapped.externalId) {
            progress(idx + 1, total)
            continue
          }

          const needDetail = !mapped.description || mapped.stockQty == null || !mapped.image || !mapped.brandName || !mapped.weightGrams || !mapped.lengthCm || !mapped.heightCm || !mapped.widthCm
          if (needDetail) {
            const det = await fetchBlingProductDetail(mapped.externalId)
            if (det) {
              const detMapped = mapBlingProductToLocal(det)
              mapped = {
                ...mapped,
                description: mapped.description || detMapped.description,
                stockQty: mapped.stockQty ?? detMapped.stockQty,
                inStock: mapped.inStock ?? detMapped.inStock,
                image: mapped.image || detMapped.image,
                images: (mapped.images && mapped.images.length ? mapped.images : detMapped.images) || [],
                brandName: mapped.brandName || detMapped.brandName,
                categoryName: mapped.categoryName || detMapped.categoryName,
                weightGrams: mapped.weightGrams ?? detMapped.weightGrams,
                lengthCm: mapped.lengthCm ?? detMapped.lengthCm,
                heightCm: mapped.heightCm ?? detMapped.heightCm,
                widthCm: mapped.widthCm ?? detMapped.widthCm,
              }
            }
          }

          if (!mapped.image) {
            const list = await fetchBlingProductImages(mapped.externalId)
            if (list.length) {
              mapped.image = list[0]
              mapped.images = list
            } else {
              const fetched = await fetchBlingProductImage(mapped.externalId)
              if (fetched) {
                mapped.image = fetched
                mapped.images = [fetched]
              }
            }
          }

          const catSlug = slugify(mapped.categoryName)
          const brandSlug = slugify(mapped.brandName)

          const categoryData =
            catSlug && (mapped.categoryName || catSlug)
              ? {
                  category: {
                    connectOrCreate: {
                      where: { slug: catSlug },
                      create: { slug: catSlug, name: mapped.categoryName || catSlug },
                    },
                  },
                }
              : {}
          const brandData =
            brandSlug && mapped.brandName
              ? {
                  brand: {
                    connectOrCreate: {
                      where: { slug: brandSlug },
                      create: { slug: brandSlug, name: mapped.brandName },
                    },
                  },
                }
              : {}

          const product = await prisma.product.upsert({
            where: { externalId: mapped.externalId },
            update: {
              name: mapped.name,
              description: mapped.description || '',
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
              description: mapped.description || '',
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
          })

          if (mapped.stockQty != null) {
            const agg = await prisma.inventoryMovement.aggregate({ _sum: { quantity: true }, where: { productId: product.id } })
            const current = Number(agg._sum.quantity || 0)
            const target = Number(mapped.stockQty)
            const delta = target - current
            if (delta !== 0) {
              await prisma.inventoryMovement.create({ data: { productId: product.id, quantity: delta, type: 'adjust', note: 'Bling sync' } })
            }
          }

          imported += 1
          progress(idx + 1, total)
          log(`Importado: ${mapped.name || mapped.externalId}`)
        }

        sendEvent(controller, 'done', { imported })
        abort()
      } catch (e: any) {
        sendEvent(controller, 'error', { error: e?.message || 'Erro durante importação' })
        abort()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
