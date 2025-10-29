"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'

type KV = { key: string; value: string }

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [specs, setSpecs] = useState<KV[]>([])
  const [customFields, setCustomFields] = useState<KV[]>([])
  const [form, setForm] = useState({
    name: '',
    category: 'Smartphones',
    brand: '',
    price: '',
    originalPrice: '',
    stock: '0',
    image: '',
    images: '',
    description: '',
    featured: false,
  })

  const addRow = (setter: React.Dispatch<React.SetStateAction<KV[]>>) => setter((arr) => [...arr, { key: '', value: '' }])
  const removeRow = (setter: React.Dispatch<React.SetStateAction<KV[]>>, idx: number) => setter((arr) => arr.filter((_, i) => i !== idx))
  const updateRow = (setter: React.Dispatch<React.SetStateAction<KV[]>>, idx: number, field: 'key' | 'value', val: string) =>
    setter((arr) => arr.map((r, i) => (i === idx ? { ...r, [field]: val } : r)))

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        specs: fromPairs(specs.filter((r) => r.key && r.value)),
        customFields: fromPairs(customFields.filter((r) => r.key && r.value)),
        featured: form.featured,
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || res.statusText || 'Falha ao salvar')
      alert('Produto cadastrado com sucesso!')
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Produto</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
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
                <select name="category" required value={form.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="Smartphones">Smartphones</option>
                  <option value="Notebooks">Notebooks</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Tablets">Tablets</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Marca</label>
                <input name="brand" placeholder="Ex.: Apple, Samsung" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preço (R$)</label>
                <input type="number" name="price" step="0.01" required value={form.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preço original (opcional)</label>
                <input type="number" name="originalPrice" step="0.01" value={form.originalPrice} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estoque</label>
              <input type="number" name="stock" required value={form.stock} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL da imagem principal</label>
                <input type="url" name="image" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Imagens adicionais (uma por linha)</label>
                <input name="image" value={form.image} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                <textarea name="images" rows={3} placeholder={`https://...\nhttps://...`} value={form.images} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleInputChange} className="h-4 w-4" />
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
          <button disabled={saving} type="submit" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg">{saving ? 'Salvando...' : 'Cadastrar Produto'}</button>
            <Link href="/admin/products" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg">Cancelar</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
