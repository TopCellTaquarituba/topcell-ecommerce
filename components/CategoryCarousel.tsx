'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

type Category = { id: string; name: string; slug: string; description?: string; image?: string }

export default function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [cats, setCats] = useState<Category[]>([])

  // Load categories from API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        const json = await res.json()
        const items: Category[] = (json.items || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, image: c.image }))
        setCats(items)
      } catch {}
    }
    load()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Width of card + gap
      const scrollPosition = scrollRef.current.scrollLeft
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount

      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })

      // Update arrow visibility
      setTimeout(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
          setShowLeftArrow(scrollLeft > 0)
          setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
      }, 100)
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-down">
              Nossas Categorias
            </h2>
            <p className="text-gray-600 dark:text-gray-400 animate-slide-down" style={{ animationDelay: '100ms' }}>
              Explore nossa ampla gama de produtos eletrônicos
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 btn-animate"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 btn-animate"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(cats.length ? cats : []).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group flex-shrink-0 w-72 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 card-hover bg-white dark:bg-gray-800">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={category.image || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-200">
                        {category.description || ''}
                      </p>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 btn-animate shadow-lg"
          >
            <span>Ver Todas as Categorias</span>
            <FiChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

