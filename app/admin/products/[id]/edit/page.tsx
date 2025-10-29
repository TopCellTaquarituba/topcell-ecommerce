"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

type KV = { key: string; value: string }
type Category = { id: string; slug: string; name: string }

type ProductResponse = {
  item: {
    id: string
    name: string
    description: string
    price: number
    originalPrice: number | null
    image: string
    images: string[]
    category: string
    brand: string
    stock: number
    featured?: boolean
    specs?: any
    customFields?: any
  }
}

const toPairs = (value: any): KV[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((entry: any) => ({ key: String(entry.key ?? ''), value: String(entry.value ?? '') }))
      .filter((entry) => entry.key || entry.value)
  }
  if (typeof value === 'object') {
    return Object.entries(value).map(([key, val]) => ({ key, value: String(val ?? '') }))
  }
  return []
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [specs, setSpecs] = useState<KV[]>([])
  const [customFields, setCustomFields] = useState<KV[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    category: 'Smartphones',
    brand: '',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    images: '',
    description: '',
    featured: false,
  })

  const addRow = (setter: React.Dispatch<React.SetStateAction<KV[]>>) => setter((arr) => [...arr, { key: '', value: '' }])
  const removeRow = (setter: React.Dispatch<React.SetStateAction<KV[]>>, idx: number) => setter((arr) => arr.filter((_, i) => i !== idx))
  const updateRow = (setter: React.Dispatch<React.SetStateAction<KV[]>>, idx: number, field: 'key' | 'value', val: string) =>
    setter((arr) => arr.map((row, i) => (i === idx ? { ...row, [field]: val } : row)))

  useEffect(() => {
    const load = async () => {
      if (!productId) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Falha ao carregar produto')
        const json: ProductResponse = await res.json()
        const item = json.item
        setForm({
          name: item.name || '',
          category: item.category || 'Smartphones',
          brand: item.brand || '',
          price: item.price != null ? String(item.price) : '',
          originalPrice: item.originalPrice != null ? String(item.originalPrice) : '',
          stock: item.stock != null ? String(item.stock) : '0',
          image: item.image || '',
          images: Array.isArray(item.images) ? item.images.join('\n') : '',
          description: item.description || '',
          featured: Boolean(item.featured),
        })
        setSpecs(toPairs(item.specs))
        setCustomFields(toPairs(item.customFields))
      } catch (e: any) {
        console.error(e)
        setError(e?.message || 'Não foi possível carregar o produto.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        const json = await res.json()
        setCategories(json.items || [])
      } catch {}
    }
    loadCats()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const { name, value } = target
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox'
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }))
  }

  const fromPairs = (arr: KV[]): Record<string, string> => {
    if (!arr) return {}
    return arr.reduce((acc, { key, value }) => (key ? { ...acc, [key]: value } : acc), {})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        categoryName: form.category,
        brandName: form.brand.trim(),
        price: Number(form.price || 0),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock || 0),
        image: form.image || 'https://via.placeholder.com/500',
        images: form.images
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        description: form.description,
        specs: fromPairs(specs.filter((row) => row.key && row.value)),
        customFields: fromPairs(customFields.filter((row) => row.key && row.value)),
        featured: form.featured,
      }
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || res.statusText || 'Falha ao salvar')
      alert('Produto atualizado com sucesso!')
      router.push('/admin/products')
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
              <Link href="/admin/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition">
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Produto</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
            Carregando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded">{error}</div>}

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informações básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome do Produto</label>
                  <input name="name" required value={form.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                  <select name="category" value={form.category} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Marca</label>
                  <input name="brand" value={form.brand} onChange={handleInputChange} placeholder="Ex.: Apple, Samsung" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preço (R$)</label>
                  <input type="number" name="price" value={form.price} onChange={handleInputChange} required step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preço original (opcional)</label>
                  <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleInputChange} step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estoque</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL da imagem principal</label>
                  <input name="image" value={form.image} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Imagens adicionais (uma por linha)</label>
                  <textarea name="images" value={form.images} onChange={handleInputChange} rows={3} placeholder={`https://...\nhttps://...`} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                  <textarea name="description" value={form.description} onChange={handleInputChange} rows={6} placeholder="Detalhes do produto, acessórios, garantia, política de troca, etc." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleInputChange} className="h-4 w-4" />
                  <label htmlFor="featured" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Marcar como produto destaque</label>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Especificações</h2>
                <button type="button" onClick={() => addRow(setSpecs)} className="text-primary-600 hover:text-primary-700 text-sm">+ adicionar</button>
              </div>
              {specs.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">Inclua pares como Marca, Modelo, Cor, Capacidade, etc.</p>}
              <div className="space-y-2">
                {specs.map((row, idx) => (
                  <div key={`spec-${idx}`} className="grid grid-cols-5 gap-2 items-center">
                    <input value={row.key} onChange={(e) => updateRow(setSpecs, idx, 'key', e.target.value)} placeholder="Campo" className="col-span-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input value={row.value} onChange={(e) => updateRow(setSpecs, idx, 'value', e.target.value)} placeholder="Valor" className="col-span-3 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <button type="button" onClick={() => removeRow(setSpecs, idx)} className="text-red-600 text-sm">remover</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campos personalizados</h2>
                <button type="button" onClick={() => addRow(setCustomFields)} className="text-primary-600 hover:text-primary-700 text-sm">+ adicionar</button>
              </div>
              {customFields.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">Use para Condição (Novo/Usado), Garantia, SKU, etc.</p>}
              <div className="space-y-2">
                {customFields.map((row, idx) => (
                  <div key={`cf-${idx}`} className="grid grid-cols-5 gap-2 items-center">
                    <input value={row.key} onChange={(e) => updateRow(setCustomFields, idx, 'key', e.target.value)} placeholder="Campo" className="col-span-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input value={row.value} onChange={(e) => updateRow(setCustomFields, idx, 'value', e.target.value)} placeholder="Valor" className="col-span-3 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <button type="button" onClick={() => removeRow(setCustomFields, idx)} className="text-red-600 text-sm">remover</button>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex gap-4">
              <button disabled={saving} type="submit" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <Link href="/admin/products" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
