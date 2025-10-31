const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-07'

function getStorefrontConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || ''
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || ''
  if (!domain || !token) throw new Error('Shopify Storefront credentials missing')
  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`
  return { endpoint, token }
}

export async function sf<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const { endpoint, token } = getStorefrontConfig()
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    // Avoid Next caching for dynamic product updates
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || json))
  }
  return json.data as T
}

export async function getShopifyProducts(first = 12) {
  const query = `#graphql
    query Products($first: Int!) {
      products(first: $first) {
        edges { node { id title handle featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } } } }
      }
    }
  `
  const data = await sf<{ products: { edges: Array<{ node: any }> } }>(query, { first })
  return data.products.edges.map(e => e.node)
}

export async function getShopifyProductByHandle(handle: string) {
  const query = `#graphql
    query Product($handle: String!) {
      product(handle: $handle) {
        id title handle description featuredImage { url altText }
        images(first: 8) { nodes { url altText } }
        variants(first: 10) { nodes { id title price { amount currencyCode } } }
      }
    }
  `
  const data = await sf<{ product: any }>(query, { handle })
  return data.product
}

export async function createShopifyCart(lines: Array<{ merchandiseId: string; quantity: number }>) {
  const mutation = `#graphql
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `
  const data = await sf<{ cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: any[] } }>(mutation, { lines })
  if (data.cartCreate.userErrors?.length) {
    throw new Error(JSON.stringify(data.cartCreate.userErrors))
  }
  return data.cartCreate.cart
}

