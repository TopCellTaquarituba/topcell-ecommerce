'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { useCart } from '@/context/CartContext'

type HighlightProduct = { id: string; name: string; price: number; image: string; category?: string; rating?: number }

const fallbackDeal: HighlightProduct = {
  id: 'fallback-deal',
  name: 'Galaxy A54 5G 128GB',
  price: 1150.99,
  image: 'https://images.unsplash.com/photo-1522143049013-2519756d1448?w=900&q=80&auto=format&fit=crop',
  category: 'Smartphone',
  rating: 4.8,
}

const fallbackSpotlight: HighlightProduct = {
  id: 'fallback-spotlight',
  name: 'Harman Cardon SL2300',
  price: 1399.9,
  image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=80&auto=format&fit=crop',
  category: 'Headphone',
  rating: 4.9,
}

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}

export default function HeroShowcase({ dealProduct, spotlightProduct }: { dealProduct?: HighlightProduct | null; spotlightProduct?: HighlightProduct | null }) {
  const { addToCart } = useCart()
  const deal = dealProduct ?? fallbackDeal
  const spotlight = spotlightProduct ?? fallbackSpotlight
  const dealImage = deal.image || fallbackDeal.image
  const spotlightImage = spotlight.image || fallbackSpotlight.image
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const diff = Math.max(0, end.getTime() - now.getTime())
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      })
    }
    updateClock()
    const id = setInterval(updateClock, 1000)
    return () => clearInterval(id)
  }, [])

  const handleAddToCart = () => {
    addToCart({
      id: deal.id,
      name: deal.name,
      price: deal.price,
      image: dealImage,
    })
  }

  const rating = Math.min(5, Math.max(0, deal.rating ?? 4.5))

  return (
    <section className="bg-gradient-to-b from-primary-50/70 via-white to-white border-b border-gray-100">
      <div className="container-custom py-12 space-y-4">
        <div className="flex flex-wrap gap-5 text-xs font-semibold text-primary-700">
          <span className="px-3 py-1 rounded-full bg-white shadow-sm border border-primary-100">Envio grátis em pedidos acima de R$ 340</span>
          <span className="px-3 py-1 rounded-full bg-primary-100/70 border border-primary-200 text-primary-800">Garantia de fábrica</span>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Pagamento seguro</span>
        </div>

        <div className="grid gap-9 lg:grid-cols-20 lg:gap-12">
          <div className="lg:col-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-7 shadow-2xl">
            <div className="absolute -left-12 -top-10 h-32 w-32 bg-white/25 rounded-full blur-3xl" aria-hidden />
            <div className="absolute -right-6 -bottom-16 h-44 w-44 bg-white/10 rounded-full blur-3xl" aria-hidden />
            <p className="uppercase text-sm tracking-[0.25em] font-semibold">Special</p>
            <h3 className="text-2xl font-bold leading-tight mt-2">Headphone Collection</h3>
            <p className="text-4xl font-black mt-6">Até 40% OFF</p>
            <p className="mt-6 text-sm text-cyan-50/90">Som premium com entrega rápida para todo o Brasil.</p>
            <Link
              href="/products?category=headphones"
              className="inline-block mt-6 bg-white text-cyan-700 font-semibold px-5 py-3 rounded-xl shadow-lg hover:-translate-y-0.5 transition btn-animate"
            >
              Comprar agora
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spotlightImage}
              alt={spotlight.name}
              className="absolute -bottom-6 -right-2 w-48 drop-shadow-2xl rotate-3"
            />
          </div>

          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary-600">Produto do dia</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{deal.name}</h3>
                <p className="text-sm text-gray-500">Oferta válida só hoje</p>
              </div>
              <div className="flex gap-2">
                {[
                  { label: 'Dias', value: timeLeft.days },
                  { label: 'Horas', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Seg', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-center min-w-[52px] shadow-sm">
                    <div className="text-xl font-extrabold tabular-nums">{item.value}</div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-50 via-transparent to-transparent" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dealImage} alt={deal.name} className="relative z-10 h-44 object-contain" />
              <button
                type="button"
                className="absolute top-3 right-3 rounded-full p-2 backdrop-blur bg-white/80 shadow text-gray-700 hover:text-red-500 transition"
                aria-label="Favoritar"
              >
                <FiHeart className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">A partir de</p>
                <div className="text-2xl font-bold text-primary-700">{formatPrice(deal.price)}</div>
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  <FiStar className="w-4 h-4" />
                  <span>{rating.toFixed(1)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-xs">{deal.category || 'Eletrônicos'}</span>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-primary-700 transition btn-animate shadow-lg"
              >
                <FiShoppingCart className="w-5 h-5" />
                Comprar
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Em estoque
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-orange-500" />
                Oferta relâmpago
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fdf2ec] via-white to-[#dff3ff] border border-gray-100 shadow-xl min-h-[340px] flex items-center">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(244,63,94,0.08),transparent_40%)]" />
            <div className="relative z-10 p-8 lg:p-12 grid lg:grid-cols-2 gap-6 w-full items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-white text-primary-700 border border-primary-100 font-semibold text-xs inline-flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" />
                  A partir de {formatPrice(spotlight.price)}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">{spotlight.name}</h2>
                <p className="text-gray-600 text-base lg:text-lg max-w-xl">
                  Headphones são feitos para ouvir música, podcasts e audiobooks com conforto e privacidade total.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/products/${spotlight.id}`}
                    className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition btn-animate shadow-lg"
                  >
                    Comprar agora
                  </Link>
                  <Link
                    href="/products"
                    className="px-5 py-3 rounded-xl border border-gray-200 hover:border-primary-200 hover:text-primary-700 bg-white/80 transition font-semibold"
                  >
                    Ver todos os produtos
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-8 -left-10 h-40 w-40 bg-primary-200/50 rounded-full blur-3xl" aria-hidden />
                <div className="absolute -bottom-10 -right-16 h-56 w-56 bg-amber-200/50 rounded-full blur-3xl" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spotlightImage}
                  alt={spotlight.name}
                  className="relative mx-auto drop-shadow-2xl w-full max-w-xs lg:max-w-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
