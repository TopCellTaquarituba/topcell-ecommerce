import { NextResponse } from 'next/server'
import Bling from 'bling-erp-api'
import { getPrisma } from '@/lib/prisma'

/**
 * Sincroniza produtos do Bling com o banco de dados local.
 * Pensada para ser chamada por um cron job.
 */
export async function GET() {
  const prisma = await getPrisma()

  const blingApiKey = process.env.BLING_API_KEY
  if (!blingApiKey) {
    console.error('BLING_API_KEY não configurada')
    return NextResponse.json({ error: 'Configuração do Bling ausente no servidor.' }, { status: 500 })
  }

  const bling: any = new (Bling as any)(blingApiKey)
  const produtosApi: any = bling.produtos
  const limit = 100
  let page = 1
  const allProducts: any[] = []

  const fetchPage = async (pageNum: number) => {
    if (produtosApi?.getAll) return produtosApi.getAll({ page: pageNum, limit, filters: 'situacao[A]' })
    if (produtosApi?.get) return produtosApi.get({ page: pageNum, limit, filters: 'situacao[A]' })
    if (bling?.get) return bling.get('/produtos', { params: { page: pageNum, limit, filters: 'situacao[A]' } })
    throw new Error('Método de produtos não disponível no cliente do Bling')
  }

  try {
    while (true) {
      console.log(`Buscando produtos do Bling, página ${page}...`)
      const response = await fetchPage(page)
      const data = response?.data || []
      if (!Array.isArray(data) || data.length === 0) break
      allProducts.push(...data)
      page++
    }

    console.log(`Total de ${allProducts.length} produtos encontrados no Bling. Iniciando sincronização...`)

    for (const blingProduct of allProducts) {
      const produto = blingProduct?.produto || blingProduct
      if (!produto) continue

      const images = Array.isArray(produto.imagem)
        ? produto.imagem.map((img: any) => img?.link).filter(Boolean)
        : []
      if (produto.imagem?.link && !images.includes(produto.imagem.link)) {
        images.unshift(produto.imagem.link)
      }

      const productData = {
        name: produto.descricao,
        sku: produto.codigo,
        price: parseFloat(produto.preco ?? 0),
        stock: produto.estoqueAtual ? Math.floor(produto.estoqueAtual) : 0,
        description: produto.descricaoCurta || produto.descricao || '',
        image: images[0] || 'https://via.placeholder.com/500',
        images,
        brand: produto.marca,
        category: produto.categoria?.descricao,
        weight: parseFloat(produto.pesoBruto || 0),
        height: parseFloat(produto.alturaProduto || 0),
        width: parseFloat(produto.larguraProduto || 0),
        length: parseFloat(produto.profundidadeProduto || 0),
      }

      await prisma.product.upsert({
        where: { sku: produto.codigo },
        update: productData,
        create: productData,
      })
    }

    console.log(`Sincronização concluída com sucesso. ${allProducts.length} produtos processados.`)
    return NextResponse.json({ ok: true, message: `Sincronização concluída. ${allProducts.length} produtos processados.` })
  } catch (error: any) {
    console.error('Erro durante a sincronização com o Bling:', error)
    return NextResponse.json({ error: `Falha na sincronização: ${error?.message || 'erro'}` }, { status: 500 })
  }
}
