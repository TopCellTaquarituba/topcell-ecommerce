import { getPrisma } from '@/lib/prisma'

type BlingConfig = {
  baseUrl: string
  authUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

export function getBlingConfig(): BlingConfig {
  const baseUrl = process.env.BLING_BASE_URL || 'https://api.bling.com.br/Api/v3'
  const authUrl = process.env.BLING_AUTH_URL || 'https://www.bling.com.br/Api/v3/oauth/authorize'
  const tokenUrl = process.env.BLING_TOKEN_URL || 'https://www.bling.com.br/Api/v3/oauth/token'
  const clientId = process.env.BLING_CLIENT_ID || ''
  const clientSecret = process.env.BLING_CLIENT_SECRET || ''
  const redirectUri = process.env.BLING_REDIRECT_URI || ''
  if (!clientId || !clientSecret || !redirectUri) {
    // These are needed for OAuth flows; fetch calls will fail gracefully if not set
  }
  return { baseUrl, authUrl, tokenUrl, clientId, clientSecret, redirectUri }
}

export async function getStoredToken() {
  const prisma = await getPrisma()
  const row = await prisma.integrationToken.findUnique({ where: { provider: 'bling' } })
  return row || null
}

export async function saveToken(data: { accessToken: string; refreshToken?: string | null; expiresIn?: number; scope?: string }) {
  const prisma = await getPrisma()
  const now = Date.now()
  const expiresAt = data.expiresIn ? new Date(now + data.expiresIn * 1000) : null
  const row = await prisma.integrationToken.upsert({
    where: { provider: 'bling' },
    update: { accessToken: data.accessToken, refreshToken: data.refreshToken || null, expiresAt, scope: data.scope },
    create: { provider: 'bling', accessToken: data.accessToken, refreshToken: data.refreshToken || null, expiresAt, scope: data.scope },
  })
  return row
}

export async function refreshTokenIfNeeded(): Promise<string | null> {
  const cfg = getBlingConfig()
  const row = await getStoredToken()
  if (!row) return null
  const now = new Date()
  const isExpired = row.expiresAt ? row.expiresAt.getTime() - now.getTime() < 60_000 : false
  if (!isExpired) return row.accessToken
  if (!row.refreshToken) return row.accessToken

  const form = new URLSearchParams()
  form.set('grant_type', 'refresh_token')
  form.set('refresh_token', row.refreshToken)
  // Some providers require redirect_uri also on refresh; harmless if ignored
  form.set('redirect_uri', cfg.redirectUri)

  const basic = (() => {
    try { if (typeof Buffer !== 'undefined') { return 'Basic ' + Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64') } } catch {}
    try { if (typeof btoa !== 'undefined') { return 'Basic ' + btoa(`${cfg.clientId}:${cfg.clientSecret}`) } } catch {}
    return ''
  })()

  const ac = new AbortController()
  const to = setTimeout(() => ac.abort(), 15000)
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      ...(basic ? { 'Authorization': basic } : {}),
    },
    body: form.toString(),
    signal: ac.signal,
  }).finally(() => clearTimeout(to))
  if (!res.ok) throw new Error(`Falha ao renovar token: ${res.status}`)
  const json = await res.json() as any
  await saveToken({ accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in, scope: json.scope })
  return json.access_token as string
}

