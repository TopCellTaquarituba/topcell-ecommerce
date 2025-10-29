"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'

type Category = { id: string; slug: string; name: string }

export default function CategoriesAdminPage() {
  const [items, setItems] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' })
      const json = await res.json()
      setItems(json.items || [])
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, slug: slug || undefined }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || res.statusText || 'Falha ao salvar')
      setName('')
      setSlug('')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8 space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adicionar categoria</h2>
          {error && <div className="mb-3 bg-red-100 text-red-700 px-4 py-3 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Smartphones" required className="w-full input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug (opcional)</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ex.: smartphones" className="w-full input" />
            </div>
            <button disabled={saving} type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg flex items-center justify-center">
              <FiPlus className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </form>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lista de categorias</h2>
            <button onClick={load} className="text-sm text-primary-600 hover:text-primary-700">Atualizar</button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                    <div className="text-xs text-gray-500">/{c.slug}</div>
                  </div>
                </li>
              ))}
              {items.length === 0 && <li className="py-3 text-sm text-gray-500">Nenhuma categoria ainda</li>}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

