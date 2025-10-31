import { getShopifyProductByHandle } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

export default async function ShopifyProductPage({ params }: { params: { handle: string } }) {
  const p = await getShopifyProductByHandle(params.handle).catch(() => null)
  if (!p) return <div className="container-custom py-10">Produto não encontrado.</div>
  const firstImg = p.images?.nodes?.[0]?.url || p.featuredImage?.url
  const price = Number(p.variants?.nodes?.[0]?.price?.amount || 0)
  return (
    <div className="container-custom py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {firstImg && <img src={firstImg} alt={p.title} className="w-full h-80 object-cover rounded" />}
      <div>
        <h1 className="text-3xl font-bold mb-3 dark:text-white">{p.title}</h1>
        <div className="text-primary-600 text-xl mb-6">R$ {price.toFixed(2).replace('.', ',')}</div>
        <form action="/api/shopify/cart" method="post" className="space-y-3" onSubmit={(e)=>{e.preventDefault(); fetch('/api/shopify/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({handle: p.handle})}).then(r=>r.json()).then(j=>{ if(j?.ok && j?.cart?.checkoutUrl) window.location.href=j.cart.checkoutUrl; else alert('Falha ao iniciar checkout Shopify') })}}>
          <button type="submit" className="px-6 py-3 bg-black text-white rounded">Comprar no Shopify</button>
        </form>
      </div>
    </div>
  )
}

