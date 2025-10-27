'use client'

import { useCart } from '@/context/CartContext'
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Seu carrinho está vazio</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Adicione produtos ao carrinho para continuar</p>
        <Link
          href="/products"
          className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition btn-animate"
        >
          Continuar Comprando
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">{item.name}</h3>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FiMinus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <span className="px-4 py-2 font-semibold dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FiPlus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>R$ {getTotalPrice().toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Frete</span>
                <span className="text-green-600 dark:text-green-400">Grátis</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span className="dark:text-white">Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition mb-4"
            >
              Finalizar Compra
            </button>
            
            <Link
              href="/products"
              className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

