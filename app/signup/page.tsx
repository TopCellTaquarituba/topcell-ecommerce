"use client"
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const search = useSearchParams()
  const nextUrl = search.get('next') || '/'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // @ts-ignore
    const $ = (globalThis as any).jQuery as any
    if (!$) return
    function onlyDigits(s?: string) { return (s || '').replace(/\D+/g, '') }
    $(document).on('blur', '#birthDate', function (this: any) {
      const digits = onlyDigits(String($(this).val() || ''))
      if (digits.length === 8) {
        const dd = digits.slice(0, 2); const mm = digits.slice(2, 4); const yyyy = digits.slice(4)
        $(this).val(`${dd}/${mm}/${yyyy}`)
      }
    })
    $(document).on('input', '#phone', function (this: any) { $(this).val(onlyDigits(String($(this).val() || '')).slice(0, 11)) })
    $(document).on('input', '#document', function (this: any) { $(this).val(onlyDigits(String($(this).val() || '')).slice(0, 14)) })
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
      password: String(fd.get('password') || ''),
      birthDate: String(fd.get('birthDate') || ''),
    }
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao cadastrar')
      router.push(nextUrl)
    } catch (err: any) { setError(err?.message || 'Falha ao cadastrar') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <h1 className="text-2xl font-semibold mb-4">Criar conta</h1>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input name="name" className="w-full border rounded px-3 py-2" placeholder="Seu nome" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" className="w-full border rounded px-3 py-2" placeholder="voce@exemplo.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone (apenas números)</label>
          <input id="phone" name="phone" className="w-full border rounded px-3 py-2" placeholder="11988887777" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CPF ou CNPJ (apenas números)</label>
          <input id="document" name="document" className="w-full border rounded px-3 py-2" placeholder="CPF (11) ou CNPJ (14)" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data de nascimento</label>
          <input id="birthDate" name="birthDate" className="w-full border rounded px-3 py-2" placeholder="dd/mm/aaaa ou 01011990" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Crie uma senha</label>
          <input name="password" type="password" required className="w-full border rounded px-3 py-2" placeholder="Mínimo 6 caracteres" />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Enviando...' : 'Cadastrar'}</button>
      </form>
    </div>
  )
}

