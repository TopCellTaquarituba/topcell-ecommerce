"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

type AdminProduct = { id: string; name: string; price: number; category: string; stock: number; image: string }

export default function ProductsManagement() {
  const { user } = useAuth()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function load() {
    setLoading(true)
    const res = await fetch('/api/products', { cache: 'no-store' })
    const json = await res.json()
    const items: AdminProduct[] = (json.items || []).map((p: any) => ({ id: p.id, name: p.name, price: p.price, category: p.category || '-', stock: p.stock || 0, image: p.image }))
    setProducts(items)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        let message = res.statusText
        try {
          const data = await res.json()
          if (data?.error) message = data.error
        } catch {}
        alert('Falha ao excluir: ' + message)
        return
      }
      await load()
    } catch (e: any) {
      alert('Erro ao excluir: ' + (e?.message || 'desconhecido'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition">
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Produtos</h1>
            </div>
            <Link href="/admin/products/new" className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition btn-animate">
              <FiPlus className="w-4 h-4" />
              <span>Adicionar Produto</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Imagem</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Carregando...</td>
                  </tr>
                )}
                {!loading && products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {product.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Editar"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 transition">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* O formulário modal foi substituído por uma página dedicada em /admin/products/new */}
      </main>
    </div>
  )
}
