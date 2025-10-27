'use client'

import { useState } from 'react'
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { Product } from '@/lib/products'

interface ProductFiltersProps {
  products: Product[]
  onFiltersChange: (filters: FilterState) => void
  isOpen: boolean
  onToggle: () => void
}

export interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  minRating: number
  sortBy: string
  searchQuery: string
}

const initialFilters: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, 10000],
  minRating: 0,
  sortBy: 'relevance',
  searchQuery: ''
}

export default function ProductFilters({ products, onFiltersChange, isOpen, onToggle }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true
  })

  // Extract unique values for filters
  const categories = [...new Set(products.map(p => p.category))]
  const brands = [...new Set(products.map(p => p.brand || 'Outros'))]
  const maxPrice = Math.max(...products.map(p => p.price))

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]
    
    const newFilters = { ...filters, brands: newBrands }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceChange = (range: [number, number]) => {
    const newFilters = { ...filters, priceRange: range }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, minRating: rating }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (searchQuery: string) => {
    const newFilters = { ...filters, searchQuery }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setFilters(initialFilters)
    onFiltersChange(initialFilters)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeFiltersCount = filters.categories.length + filters.brands.length + 
    (filters.minRating > 0 ? 1 : 0) + (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0)

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center space-x-2"
      >
        <FiFilter className="w-5 h-5" />
        <span className="font-semibold">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="bg-white text-primary-600 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Filters Sidebar */}
      <div className={`
        fixed lg:sticky lg:top-24 lg:left-0 lg:z-0 z-50
        w-80 h-full lg:h-auto
        bg-white dark:bg-gray-800 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        overflow-y-auto scrollbar-hide
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">Filtros</h2>
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Limpar tudo
                </button>
              )}
              <button
                onClick={onToggle}
                className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Buscar produtos
            </label>
            <input
              type="text"
              placeholder="Digite o nome do produto..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="price-low">Menor Preço</option>
              <option value="price-high">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
              <option value="newest">Mais Recentes</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-700 dark:text-gray-300 mb-3"
            >
              <span>Categorias</span>
              {expandedSections.categories ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.categories && (
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('brands')}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-700 dark:text-gray-300 mb-3"
            >
              <span>Marcas</span>
              {expandedSections.brands ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.brands && (
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-700 dark:text-gray-300 mb-3"
            >
              <span>Faixa de Preço</span>
              {expandedSections.price ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.price && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max={maxPrice}
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange([Number(e.target.value), filters.priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="number"
                    min="0"
                    max={maxPrice}
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange([filters.priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Max"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  R$ {filters.priceRange[0].toFixed(2).replace('.', ',')} - R$ {filters.priceRange[1].toFixed(2).replace('.', ',')}
                </div>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-700 dark:text-gray-300 mb-3"
            >
              <span>Avaliação</span>
              {expandedSections.rating ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.rating && (
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.minRating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {rating}+ estrelas
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
