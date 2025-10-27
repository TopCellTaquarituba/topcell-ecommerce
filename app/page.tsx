import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import HeroCarousel from '@/components/HeroCarousel'
import CategoryCarousel from '@/components/CategoryCarousel'
import AboutSection from '@/components/AboutSection'
import { getProducts } from '@/lib/products'

export default function HomePage() {
  const featuredProducts = getProducts().slice(0, 8)

  return (
    <div className="animate-fade-in">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Category Carousel */}
      <CategoryCarousel />

      {/* About Section */}
      <AboutSection />

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold dark:text-white">Produtos em Destaque</h2>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Ver Todos →
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 dark:bg-primary-800 text-white transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para encontrar seu próximo dispositivo?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Navegue por nossa seleção dos melhores eletrônicos do mercado
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Explorar Produtos
          </Link>
        </div>
      </section>
    </div>
  )
}

