"use client"
import { useEffect, useState } from 'react'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/orders?mine=1', { cache: 'no-store' })
        const json = await res.json()
        if (res.ok && json?.ok) setOrders(json.orders || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Meus pedidos</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">Você ainda não tem pedidos.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o)=> (
            <div key={o.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="font-semibold dark:text-white">Pedido #{o.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-2 text-sm">
                <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{o.status}</span>
                <span className="ml-3 font-semibold dark:text-white">Total: R$ {Number(o.total || 0).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

