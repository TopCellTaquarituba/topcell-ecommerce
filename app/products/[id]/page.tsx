'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Review } from '@/lib/products'
import { useCart } from '@/context/CartContext'
import { FiShoppingCart, FiMinus, FiPlus, FiStar, FiTruck, FiShield, FiBell } from 'react-icons/fi'
import Link from 'next/link'
import Reviews from '@/components/Reviews'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showPayments, setShowPayments] = useState(false)
  const [zip, setZip] = useState('')
  const [shipping, setShipping] = useState<{ package?: any; quotes?: any[] } | null>(null)
  const [shippingError, setShippingError] = useState('')
  const [shippingLoading, setShippingLoading] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [notifyError, setNotifyError] = useState('')

  const [product, setProduct] = useState<any | null>(null)

  function sanitizeHtmlBasic(html: string) {
    try {
      let out = String(html || '')
      out = out.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\1\s*>/gi, '')
      out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '')
      out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '')
      out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '')
      out = out.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
      out = out.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")
      return out
    } catch { return String(html || '') }
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${params.id}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        const p = json.item
        const specsObj = Array.isArray(p?.specs)
          ? Object.fromEntries(
              (p.specs as any[])
                .filter((s: any) => s && typeof s.key === 'string')
                .map((s: any) => [String(s.key), s.value])
            )
          : (p?.specs && typeof p.specs === 'object' ? p.specs : {})
        const cfsObj = Array.isArray(p?.customFields)
          ? Object.fromEntries(
              (p.customFields as any[])
                .filter((s: any) => s && typeof s.key === 'string')
                .map((s: any) => [String(s.key), s.value])
            )
          : (p?.customFields && typeof p.customFields === 'object' ? p.customFields : {})
        const allSpecs = { ...specsObj, ...cfsObj }
        const stockNum = Number(p.stock || 0)
        setProduct({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
          image: p.image,
          images: p.images || [p.image].filter(Boolean),
          category: p.category || '',
          rating: p.rating || 0,
          description: p.description || '',
          inStock: stockNum > 0,
          stock: stockNum,
          specifications: allSpecs,
        })
      } else {
        setProduct(null)
      }
    }
    load()
  }, [params.id])

  // Initialize reviews from product data (unconditional hook)
  useEffect(() => {
    if (product && product.reviews) {
      setReviews(product.reviews)
    }
  }, [product])

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Produto não encontrado</h1>
        <Link href="/products" className="text-primary-600 hover:underline">
          Voltar para a lista de produtos
        </Link>
      </div>
    )
  }

  

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    router.push('/cart')
  }

  const handleBuyNow = () => {
    // Add selected quantity to cart and go straight to checkout
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image })
    }
    router.push('/checkout')
  }

  const handleNotify = async () => {
    if (!notifyEmail) return
    try {
      setNotifyStatus('sending')
      setNotifyError('')
      const res = await fetch('/api/notify-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product?.id, email: notifyEmail }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao enviar')
      setNotifyStatus('sent')
    } catch (e: any) {
      setNotifyStatus('error')
      setNotifyError(e?.message || 'Erro ao cadastrar notificação')
    }
  }

  const handleCalcShipping = async () => {
    if (!product) return
    const cep = String(zip || '').replace(/\D/g, '')
    if (cep.length !== 8) {
      setShipping(null)
      setShippingError('Informe um CEP válido (8 dígitos).')
      return
    }
    setShippingLoading(true)
    setShippingError('')
    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationZip: cep, items: [{ productId: product.id, quantity }], declaredValue: product.price * quantity }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha no cálculo de frete')
      setShipping({ package: data.package, quotes: data.quotes })
    } catch (e) {
      setShippingError(e instanceof Error ? e.message : 'Falha ao calcular frete')
      setShipping(null)
    } finally {
      setShippingLoading(false)
    }
  }

  const handleAddReview = (newReview: Omit<Review, 'id' | 'date' | 'helpful'>) => {
    const review: Review = {
      ...newReview,
      id: 'review-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    }
    setReviews(prev => [review, ...prev])
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Calculate average rating from reviews
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : product.rating

  return (
    <div className="container-custom py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        {' / '}
        <Link href="/products" className="hover:text-primary-600">Produtos</Link>
        {' / '}
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery (left) */}
        <div className="lg:col-span-7">
          <div className="flex gap-4">
            {/* Thumbs */}
            <div className="hidden md:flex md:flex-col gap-2 w-20">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square w-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border ${selectedImageIndex === index ? 'border-primary-600' : 'border-gray-200 dark:border-gray-600'}`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1">
              <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <img
                  src={product.images[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Title + rating (below image) */}
          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">{averageRating.toFixed(1)} • {reviews.length} avaliações</span>
            </div>
          </div>

          {/* Description & Characteristics */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-3 dark:text-white">Descrição</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>

            <h3 className="text-xl font-bold mt-8 mb-3 dark:text-white">Características</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{key}</div>
                  <div className="font-medium dark:text-white">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buy box (right) */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              {/* Category badge */}
              <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full mb-3">
                {product.category}
              </span>
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through">R$ {product.originalPrice.toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
                {product.originalPrice && (
                  <div className="text-green-600 dark:text-green-400 text-sm font-semibold">{discount}% OFF</div>
                )}
              </div>

              {!product.inStock && (
                <div className="mb-6 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200">
                  Indisponível no momento
                </div>
              )}
              {/* Installments + payment methods */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Em até 10x sem juros</div>
              <button
                type="button"
                onClick={() => setShowPayments((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 mb-4"
              >
                {showPayments ? 'Ocultar formas de pagamento' : 'Ver formas de pagamento'}
              </button>
              {showPayments && (
                <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40">
                  <div className="space-y-3 text-sm">
                    {/* Pix */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Pix (5% de desconto)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        R$ {(product.price * 0.95).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    {/* Boleto */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Boleto bancário (à vista)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    {/* CartÃƒÂµes */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Cartão de crédito</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          10x de R$ {(product.price / 10).toFixed(2).replace('.', ',')} sem juros
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Visa','Mastercard','Elo','Amex','Hipercard'].map((b) => (
                          <span key={b} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300">{b}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Shipping calc */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 dark:text-white">Calcular frete</label>
                <div className="flex gap-2">
                  <input value={zip} onChange={(e)=> setZip(e.target.value)} placeholder="CEP" inputMode="numeric" className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                  <button type="button" onClick={handleCalcShipping} disabled={shippingLoading || !zip} className="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-60">{shippingLoading ? 'Calculando...' : 'Calcular'}</button>
                </div>
                {!!shippingError && <div className="mt-2 text-xs text-red-600">{shippingError}</div>}
                {shipping?.quotes && (
                  <div className="mt-3 space-y-2 text-sm">
                    {shipping.quotes.map((q: any) => (
                      <div key={q.code} className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{q.name || (q.code === '04014' ? 'SEDEX' : q.code === '04510' ? 'PAC' : q.code)}</span>
                        {q.error && q.error !== '0' ? (
                          <span className="text-red-600 text-xs">{q.message || 'erro'}</span>
                        ) : (
                          <span className="font-semibold text-gray-900 dark:text-white">R$ {Number(q.price||0).toFixed(2).replace('.', ',')} • {q.deadlineDays} dias</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Shipping / returns */}
              {false && (<div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiTruck className="w-5 h-5 text-primary-600" />
                  <span>Frete grátis para a sua região</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiShield className="w-5 h-5 text-primary-600" />
                  <span>Devolução grátis em até 30 dias</span>
                </div>
              </div>)}
              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 dark:text-white">Quantidade</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button disabled={!product.inStock} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 disabled:opacity-50"><FiMinus className="w-5 h-5" /></button>
                    <span className="px-5 py-2 font-semibold dark:text-white">{quantity}</span>
                    <button disabled={!product.inStock} onClick={() => setQuantity(quantity + 1)} className="p-2 disabled:opacity-50"><FiPlus className="w-5 h-5" /></button>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{product.inStock ? 'Em estoque' : 'Fora de estoque'}</span>
                </div>
              </div>
              {/* Actions / Notify */}
              {product.inStock ? (
                <div className="flex flex-col gap-3">
                  <button onClick={handleAddToCart} className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2">
                    <FiShoppingCart className="w-5 h-5" /> Adicionar ao carrinho
                  </button>
                  <button onClick={handleBuyNow} className="w-full border-2 border-primary-600 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition">
                    Comprar agora
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Avise-me quando chegar</div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={notifyEmail}
                      onChange={(e)=> setNotifyEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <button type="button" onClick={handleNotify} disabled={notifyStatus==='sending' || !notifyEmail}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-60 flex items-center gap-2">
                      <FiBell className="w-5 h-5" /> {notifyStatus==='sending' ? 'Enviando...' : 'Avisar'}
                    </button>
                  </div>
                  {notifyStatus==='sent' && <div className="text-green-600 text-xs">Tudo certo! Vamos avisar quando repor.</div>}
                  {notifyStatus==='error' && <div className="text-red-600 text-xs">{notifyError || 'Falha ao enviar, tente novamente.'}</div>}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Reviews Section (full width) */}
      <div className="mt-10">
        <Reviews
          productId={product.id}
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={reviews.length}
          onAddReview={handleAddReview}
        />
      </div>
    </div>
  )
}
