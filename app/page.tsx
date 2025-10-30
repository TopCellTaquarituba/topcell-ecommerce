import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import HeroCarousel from '@/components/HeroCarousel'
import CategoryCarousel from '@/components/CategoryCarousel'
import AboutSectionDynamic from '@/components/AboutSectionDynamic'
import FAQSection from '@/components/FAQSection'
import MapSection from '@/components/MapSection'
import { getPrisma } from '@/lib/prisma'

type HomeProps = {
  searchParams?: { page?: string }
}

function mapProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    category: p.category?.name || 'Categoria',
    rating: p.rating || 0,
  }
}

export default async function HomePage({ searchParams }: HomeProps) {
  const pageParam = searchParams?.page ? Number(searchParams.page) : 1
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const pageSize = 10
  const skip = (page - 1) * pageSize

  let featuredProducts: any[] = []
  let latestProducts: any[] = []
  let totalProducts = 0

  try {
    const prisma = await getPrisma()
    const [featuredRaw, latestRaw, total] = await Promise.all([
      prisma.product.findMany({ where: { featured: true }, include: { category: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
      prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
      prisma.product.count(),
    ])
    featuredProducts = featuredRaw.map(mapProduct)
    latestProducts = latestRaw.map(mapProduct)
    totalProducts = total
  } catch (e) {
    console.error('Falha ao carregar produtos para a home', e)
  }

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const prevHref = hasPrev ? (page - 1 === 1 ? '/' : `/?page=${page - 1}`) : null
  const nextHref = hasNext ? `/?page=${page + 1}` : null

  return (
    <div className="animate-fade-in">
      <HeroCarousel />
      <CategoryCarousel />
      <AboutSectionDynamic />

      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold dark:text-white">Produtos em Destaque</h2>
              <Link href="/products" className="text-primary-600 hover:text-primary-700 font-semibold">
                Ver todos →
              </Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold dark:text-white">Novidades</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Página {Math.min(page, totalPages)} de {totalPages}</span>
          </div>
          {latestProducts.length > 0 ? (
            <div className="products-grid">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhum produto cadastrado ainda.
            </div>
          )}
          {totalProducts > pageSize && (
            <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                {hasPrev ? (
                  <Link href={prevHref!} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    ← Anterior
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400">← Anterior</span>
                )}
                {hasNext ? (
                  <Link href={nextHref!} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Próxima →
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400">Próxima →</span>
                )}
              </div>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition btn-animate"
              >
                Explorar mais produtos
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary-600 dark:bg-primary-800 text-white transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para encontrar seu próximo dispositivo?</h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">Navegue por nossa seleção dos melhores eletrônicos do mercado</p>
          <Link href="/products" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
            Explorar Produtos
          </Link>
        </div>
      </section>

      <MapSection />
      <FAQSection />
    </div>
  )
}
