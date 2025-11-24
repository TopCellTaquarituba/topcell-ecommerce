"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type TokenStatus = { connected: boolean; expiresAt?: string | null }
type Progress = { current: number; total: number }
type LogLine = { message: string; ts: string }

export default function BlingIntegrationPage() {
  const [status, setStatus] = useState<TokenStatus>({ connected: false })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0 })
  const [logs, setLogs] = useState<LogLine[]>([])
  const esRef = useRef<EventSource | null>(null)

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
    return () => {
      esRef.current?.close()
    }
  }, [])

  const pushLog = (msg: string) => {
    setLogs((prev) => [...prev, { message: msg, ts: new Date().toLocaleTimeString('pt-BR') }].slice(-200))
  }

  const importProducts = () => {
    if (!status.connected) return
    setBusy(true)
    setMessage(null)
    setLogs([])
    setProgress({ current: 0, total: 0 })

    const es = new EventSource('/api/bling/products/pull/stream?limit=100&page=1')
    esRef.current = es

    es.addEventListener('log', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.message) pushLog(data.message)
      } catch {}
    })

    es.addEventListener('progress', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        setProgress({ current: data.current || 0, total: data.total || 0 })
      } catch {}
    })

    es.addEventListener('done', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        setMessage(`Importação finalizada. Produtos importados: ${data?.imported ?? 0}`)
      } catch {
        setMessage('Importação finalizada.')
      }
      setBusy(false)
      es.close()
    })

    es.addEventListener('error', (event: MessageEvent) => {
      try {
        const data = JSON.parse((event as any).data || '{}')
        setMessage(data?.error || 'Falha na importação.')
      } catch {
        setMessage('Falha na importação.')
      }
      setBusy(false)
      es.close()
    })
  }

  const pct = progress.total > 0 ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0

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
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Regra: sempre que alterar foto, descrição ou qualquer dado no Bling, clique em &ldquo;Atualizar Produtos&rdquo; para sincronizar aqui.
          </p>
          <button
            disabled={!status.connected || busy}
            onClick={importProducts}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            {busy ? 'Importando...' : 'Importar Produtos'}
          </button>
          <button
            disabled={!status.connected || busy}
            onClick={importProducts}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 dark:bg-gray-700 dark:text-white"
          >
            {busy ? 'Atualizando...' : 'Atualizar Produtos'}
          </button>
          {busy && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {progress.total > 0 ? `${progress.current} / ${progress.total} (${pct}%)` : 'Preparando...'}
              </div>
            </div>
          )}
          <div className="bg-gray-900 text-gray-100 rounded-md p-3 h-48 overflow-auto font-mono text-xs border border-gray-800">
            {logs.length === 0 && <div className="text-gray-500">Aguardando logs...</div>}
            {logs.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">
                <span className="text-gray-500 mr-2">{l.ts}</span>
                <span>{l.message}</span>
              </div>
            ))}
          </div>
          {message && <div className="text-sm text-gray-700 dark:text-gray-300">{message}</div>}
        </div>
      </div>
    </div>
  )
}
