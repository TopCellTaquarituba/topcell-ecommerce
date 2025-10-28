<style jsx global>{\r\n          /* Consistent inputs in dark/light without Tailwind @apply */
          .input {
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #D1D5DB; /* gray-300 */
            background: #ffffff; /* white */
            color: #111827; /* gray-900 */
            width: 100%;
            display: block;
            line-height: 1.25rem;
            appearance: none;
          }
          .input::placeholder { color: #9CA3AF; }
          .dark .input {
            border-color: #4B5563; /* gray-600 */
            background: #374151; /* gray-700 */
            color: #F3F4F6; /* gray-100 */
            color-scheme: dark; /* improves native date/select controls */
          }
          .dark .input::placeholder { color: #D1D5DB; opacity: 0.7; }
          /* Ensure dropdown options in dark mode are readable */
          .dark select.input option { background: #374151; color: #F3F4F6; }
          button.input { text-align: left; }
        }</style>use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiDownload, FiFilter } from 'react-icons/fi'

type ApiOrder = {
  id: string
  number: string
  status: string
  total: number
  createdAt: string | Date
  customer: { id: string; name: string }
}

type ApiResponse = {
  ok: boolean
  total: number
  page: number
  pageSize: number
  orders: ApiOrder[]
  summary: { revenue: number; count: number; avgTicket: number }
  byDay: { date: string; revenue: number; count: number }[]
  byStatus: { status: string; count: number }[]
  byCategory: { category: string; revenue: number; count: number }[]
  topProducts: { productId: string; name: string; revenue: number; units: number }[]
}

type Preset = '7d' | '30d' | 'month' | 'custom'

function formatCurrency(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const ALL_STATUSES = ['pending','paid','shipped','delivered','canceled'] as const

export default function SalesAdminPage() {
  const [preset, setPreset] = useState<Preset>('7d')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [status, setStatus] = useState<string[]>([])
  const [category, setCategory] = useState<string>('')
  const [q, setQ] = useState('')
  const [minTotal, setMinTotal] = useState<string>('')
  const [maxTotal, setMaxTotal] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)

  const buildRangeFromPreset = (p: Preset) => {
    const today = new Date()
    const to = today.toISOString().slice(0, 10)
    if (p === '7d' || p === '30d') {
      const d = new Date(today)
      d.setDate(d.getDate() - (p === '7d' ? 6 : 29))
      const from = d.toISOString().slice(0, 10)
      return { from, to }
    }
    if (p === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1)
      const from = d.toISOString().slice(0, 10)
      return { from, to }
    }
    return { from: '', to: '' }
  }

  useEffect(() => {
    if (preset !== 'custom') {
      const r = buildRangeFromPreset(preset)
      setFrom(r.from)
      setTo(r.to)
    }
  }, [preset])

  const query = useMemo(() => {
    const sp = new URLSearchParams()
    if (from) sp.set('from', from)
    if (to) sp.set('to', to)
    if (status.length) sp.set('status', status.join(','))
    if (category) sp.set('category', category)
    if (q) sp.set('q', q)
    if (minTotal) sp.set('minTotal', minTotal)
    if (maxTotal) sp.set('maxTotal', maxTotal)
    sp.set('page', String(page))
    sp.set('pageSize', String(pageSize))
    return sp.toString()
  }, [from, to, status, category, q, minTotal, maxTotal, page, pageSize])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?${query}`, { cache: 'no-store' })
      const json: ApiResponse = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const exportCsv = () => {
    if (!data) return
    const rows = [
      ['Número', 'Data', 'Cliente', 'Status', 'Total'],
      ...data.orders.map((o) => [
        o.number,
        new Date(o.createdAt).toISOString().slice(0,10),
        o.customer?.name || '',
        o.status,
        String(o.total).replace('.', ','),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendas_${from || 'all'}_${to || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendas</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2">
              <FiDownload className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>
      </header>

      <main className="container-custom py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-3 text-gray-700 dark:text-gray-300 font-semibold">
            <FiFilter className="w-4 h-4" /> Filtros
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-wrap gap-2">
              {([
                { k: '7d', label: 'Últimos 7 dias' },
                { k: '30d', label: 'Últimos 30 dias' },
                { k: 'month', label: 'Este mês' },
                { k: 'custom', label: 'Personalizado' },
              ] as const).map((p) => (
                <button
                  key={p.k}
                  onClick={() => setPreset(p.k)}
                  className={`px-3 py-2 rounded border ${preset === p.k ? 'bg-primary-600 text-white border-primary-600' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                >{p.label}</button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs mb-1">De</label>
                <input type="date" value={from} onChange={(e)=>{ setFrom(e.target.value); setPreset('custom') }} className="w-full input" />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Até</label>
                <input type="date" value={to} onChange={(e)=>{ setTo(e.target.value); setPreset('custom') }} className="w-full input" />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1">Status</label>
              <StatusMultiSelect value={status} onChange={setStatus} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1">Categoria</label>
                <input value={category} onChange={(e)=> setCategory(e.target.value)} placeholder="ex: Smartphones" className="w-full input" />
              </div>
              <div>
                <label className="block text-xs mb-1">Busca (nº ou cliente)</label>
                <input value={q} onChange={(e)=> setQ(e.target.value)} className="w-full input" />
              </div>
              <div>
                <label className="block text-xs mb-1">Mín. (R$)</label>
                <input value={minTotal} onChange={(e)=> setMinTotal(e.target.value)} className="w-full input" inputMode="numeric" />
              </div>
              <div>
                <label className="block text-xs mb-1">Máx. (R$)</label>
                <input value={maxTotal} onChange={(e)=> setMaxTotal(e.target.value)} className="w-full input" inputMode="numeric" />
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Receita</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data?.summary.revenue || 0)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Pedidos</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.summary.count || 0}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Ticket médio</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data?.summary.avgTicket || 0)}</div>
          </div>
        </div>

        {/* Chart by day */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Vendas por dia</div>
          <SalesBars data={data?.byDay || []} />
        </div>

        {/* Orders table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Resultados</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{loading ? 'Carregando...' : `${data?.total || 0} pedidos`}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold">Número</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold">Data</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold">Cliente</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">#{o.number}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{o.customer?.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{o.status}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(o.total)}</td>
                  </tr>
                ))}
                {!data?.orders?.length && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum pedido encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 text-sm">
            <div>Pag. {page} de {totalPages}</div>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={()=> setPage((p)=> Math.max(1, p-1))} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Anterior</button>
              <button disabled={page>=totalPages} onClick={()=> setPage((p)=> Math.min(totalPages, p+1))} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Próxima</button>
              <select value={pageSize} onChange={(e)=> { setPageSize(Number(e.target.value)); setPage(1) }} className="ml-2 input">
                {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/página</option>)}
              </select>
            </div>
          </div>
        </div>

        <style jsx global>{`
          /* Consistent inputs in dark/light without Tailwind @apply */
          .input {
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #D1D5DB; /* gray-300 */
            background: #ffffff; /* white */
            color: #111827; /* gray-900 */
            width: 100%;
          }
          .input::placeholder { color: #9CA3AF; }
          .dark .input {
            border-color: #4B5563; /* gray-600 */
            background: #374151; /* gray-700 */
            color: #F3F4F6; /* gray-100 */
            color-scheme: dark; /* improves native date/select controls */
          }
          .dark .input::placeholder { color: #D1D5DB; opacity: 0.7; }
          /* Ensure dropdown options in dark mode are readable */
          .dark select.input option { background: #374151; color: #F3F4F6; }
        `}</style>
      </main>
    </div>
  )
}

function SalesBars({ data }: { data: { date: string; revenue: number; count: number }[] }) {
  if (!data?.length) return <div className="text-sm text-gray-500 dark:text-gray-400">Sem dados no período.</div>
  const max = Math.max(...data.map(d => d.revenue)) || 1
  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((d.revenue / max) * 160))
        return (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-gradient-to-t from-primary-600 to-primary-400 w-6 rounded-t" style={{ height: h }} title={`${d.date} • ${formatCurrency(d.revenue)}`}></div>
            <div className="text-[10px] mt-1 text-gray-600 dark:text-gray-300">{new Date(d.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })}</div>
          </div>
        )
      })}
    </div>
  )
}

function StatusMultiSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!anchorEl) return
      if (!anchorEl.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [anchorEl])

  const label = value.length
    ? value.join(', ')
    : 'Selecione...'

  const toggle = (s: string) => {
    const set = new Set(value)
    if (set.has(s)) set.delete(s); else set.add(s)
    onChange(Array.from(set))
  }

  const selectAll = () => onChange(Array.from(ALL_STATUSES))
  const clearAll = () => onChange([])

  return (
    <div className="relative" ref={setAnchorEl as any}>
      <button type="button" className="input text-left cursor-pointer h-[42px]" onClick={() => setOpen(o=>!o)}>
        {label}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
          <div className="flex justify-between items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
            <button className="underline" onClick={selectAll}>Selecionar todos</button>
            <button className="underline" onClick={clearAll}>Limpar</button>
          </div>
          <div className="max-h-48 overflow-auto divide-y divide-gray-100 dark:divide-gray-700">
            {ALL_STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-2 px-2 py-2 text-sm text-gray-800 dark:text-gray-100 cursor-pointer">
                <input type="checkbox" checked={value.includes(s)} onChange={() => toggle(s)} />
                <span className="capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
