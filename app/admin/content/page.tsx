"use client"

import { useContent } from '@/context/ContentContext'
import { useEffect, useState } from 'react'

export default function AdminContentPage() {
  const { content, setContent, refresh } = useContent()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // ensure latest content when opening the page
    refresh()
  }, [])

  const handleSlideChange = (index: number, field: string, value: string) => {
    const heroSlides = [...content.heroSlides]
    ;(heroSlides as any)[index] = { ...heroSlides[index], [field]: value }
    setContent({ ...content, heroSlides })
  }

  const addSlide = () => {
    const nextId = (content.heroSlides.at(-1)?.id ?? 0) + 1
    setContent({
      ...content,
      heroSlides: [
        ...content.heroSlides,
        { id: nextId, title: '', subtitle: '', description: '', image: '', link: '/', linkText: 'Ver mais' },
      ],
    })
  }

  const removeSlide = (index: number) => {
    const heroSlides = content.heroSlides.filter((_, i) => i !== index)
    setContent({ ...content, heroSlides })
  }

  const handleAboutChange = (field: 'title' | 'subtitle' | 'mission', value: string) => {
    setContent({ ...content, about: { ...content.about, [field]: value } })
  }

  const handleParagraphChange = (i: number, value: string) => {
    const paragraphs = [...content.about.paragraphs]
    paragraphs[i] = value
    setContent({ ...content, about: { ...content.about, paragraphs } })
  }

  const addParagraph = () => setContent({ ...content, about: { ...content.about, paragraphs: [...content.about.paragraphs, ''] } })
  const removeParagraph = (i: number) =>
    setContent({ ...content, about: { ...content.about, paragraphs: content.about.paragraphs.filter((_, idx) => idx !== i) } })

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (!res.ok) throw new Error((await res.json())?.error || 'Falha ao salvar')
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Configurações do Site</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Hero Slides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Hero (Slides)</h2>
        <div className="space-y-6">
          {content.heroSlides.map((s, i) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Título</label>
                  <input className="w-full input" value={s.title} onChange={(e) => handleSlideChange(i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Subtítulo</label>
                  <input className="w-full input" value={s.subtitle} onChange={(e) => handleSlideChange(i, 'subtitle', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Descrição</label>
                  <input className="w-full input" value={s.description} onChange={(e) => handleSlideChange(i, 'description', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Imagem (URL)</label>
                  <input className="w-full input" value={s.image} onChange={(e) => handleSlideChange(i, 'image', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Link</label>
                  <input className="w-full input" value={s.link} onChange={(e) => handleSlideChange(i, 'link', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Texto do Link</label>
                  <input className="w-full input" value={s.linkText} onChange={(e) => handleSlideChange(i, 'linkText', e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => removeSlide(i)} className="text-sm px-3 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50">Remover</button>
              </div>
            </div>
          ))}
          <button onClick={addSlide} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Adicionar slide</button>
        </div>
      </section>

      {/* About */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Sobre Nós</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Título</label>
            <input className="w-full input" value={content.about.title} onChange={(e) => handleAboutChange('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Subtítulo</label>
            <input className="w-full input" value={content.about.subtitle} onChange={(e) => handleAboutChange('subtitle', e.target.value)} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Parágrafos</label>
              <button onClick={addParagraph} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Adicionar</button>
            </div>
            {content.about.paragraphs.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input className="w-full input" value={p} onChange={(e) => handleParagraphChange(i, e.target.value)} />
                <button onClick={() => removeParagraph(i)} className="px-3 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50">X</button>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Missão</label>
            <input className="w-full input" value={content.about.mission} onChange={(e) => handleAboutChange('mission', e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button onClick={refresh} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">Recarregar</button>
        <button onClick={save} disabled={saving} className="px-6 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <style jsx global>{`
        /* Fix dark mode for inputs without relying on Tailwind @apply in styled-jsx */
        .input { 
          padding: 0.5rem 0.75rem; 
          border-radius: 0.5rem; 
          border: 1px solid #D1D5DB; /* gray-300 */
          background: #ffffff; /* white */
          color: #111827; /* gray-900 */
          width: 100%;
        }
        .input::placeholder { color: #9CA3AF; /* gray-400 */ }
        .dark .input { 
          border-color: #4B5563; /* gray-600 */
          background: #374151; /* gray-700 */
          color: #F3F4F6; /* gray-100 */
        }
        .dark .input::placeholder { color: #D1D5DB; opacity: 0.7; }
      `}</style>
    </div>
  )
}
