'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById, Review } from '@/lib/products'
import { useCart } from '@/context/CartContext'
import { FiShoppingCart, FiMinus, FiPlus, FiStar, FiTruck, FiShield } from 'react-icons/fi'
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

  const product = getProductById(params.id as string)

  // Initialize reviews from product data (unconditional hook)
  useEffect(() => {
    if (product && product.reviews) {
      setReviews(product.reviews)
    }
  }, [product])

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Produto nÃ£o encontrado</h1>
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
        <Link href="/" className="hover:text-primary-600">InÃ­cio</Link>
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
              {product.images.map((img, index) => (
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
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{key}</div>
                  <div className="font-medium dark:text-white">{value}</div>
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
                    {/* Cartões */}
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
              {/* Shipping / returns */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiTruck className="w-5 h-5 text-primary-600" />
                  <span>Frete grátis para a sua região</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiShield className="w-5 h-5 text-primary-600" />
                  <span>Devolução grátis em até 30 dias</span>
                </div>
              </div>
              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 dark:text-white">Quantidade</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><FiMinus className="w-5 h-5" /></button>
                    <span className="px-5 py-2 font-semibold dark:text-white">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2"><FiPlus className="w-5 h-5" /></button>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{product.inStock ? 'Em estoque' : 'Fora de estoque'}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button onClick={handleAddToCart} className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2">
                  <FiShoppingCart className="w-5 h-5" /> Adicionar ao carrinho
                </button>
                <button className="w-full border-2 border-primary-600 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition">
                  Comprar agora
                </button>
              </div>
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
