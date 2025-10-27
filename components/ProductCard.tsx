'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { FiShoppingCart } from 'react-icons/fi'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden card-hover transition-all duration-300 group animate-fade-in product-card">
      <Link href={`/products/${product.id}`} className="card-content">
        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{product.category}</span>
          <h3 className="text-lg font-semibold mt-1 mb-2 line-clamp-2 dark:text-white">{product.name}</h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        className="w-full bg-primary-600 text-white py-3 hover:bg-primary-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2 btn-animate card-footer"
      >
        <FiShoppingCart className="w-5 h-5" />
        <span>Adicionar ao Carrinho</span>
      </button>
    </div>
  )
}

