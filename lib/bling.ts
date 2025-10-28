// Minimal Bling ERP API client wrapper (v3) using Bearer token
// See: https://ajuda.bling.com.br/hc/pt-br/categories/980000275309-BLING-API

const BLING_API_BASE = process.env.BLING_API_BASE || 'https://bling.com.br/Api/v3';

function authHeaders() {
  const token = process.env.BLING_API_TOKEN;
  if (!token) throw new Error('BLING_API_TOKEN is not configured');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  } as const;
}

export async function blingGet(path: string, searchParams?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, BLING_API_BASE);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Bling GET ${url.pathname} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export async function blingPost(path: string, body: unknown) {
  const url = new URL(path, BLING_API_BASE);
  const res = await fetch(url.toString(), { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Bling POST ${url.pathname} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

// High-level helpers (shape may be adapted to your account)
export async function fetchBlingProducts(params?: { page?: number; limit?: number }) {
  return blingGet('/products', { page: params?.page ?? 1, limit: params?.limit ?? 100 });
}

export async function fetchBlingOrders(params?: { page?: number; limit?: number; updatedFrom?: string }) {
  return blingGet('/orders', { page: params?.page ?? 1, limit: params?.limit ?? 100, updatedFrom: params?.updatedFrom });
}

export async function updateBlingStock(productExternalId: string, quantity: number) {
  return blingPost(`/products/${productExternalId}/stock`, { quantity });
}

