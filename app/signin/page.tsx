"use client"
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const search = useSearchParams()
  const nextUrl = search.get('next') || '/'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      identifier: String(fd.get('identifier') || ''),
      password: String(fd.get('password') || ''),
    }
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao autenticar')
      router.push(nextUrl)
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Entrar</h1>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email ou CPF</label>
          <input name="identifier" required className="w-full border rounded px-3 py-2" placeholder="voce@exemplo.com ou 00000000000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input type="password" name="password" required className="w-full border rounded px-3 py-2" placeholder="Sua senha" />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Enviando...' : 'Entrar'}</button>
      </form>
    </div>
  )
}

