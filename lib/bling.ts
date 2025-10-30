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
  form.set('client_id', cfg.clientId)
  form.set('client_secret', cfg.clientSecret)
  form.set('redirect_uri', cfg.redirectUri)

  const res = await fetch(cfg.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString() })
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
export function mapBlingProductToLocal(p: any) {
  return {
    externalId: String(p?.id || p?.data?.id || ''),
    name: p?.nome || p?.data?.nome || 'Produto',
    description: p?.descricao || p?.data?.descricao || '',
    price: Number(p?.preco || p?.data?.preco || p?.data?.precoVenda || 0),
    image: p?.imagem || p?.data?.imagem || '',
    images: ([] as string[]),
    weightGrams: p?.pesoBruto ? Math.round(Number(p.pesoBruto) * 1000) : undefined,
    lengthCm: p?.comprimento ? Math.round(Number(p.comprimento)) : undefined,
    heightCm: p?.altura ? Math.round(Number(p.altura)) : undefined,
    widthCm: p?.largura ? Math.round(Number(p.largura)) : undefined,
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

