"use client"
import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const nextUrl = search.get('next') || '/'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // jQuery helpers
  useEffect(() => {
    // @ts-ignore
    const $ = (globalThis as any).jQuery as any
    if (!$) return

    function onlyDigits(s?: string) {
      return (s || '').replace(/\D+/g, '')
    }

    // Format birth date as dd/mm/yyyy on blur if 8 digits
    $(document).on('blur', '#birthDate', function (this: any) {
      const digits = onlyDigits(String($(this).val() || ''))
      if (digits.length === 8) {
        const dd = digits.slice(0, 2)
        const mm = digits.slice(2, 4)
        const yyyy = digits.slice(4)
        $(this).val(`${dd}/${mm}/${yyyy}`)
      }
    })

    // Keep only digits for phone/document and limit size
    $(document).on('input', '#phone', function (this: any) {
      const digits = onlyDigits(String($(this).val() || '')).slice(0, 11)
      $(this).val(digits)
    })
    $(document).on('input', '#document', function (this: any) {
      const digits = onlyDigits(String($(this).val() || '')).slice(0, 14)
      $(this).val(digits)
    })
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      document: String(fd.get('document') || ''),
      birthDate: String(fd.get('birthDate') || ''),
    }
    try {
      const res = await fetch('/api/auth/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao autenticar')
      router.push(nextUrl)
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <h1 className="text-2xl font-semibold mb-4">Entrar ou Cadastrar</h1>
      <p className="text-sm text-gray-600 mb-4">Preencha seus dados. Campos obrigatórios: email, telefone e CPF ou CNPJ.</p>

      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Nome completo</label>
          <input id="name" name="name" className="w-full border rounded px-3 py-2" placeholder="Seu nome" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" name="email" type="email" required className="w-full border rounded px-3 py-2" placeholder="voce@exemplo.com" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone (apenas números)</label>
          <input id="phone" name="phone" required className="w-full border rounded px-3 py-2" placeholder="11988887777" />
        </div>
        <div>
          <label htmlFor="document" className="block text-sm font-medium mb-1">CPF ou CNPJ (apenas números)</label>
          <input id="document" name="document" required className="w-full border rounded px-3 py-2" placeholder="CPF (11) ou CNPJ (14)" />
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium mb-1">Data de nascimento</label>
          <input id="birthDate" name="birthDate" className="w-full border rounded px-3 py-2" placeholder="dd/mm/aaaa ou 01011990" />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? 'Enviando...' : 'Entrar / Cadastrar'}
        </button>
      </form>
    </div>
  )
}
