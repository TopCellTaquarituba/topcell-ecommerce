"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const nextUrl = search.get('next') || '/'
  const mode = (search.get('mode') || '').toLowerCase()
  const isLoginMode = mode !== 'signup'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Se a URL tentar acessar o modo de cadastro, redireciona para a nova página /signup
    // que possui uma experiência de usuário melhor.
    if (mode === 'signup') {
      const newUrl = nextUrl ? `/signup?next=${encodeURIComponent(nextUrl)}` : '/signup'
      router.replace(newUrl)
    }
  }, [mode, nextUrl, router])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const url = '/api/auth/login'
    const payload = {
      identifier: String(fd.get('identifier') || ''),
      password: String(fd.get('password') || ''),
    }

    try {
      const res = await fetch(url, {
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

  // Se estiver no modo signup, renderiza um placeholder enquanto redireciona.
  if (mode === 'signup') {
    return <div className="max-w-xl mx-auto p-6 text-center">Redirecionando para a página de cadastro...</div>
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Entrar na sua conta</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Acesse seus pedidos, favoritos e muito mais.
      </p>

      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
        {isLoginMode && (
          <>
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold mb-1">Email ou CPF/CNPJ</label>
              <input id="identifier" name="identifier" required className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500" placeholder="seuemail@exemplo.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1">Senha</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full border rounded px-3 py-2 pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link href="/reset-password" className="text-sm text-primary-600 hover:text-primary-700">Esqueceu sua senha?</Link>
            </div>
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Entrar'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Não tem uma conta? <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">Cadastre-se</Link></p>
      </div>
    </div>
  )
}