export async function blingFetch(path: string, init?: RequestInit & { retry?: boolean }) {
  const cfg = getBlingConfig()
  const token = (await refreshTokenIfNeeded()) || (await getStoredToken())?.accessToken
  if (!token) throw new Error('Bling não conectado. Conecte em /admin/integrations/bling')
  const url = path.startsWith('http') ? path : `${cfg.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (res.status === 401 && !init?.retry) {
    await refreshTokenIfNeeded()
    return blingFetch(path, { ...init, retry: true })
  }
  return res
}

// Minimal mappers (best-effort, adjust to exact Bling payloads)
function pickImageUrl(obj: any): string | undefined {
  const tryVal = (val: any): string | undefined => {
    if (!val) return undefined
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      if (typeof val.url === 'string') return val.url
      if (typeof val.link === 'string') return val.link
      if (typeof (val as any).href === 'string') return (val as any).href
      if (Array.isArray(val)) {
        for (const it of val) {
          const u = tryVal(it)
          if (u) return u
        }
      }
    }
    return undefined
  }
  // Explicit support for Bling V3: data.midia.imagens.externas | internas | imagensURL
  const midia = obj?.midia || obj?.data?.midia
  const midiaImgs = midia?.imagens
  if (midiaImgs) {
    const fromExternas = tryVal(midiaImgs.externas)
    if (fromExternas) return fromExternas
    const fromInternas = tryVal(midiaImgs.internas)
    if (fromInternas) return fromInternas
    const fromUrls = tryVal(midiaImgs.imagensURL)
    if (fromUrls) return fromUrls
  }
  return (
    tryVal(obj?.imagem) ||
    tryVal(obj?.data?.imagem) ||
    tryVal(obj?.urlImagem) || tryVal(obj?.data?.urlImagem) ||
    tryVal(obj?.url_imagem) || tryVal(obj?.data?.url_imagem) ||
    tryVal(obj?.imagem_url) || tryVal(obj?.data?.imagem_url) ||
    tryVal(obj?.imagens) ||
    tryVal(obj?.data?.imagens) ||
    tryVal(obj?.imagensExternas) ||
    tryVal(obj?.data?.imagensExternas) ||
    tryVal(obj?.midias) ||
    tryVal(obj?.data?.midias) ||
    tryVal(obj?.arquivos) ||
    tryVal(obj?.data?.arquivos)
  )
}

export function mapBlingProductToLocal(p: any) {
  const src = p?.data || p || {}
  const image = pickImageUrl(p) || ''
  const descricaoCurta = src?.descricaoCurta || src?.descricao || ''
  const descricaoComplementar = src?.descricaoComplementar || ''
  const htmlToText = (s: string) => {
    if (!s) return ''
    let t = String(s)
    t = t.replace(/<\s*br\s*\/?\s*>/gi, '\n')
    t = t.replace(/<\s*\/?p[^>]*>/gi, '\n')
    t = t.replace(/<[^>]+>/g, '')
    return t.trim()
  }
  const description = htmlToText([descricaoCurta, descricaoComplementar].filter(Boolean).join('\n\n'))
  const saldo = Number(src?.estoque?.saldoVirtualTotal ?? src?.estoque?.saldo ?? 0)
  return {
    externalId: String(src?.id || ''),
    name: src?.nome || 'Produto',
    description,
    price: Number(src?.preco || src?.precoVenda || 0),
    image,
    images: image ? [image] : ([] as string[]),
    inStock: saldo > 0,
    stockQty: saldo,
    weightGrams: src?.pesoBruto ? Math.round(Number(src.pesoBruto) * 1000) : undefined,
    lengthCm: src?.comprimento ? Math.round(Number(src.comprimento)) : undefined,
    heightCm: src?.altura ? Math.round(Number(src.altura)) : undefined,
    widthCm: src?.largura ? Math.round(Number(src.largura)) : undefined,
  }
}

export async function fetchBlingProductImage(id: string): Promise<string | null> {
  try {
    const res = await blingFetch(`/produtos/${encodeURIComponent(id)}`, { method: 'GET' })
    if (!res.ok) return null
    const json: any = await res.json()
    const url = pickImageUrl(json?.data || json) || null
    return url || null
  } catch {
    return null
  }
}

export async function fetchBlingProductImages(id: string): Promise<string[]> {
  const urls = new Set<string>()
  const add = (u?: string) => { if (u && /^https?:\/\//i.test(u)) urls.add(u) }
  try {
    const res = await blingFetch(`/produtos/${encodeURIComponent(id)}`, { method: 'GET' })
    if (res.ok) {
      const json: any = await res.json()
      const data = json?.data || json
      const midia = data?.midia?.imagens
      if (midia) {
        if (Array.isArray(midia.externas)) {
          for (const e of midia.externas) add(e?.link || e?.url || e?.href)
        }
        if (Array.isArray(midia.imagensURL)) {
          for (const e of midia.imagensURL) add(typeof e === 'string' ? e : (e?.url || e?.link || e?.href))
        }
        if (Array.isArray(midia.internas)) {
          for (const e of midia.internas) add(e?.url || e?.link || e?.href)
        }
      }
      // generic fallbacks
      add(pickImageUrl(data))
    }
  } catch {}
  return Array.from(urls)
}

export async function fetchBlingProductDetail(id: string): Promise<any | null> {
  try {
    const res = await blingFetch(`/produtos/${encodeURIComponent(id)}`, { method: 'GET' })
    if (!res.ok) return null
    const json: any = await res.json()
    return json?.data || json || null
  } catch {
    return null
  }
}

export function buildBlingOrderPayload(order: any) {
  // Build a minimal order payload compatible with Bling V3 (adjust as needed)
  return {
    numero: order.number,
    cliente: {
      nome: order.shippingName || order.customer?.name || 'Cliente',
      email: order.shippingEmail || order.customer?.email || undefined,
      fone: order.shippingPhone || order.customer?.phone || undefined,
    },
    itens: (order.items || []).map((it: any) => ({
      quantidade: it.quantity,
      // Prefer Bling product id if available
      produto: {
        id: it.product?.externalId || undefined,
        nome: it.product?.name,
        preco: Number(it.price),
      },
    })),
    total: Number(order.total || 0),
  }
}
