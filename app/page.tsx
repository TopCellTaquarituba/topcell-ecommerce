import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import HeroShowcase from '@/components/HeroShowcase'
import AboutSectionDynamic from '@/components/AboutSectionDynamic'
import FAQSection from '@/components/FAQSection'
import MapSection from '@/components/MapSection'
import { getPrisma } from '@/lib/prisma'
import { getShopifyProducts } from '@/lib/shopify'

type HomeProps = {
  searchParams?: { page?: string }
}

function mapProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    rating: p.rating || 0,
  }
}

const fallbackTiles = [
  { id: 'tile-1', name: 'iPhone 15 Pro Max', category: 'Flagship', href: '/products?category=smartphones' },
  { id: 'tile-2', name: 'Samsung OLED Smart TV', category: 'TVs', href: '/products?category=tv' },
  { id: 'tile-3', name: 'Apple iPad Air', category: 'Tablets', href: '/products?category=tablets' },
  { id: 'tile-4', name: 'Smart Headphone', category: 'Áudio', href: '/products?category=headphones' },
  { id: 'tile-5', name: 'Acessórios Premium', category: 'Acessórios', href: '/products?category=accessories' },
]

const tilePalette = [
  { bg: 'bg-[#f8ebe9]', text: 'text-[#b45309]' },
  { bg: 'bg-[#e8f3ff]', text: 'text-[#0f4b8f]' },
  { bg: 'bg-[#e7f7f0]', text: 'text-[#0b7a5c]' },
  { bg: 'bg-[#f0e9ff]', text: 'text-[#6b21a8]' },
  { bg: 'bg-[#fff4e6]', text: 'text-[#b45309]' },
]

export default async function HomePage({ searchParams }: HomeProps) {
  const pageParam = searchParams?.page ? Number(searchParams.page) : 1
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const pageSize = 10
  const skip = (page - 1) * pageSize

  let featuredProducts: any[] = []
  let latestProducts: any[] = []
  let totalProducts = 0
  let shopifyTeaser: any[] = []

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

  // Shopify teaser (headless POC). Ignora erros silenciosamente quando não configurado.
  try {
    shopifyTeaser = await getShopifyProducts(4)
  } catch {}

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const prevHref = hasPrev ? (page - 1 === 1 ? '/' : `/?page=${page - 1}`) : null
  const nextHref = hasNext ? `/?page=${page + 1}` : null

  const heroDeal = featuredProducts[0] || latestProducts[0] || null
  const heroSpotlight = featuredProducts[1] || latestProducts[1] || null
  const tileCandidates = (featuredProducts.length ? featuredProducts : latestProducts).slice(0, 5)
  const highlightTiles = [...tileCandidates, ...fallbackTiles].slice(0, 5)

  return (
    <div className="animate-fade-in">
      <HeroShowcase dealProduct={heroDeal} spotlightProduct={heroSpotlight} />

      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {highlightTiles.map((tile, index) => {
              const palette = tilePalette[index % tilePalette.length]
              const href = (tile as any).href || (tile.id ? `/products/${tile.id}` : '/products')
              return (
                <Link
                  key={tile.id || tile.name || index}
                  href={href}
                  className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transition card-hover ${palette.bg}`}
                >
                  <h3 className="text-xl font-bold mt-3 text-gray-900">{tile.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Confira novidades e lançamentos selecionados.</p>
                  <span className="absolute bottom-4 right-4 text-sm font-semibold text-gray-700">Ver mais →</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <AboutSectionDynamic />

      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-[#f6f8ff] to-white">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
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

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Novidades</h2>
            <span className="text-sm text-gray-500">Página {Math.min(page, totalPages)} de {totalPages}</span>
          </div>
          {latestProducts.length > 0 ? (
            <div className="products-grid">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              Nenhum produto cadastrado ainda.
            </div>
          )}
          {totalProducts > pageSize && (
            <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                {hasPrev ? (
                  <Link href={prevHref!} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
                    ← Anterior
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg border border-gray-200 text-gray-400">← Anterior</span>
                )}
                {hasNext ? (
                  <Link href={nextHref!} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
                    Próxima →
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg border border-gray-200 text-gray-400">Próxima →</span>
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

      {shopifyTeaser.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Também no Shopify</h2>
              <Link href="/shopify" className="text-primary-600 hover:text-primary-700 font-semibold">Ver catálogo Shopify →</Link>
            </div>
            <div className="products-grid">
              {shopifyTeaser.map((p: any) => (
                <Link key={p.id} href={`/shopify/${p.handle}`} className="block bg-white rounded-lg shadow p-4 border border-gray-200 hover:-translate-y-1 transition card-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.featuredImage?.url && <img src={p.featuredImage.url} alt={p.featuredImage?.altText || p.title} className="w-full h-40 object-cover rounded" />}
                  <div className="mt-3 font-semibold">{p.title}</div>
                  <div className="text-primary-600">R$ {Number(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2).replace('.', ',')}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
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
