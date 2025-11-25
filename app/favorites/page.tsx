"use client"

import { useEffect, useMemo, useState } from 'react'
import { useFavorites } from '@/context/FavoritesContext'
import ProductCard from '@/components/ProductCard'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [products, setProducts] = useState<any[]>([])
  const idsParam = useMemo(() => favorites.join(','), [favorites])

  useEffect(() => {
    async function load() {
      if (!idsParam) { setProducts([]); return }
      const res = await fetch(`/api/products?ids=${encodeURIComponent(idsParam)}&limit=100`, { cache: 'no-store' })
      const json = await res.json().catch(()=>({}))
      const mapped = (json.items || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image,
        rating: p.rating || 0,
      }))
      setProducts(mapped)
    }
    load()
  }, [idsParam])

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Meus Favoritos</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Produtos salvos por você.</p>
      {products.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">Você ainda não favoritou nenhum produto.</div>
      ) : (
        <div className="products-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

