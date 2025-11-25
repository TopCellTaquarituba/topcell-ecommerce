import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

// Interface para ajudar o TypeScript a entender a estrutura do produto do ML
interface MercadoLivreProduct {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  seller_sku: string | null;
  pictures: { url: string }[];
  attributes: { id: string; value_name: string }[];
  // Adicione outros campos que precisar
}

/**
 * Sincroniza produtos do Mercado Livre com o banco de dados local.
 */
export async function GET() {
  const prisma = getPrisma()

  const mercadoLivreToken = process.env.MERCADO_LIVRE_ACCESS_TOKEN
  const mercadoLivreUserId = process.env.MERCADO_LIVRE_USER_ID

  if (!mercadoLivreToken || !mercadoLivreUserId) {
    const message = 'Credenciais do Mercado Livre não configuradas em .env (MERCADO_LIVRE_ACCESS_TOKEN, MERCADO_LIVRE_USER_ID)'
    console.error(message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  try {
    // 1. Buscar os IDs de todos os produtos do usuário
    console.log('Buscando IDs de produtos no Mercado Livre...')
    const userProductsResponse = await fetch(`https://api.mercadolibre.com/users/${mercadoLivreUserId}/items/search`, {
      headers: {
        'Authorization': `Bearer ${mercadoLivreToken}`
      }
    })

    if (!userProductsResponse.ok) {
      throw new Error(`Erro ao buscar produtos do usuário: ${await userProductsResponse.text()}`)
    }

    const userProductsData = await userProductsResponse.json()
    const productIds: string[] = userProductsData.results || []

    if (productIds.length === 0) {
      return NextResponse.json({ ok: true, message: 'Nenhum produto encontrado no Mercado Livre.' })
    }

    // 2. Buscar os detalhes de cada produto (a API permite buscar em lotes de até 20)
    console.log(`Encontrados ${productIds.length} IDs. Buscando detalhes...`)
    const productsDetailsResponse = await fetch(`https://api.mercadolibre.com/items?ids=${productIds.join(',')}`, {
      headers: {
        'Authorization': `Bearer ${mercadoLivreToken}`
      }
    })

    if (!productsDetailsResponse.ok) {
      throw new Error(`Erro ao buscar detalhes dos produtos: ${await productsDetailsResponse.text()}`)
    }

    const productsDetails: { body: MercadoLivreProduct }[] = await productsDetailsResponse.json()

    // 3. Sincronizar com o banco de dados
    let processedCount = 0
    for (const item of productsDetails) {
      const mlProduct = item.body

      // O SKU é crucial. Se não houver, pulamos ou usamos o ID do ML como fallback.
      const sku = mlProduct.seller_sku || mlProduct.id
      if (!sku) continue;

      const images = mlProduct.pictures?.map(p => p.url) || []
      const brand = mlProduct.attributes?.find(attr => attr.id === 'BRAND')?.value_name

      const productData = {
        name: mlProduct.title,
        sku: sku,
        price: mlProduct.price,
        stock: mlProduct.available_quantity,
        description: mlProduct.title, // A descrição completa requer outra chamada de API
        image: images[0] || 'https://via.placeholder.com/500',
        images: images,
        brand: brand || 'Marca não informada',
        // Categoria e dimensões também podem ser extraídas se disponíveis
        category: 'Categoria Padrão',
        weight: 0,
        height: 0,
        width: 0,
        length: 0,
      }

      await prisma.product.upsert({
        where: { sku: productData.sku },
        update: productData,
        create: productData,
      })
      processedCount++
    }

    console.log(`Sincronização com Mercado Livre concluída. ${processedCount} produtos processados.`)
    return NextResponse.json({
      ok: true,
      message: `Sincronização concluída. ${processedCount} produtos processados.`,
    })

  } catch (error: any) {
    console.error('Erro durante a sincronização com o Mercado Livre:', error)
    return NextResponse.json({ error: `Falha na sincronização: ${error.message}` }, { status: 500 })
  }
}