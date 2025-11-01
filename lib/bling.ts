import { Order, Customer, OrderItem, Product, Prisma } from '@prisma/client'
import { getPrisma } from './prisma'

export function getBlingConfig() {
  const clientId = process.env.BLING_CLIENT_ID || ''
  const clientSecret = process.env.BLING_CLIENT_SECRET || ''
  const redirectUri = process.env.BLING_REDIRECT_URI || ''
  const authUrl = 'https://www.bling.com.br/oauth/authorize'
  const tokenUrl = 'https://www.bling.com.br/oauth/token'
  const apiUrl = 'https://bling.com.br/Api/v3'
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Bling credentials missing')
  }
  return { clientId, clientSecret, redirectUri, authUrl, tokenUrl, apiUrl }
}

export async function getStoredToken() {
  const prisma = await getPrisma()
  // Uses IntegrationToken with unique provider key
  return prisma.integrationToken.findUnique({ where: { provider: 'bling' } })
}

export async function saveToken(data: { accessToken: string; refreshToken: string; expiresIn: number; scope: string }) {
  const prisma = await getPrisma()
  const expiresAt = new Date(Date.now() + data.expiresIn * 1000)
  await prisma.integrationToken.upsert({
    where: { provider: 'bling' },
    create: { provider: 'bling', accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt, scope: data.scope },
    update: { accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt, scope: data.scope },
  })
}

async function refreshToken() {
  const token = await getStoredToken()
  if (!token) throw new Error('No stored Bling token to refresh')
  const cfg = getBlingConfig()
  const form = new URLSearchParams()
  form.set('grant_type', 'refresh_token')
  form.set('refresh_token', token.refreshToken)
  const auth = `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64')}`
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: auth },
    body: form.toString(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Bling refresh token failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  await saveToken({ accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in, scope: json.scope })
  return json.access_token as string
}

export async function blingFetch(path: string, opts: RequestInit = {}) {
  let token = await getStoredToken()
  if (!token) throw new Error('Bling not authenticated')
  if (token.expiresAt < new Date()) {
    token.accessToken = await refreshToken()
  }
  const cfg = getBlingConfig()
  const url = `${cfg.apiUrl}${path}`
  const headers = new Headers(opts.headers)
  headers.set('Authorization', `Bearer ${token.accessToken}`)
  headers.set('Accept', 'application/json')
  if (opts.method === 'POST' || opts.method === 'PUT') {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(url, { ...opts, headers })
}

export function mapBlingProductToLocal(p: any) {
  const price = p.preco
  const stock = p.estoque?.saldoFisicoTotal
  const dim = p.dimensoes
  const img = p.imagem?.url
  return {
    externalId: String(p.id),
    name: p.nome,
    sku: p.codigo,
    price,
    description: p.descricaoCurta,
    image: img,
    images: img ? [img] : [],
    inStock: stock != null ? stock > 0 : undefined,
    stockQty: stock,
    categoryName: p.categoria?.descricao,
    brandName: p.marca,
    weightGrams: p.pesoBruto ? p.pesoBruto * 1000 : undefined,
    lengthCm: dim?.comprimento,
    widthCm: dim?.largura,
    heightCm: dim?.altura,
  }
}

export async function fetchBlingProductDetail(id: string) {
  try {
    const res = await blingFetch(`/produtos/${id}`)
    if (!res.ok) return null
    const json: any = await res.json()
    return json?.data
  } catch {
    return null
  }
}

export async function fetchBlingProductImages(id: string): Promise<string[]> {
  try {
    const res = await blingFetch(`/produtos/${id}/imagens`)
    if (!res.ok) return []
    const json: any = await res.json()
    return Array.isArray(json?.data) ? json.data.map((i: any) => i.link) : []
  } catch {
    return []
  }
}

export async function fetchBlingProductImage(id: string): Promise<string | null> {
  try {
    const res = await blingFetch(`/produtos/${id}`)
    if (!res.ok) return null
    const json: any = await res.json()
    return json?.data?.imagem?.url || null
  } catch {
    return null
  }
}

// Tipagem para o pedido completo com suas relações
type FullOrder = Order & {
  customer: Customer | null
  items: (OrderItem & { product: Product })[]
}

/**
 * Formata e envia um pedido para a API do Bling.
 * @param order O objeto completo do pedido vindo do Prisma.
 */
export async function exportOrderToBling(order: FullOrder) {
  const BLING_API_KEY = process.env.BLING_API_KEY // Você precisará adicionar essa chave ao seu .env

  if (!BLING_API_KEY) {
    console.error('Chave da API do Bling não configurada. Pedido não será exportado.')
    return
  }

  // Formata o cliente
  const cliente = {
    nome: order.customer?.name || 'Cliente não identificado',
    tipoPessoa: 'F', // ou 'J' se for empresa
    email: order.customer?.email,
    fone: order.shippingPhone,
    endereco: order.shippingAddress,
    numero: order.shippingNumber,
    complemento: order.shippingComplement,
    bairro: order.shippingNeighborhood,
    cep: order.shippingZip,
    cidade: order.shippingCity,
    uf: order.shippingState,
  }

  // Formata os itens do pedido
  const itens = order.items.map(item => ({
    item: {
      codigo: item.product.externalId || item.product.id,
      descricao: item.product.name,
      un: 'un',
      qtde: item.quantity,
      vlr_unit: item.price,
    },
  }))

  // Monta o XML do pedido para a API v2 do Bling (a mais comum para pedidos)
  const xmlPedido = `
    <?xml version="1.0" encoding="UTF-8"?>
    <pedido>
      <cliente>${Object.entries(cliente).map(([key, value]) => `<${key}>${value || ''}</${key}>`).join('')}</cliente>
      <itens>${itens.map(i => `<item>${Object.entries(i.item).map(([key, value]) => `<${key}>${value}</${key}>`).join('')}</item>`).join('')}</itens>
      <vlr_total>${order.total instanceof Prisma.Decimal ? order.total.toNumber() : order.total}</vlr_total>
      <situacao>Em aberto</situacao>
    </pedido>
  `

  const url = `https://bling.com.br/Api/v2/pedido/json/`
  const formData = new URLSearchParams()
  formData.append('apikey', BLING_API_KEY)
  formData.append('xml', xmlPedido)

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.retorno?.erros) {
      console.error(`Erro ao exportar pedido #${order.number} para o Bling:`, result.retorno.erros)
    } else {
      console.log(`Pedido #${order.number} exportado para o Bling com sucesso.`)
    }
  } catch (error) {
    console.error(`Falha na requisição para exportar pedido #${order.number} para o Bling:`, error)
  }
}
