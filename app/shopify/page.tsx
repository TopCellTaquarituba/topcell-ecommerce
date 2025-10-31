import Link from 'next/link'
import { getShopifyProducts } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

export default async function ShopifyIndexPage() {
  const products = await getShopifyProducts(12).catch(() => [])
  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Catálogo (Shopify - POC)</h1>
      {products.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">Configure SHOPIFY_STORE_DOMAIN e SHOPIFY_STOREFRONT_ACCESS_TOKEN.</div>
      ) : (
        <div className="products-grid">
          {products.map((p: any) => (
            <Link key={p.id} href={`/shopify/${p.handle}`} className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.featuredImage?.url && <img src={p.featuredImage.url} alt={p.featuredImage?.altText || p.title} className="w-full h-40 object-cover rounded" />}
              <div className="mt-3 font-semibold dark:text-white">{p.title}</div>
              <div className="text-primary-600">R$ {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2).replace('.', ',')}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

