"use client"
import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiEye, FiEyeOff } from 'react-icons/fi'

type FormState = {
  name: string
  email: string
  phone: string
  document: string
  birthDate: string
  password: string
  confirmPassword: string
}

const initial: FormState = { name: '', email: '', phone: '', document: '', birthDate: '', password: '', confirmPassword: '' }

// Funções utilitárias para formatação de campos
const onlyDigits = (s: string) => s.replace(/\D+/g, '')
const formatPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
const formatDocument = (v: string) => {
  const d = onlyDigits(v).slice(0, 14)
  if (d.length <= 11) {
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
const formatBirthDate = (v: string) => {
  const d = onlyDigits(v).slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

export default function SignUpPage() {
  const router = useRouter()
  const search = useSearchParams()
  const nextUrl = search.get('next') || '/'
  const [form, setForm] = useState<FormState>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordMismatch = useMemo(() => {
    return form.password && form.confirmPassword && form.password !== form.confirmPassword
  }, [form.password, form.confirmPassword])

  const isFormInvalid = !form.email || !form.phone || !form.document || !form.password || passwordMismatch

  const handleChange = (field: keyof FormState, value: string) => {
    let formatted = value
    if (field === 'phone') formatted = formatPhone(value)
    if (field === 'document') formatted = formatDocument(value)
    if (field === 'birthDate') formatted = formatBirthDate(value)
    setForm((prev) => ({ ...prev, [field]: formatted }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: onlyDigits(form.phone),
      document: onlyDigits(form.document),
      password: form.password,
      birthDate: form.birthDate.trim(),
    }
    if (!payload.email || !payload.phone || !payload.document || !payload.password) {
      setError('Informe email, telefone, documento e senha.')
      setLoading(false)
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem. Por favor, verifique.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao cadastrar')
      router.push(nextUrl)
    } catch (err: any) {
      setError(err?.message || 'Falha ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Criar conta</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Preencha seus dados para criar sua conta na TopCell.</p>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold mb-1">Nome completo</label>
          <input
            name="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
            placeholder="voce@exemplo.com"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Telefone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              placeholder="(11) 98888-7777"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">CPF ou CNPJ</label>
            <input
              id="document"
              name="document"
              value={form.document}
              onChange={(e) => handleChange('document', e.target.value)}
              required
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              placeholder="000.000.000-00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Data de nascimento</label>
          <input
            id="birthDate"
            name="birthDate"
            value={form.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
            placeholder="dd/mm/aaaa"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Crie uma senha</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                required
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 pr-10 focus:ring-2 focus:ring-primary-500"
                placeholder="Minimo 6 caracteres"
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
          <div>
            <label className="block text-sm font-semibold mb-1">Confirme a senha</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                minLength={6}
                required
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 pr-10 focus:ring-2 focus:ring-primary-500 ${passwordMismatch ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                placeholder="Repita sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                aria-label="Mostrar ou ocultar confirmacao de senha"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </div>
        {passwordMismatch && <p className="text-xs text-red-500">As senhas não conferem.</p>}
        <button
          type="submit"
          disabled={!!(loading || isFormInvalid)}
          className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
