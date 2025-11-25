'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import ProductFilters, { FilterState } from '@/components/ProductFilters'
import { FiGrid, FiList } from 'react-icons/fi'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const qParam = searchParams.get('q') || ''
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: [0, 10000],
    minRating: 0,
    sortBy: 'relevance',
    searchQuery: qParam
  })

  const [allProducts, setAllProducts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const sp = new URLSearchParams()
      if (category) sp.set('category', category)
      const qs = sp.toString()
      const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
      const json = await res.json()
      const items = (json.items || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image,
        brand: p.brand || 'Outros',
        description: p.description || '',
        rating: p.rating || 0,
        createdAt: p.createdAt,
      }))
      setAllProducts(items)
    }
    load()
  }, [category])

  // Keep filters in sync with query param changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery: qParam }))
  }, [qParam])

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand || 'Outros')
      )
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    )

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(product => 
        product.rating >= filters.minRating
      )
    }

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (product.brand || '').toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [allProducts, filters])

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [filteredProducts, filters.sortBy])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 dark:text-white">
          {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Todos os Produtos'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <ProductFilters
            products={allProducts}
            onFiltersChange={handleFiltersChange}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filters */}
          <div className="lg:hidden mb-6">
            <ProductFilters
              products={allProducts}
              onFiltersChange={handleFiltersChange}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </div>

          {/* View Mode Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {sortedProducts.length} de {allProducts.length} produtos
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className={viewMode === 'grid' 
            ? 'products-grid' 
            : 'space-y-4'
          }>
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Tente ajustar os filtros para encontrar o que procura
              </p>
              <button
                onClick={() => setFilters({
                  brands: [],
                  priceRange: [0, 10000],
                  minRating: 0,
                  sortBy: 'relevance',
                  searchQuery: ''
                })}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

