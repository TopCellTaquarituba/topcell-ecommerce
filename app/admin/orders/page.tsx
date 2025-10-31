"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

type ApiOrder = {
  id: string
  number: string
  status: string
  total: number
  createdAt: string | Date
  customer: { id: string; name: string }
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [contact, setContact] = useState<any | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?page=1&pageSize=50`, { cache: 'no-store' })
      const j = await res.json()
      setOrders(j.orders || [])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const markPaid = async (id: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) })
    await load()
  }

  const openContact = async (id: string) => {
    try {
      setContact(null)
      setContactOpen(true)
      const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' })
      const j = await res.json()
      if (j?.ok) setContact(j.order)
    } catch {}
  }

  const normalizePhone = (raw?: string | null) => {
    const digits = String(raw || '').replace(/\D/g, '')
    if (!digits) return ''
    return digits.startsWith('55') ? digits : (digits.length === 11 ? `55${digits}` : digits)
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Pedidos</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">{loading ? 'Carregando...' : `${orders.length} pedidos`}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold">Número</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Data</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Cliente</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-2 text-right text-xs font-semibold">Total</th>
                <th className="px-4 py-2 text-right text-xs font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">#{o.number}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{o.customer?.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{o.status}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{o.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => markPaid(o.id)} className="px-2 py-1 rounded border border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">Faturar</button>
                      <Link href={`/admin/orders/${o.id}/label?format=a4`} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Etiqueta A4</Link>
                      <Link href={`/admin/orders/${o.id}/label?format=100x150`} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Etiqueta 10x15</Link>
                      {o.status === 'pending' && (
                        <button onClick={() => openContact(o.id)} className="px-2 py-1 rounded border border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">Contato</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!orders.length && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum pedido encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {contactOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={()=> setContactOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700" onClick={(e)=> e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white">Entrar em contato</div>
              <button onClick={()=> setContactOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {!contact ? (
                <div className="text-gray-600 dark:text-gray-300">Carregando dados do pedido...</div>
              ) : (
                <>
                  <div className="text-gray-700 dark:text-gray-300">Pedido <span className="font-semibold">#{contact.number || contact.id}</span></div>
                  <div className="grid grid-cols-1 gap-2">
                    <a
                      href={`mailto:${contact.shippingEmail || contact.customer?.email || ''}?subject=${encodeURIComponent('Sobre o seu pedido')}&body=${encodeURIComponent('Olá! Precisamos falar sobre o seu pedido #'+(contact.number||contact.id)+'.')}`}
                      className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      Enviar e‑mail: {contact.shippingEmail || contact.customer?.email || '—'}
                    </a>
                    <a
                      href={`https://wa.me/${normalizePhone(contact.shippingPhone || contact.customer?.phone)}?text=${encodeURIComponent('Olá! Somos da loja sobre o pedido #'+(contact.number||contact.id)+'. Podemos ajudar com o pagamento/andamento?')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2 rounded border border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      WhatsApp: {contact.shippingPhone || contact.customer?.phone || '—'}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
