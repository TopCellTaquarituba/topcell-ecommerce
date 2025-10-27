'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById, Review } from '@/lib/products'
import { useCart } from '@/context/CartContext'
import { FiShoppingCart, FiMinus, FiPlus, FiStar } from 'react-icons/fi'
import Link from 'next/link'
import Reviews from '@/components/Reviews'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])

  const product = getProductById(params.id as string)

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

  // Initialize reviews from product data
  useEffect(() => {
    if (product.reviews) {
      setReviews(product.reviews)
    }
  }, [product.reviews])

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
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        {' / '}
        <Link href="/products" className="hover:text-primary-600">Produtos</Link>
        {' / '}
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square w-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === index ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">{product.name}</h1>
            
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                ({averageRating.toFixed(1)}) • {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full font-semibold">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">{product.description}</p>

          {/* Quantity Selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2 dark:text-white">Quantidade</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FiMinus className="w-5 h-5" />
                </button>
                <span className="px-6 py-3 font-semibold dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.inStock ? '✓ Em estoque' : '× Fora de estoque'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center space-x-2"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span>Adicionar ao Carrinho</span>
            </button>
            <button className="flex-1 border-2 border-primary-600 text-primary-600 dark:text-primary-400 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition">
              Comprar Agora
            </button>
          </div>

          {/* Specifications */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Especificações</h3>
            <div className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="text-gray-600 dark:text-gray-400">{key}</span>
                  <span className="font-semibold dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <Reviews
        productId={product.id}
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={reviews.length}
        onAddReview={handleAddReview}
      />
    </div>
  )
}
