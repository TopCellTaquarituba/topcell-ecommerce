"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

type TokenStatus = { connected: boolean; expiresAt?: string | null }

export default function BlingIntegrationPage() {
  const [status, setStatus] = useState<TokenStatus>({ connected: false })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/bling/status', { cache: 'no-store' })
        if (!res.ok) throw new Error('Falha ao carregar status')
        const data = await res.json()
        setStatus({ connected: !!data?.connected, expiresAt: data?.expiresAt || null })
      } catch {
        setStatus({ connected: false })
      }
    }
    load()
  }, [])

  const importProducts = async () => {
    setBusy(true); setMessage(null)
    try {
      const res = await fetch('/api/bling/products/pull', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 1, limit: 100 }) })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao importar')
      setMessage(`Importados: ${data.imported}`)
    } catch (e: any) {
      setMessage(e?.message || 'Falha ao importar')
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Integração Bling</h1>
          <Link href="/admin/dashboard" className="text-sm text-blue-600 dark:text-blue-400">Voltar</Link>
        </div>
        <div className="border rounded p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Status: {status.connected ? 'Conectado' : 'Desconectado'}</p>
              {status.expiresAt && <p className="text-sm text-gray-500">Expira: {new Date(status.expiresAt).toLocaleString('pt-BR')}</p>}
            </div>
            {status.connected ? (
              <a href="/api/bling/oauth/start" className="px-4 py-2 border rounded text-gray-700 dark:text-gray-200 dark:border-gray-600">Reconectar</a>
            ) : (
              <a href="/api/bling/oauth/start" className="px-4 py-2 bg-black text-white rounded">Conectar</a>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <button disabled={!status.connected || busy} onClick={importProducts} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Importar Produtos</button>
          {message && <div className="text-sm text-gray-700 dark:text-gray-300">{message}</div>}
        </div>
      </div>
    </div>
  )
}

