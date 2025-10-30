"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const sp = useSearchParams()
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    try {
      const last = localStorage.getItem('lastOrderId')
      if (last) setOrderNumber(last)
    } catch {}
  }, [])

  const paymentId = sp.get('payment_id')
  const status = sp.get('status') || 'approved'
  const preferenceId = sp.get('preference_id')

  return (
    <div className="container-custom py-16">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Pagamento aprovado</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Recebemos a confirmação do Mercado Pago. {orderNumber && (<>Seu pedido <span className="font-semibold">#{orderNumber}</span> foi registrado.</>)}
      </p>
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-300">
        <div>status: {status}</div>
        {paymentId && <div>payment_id: {paymentId}</div>}
        {preferenceId && <div>preference_id: {preferenceId}</div>}
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/orders" className="px-5 py-3 rounded bg-primary-600 text-white hover:bg-primary-700">Ver meus pedidos</Link>
        <Link href="/" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Voltar à loja</Link>
      </div>
    </div>
  )
}

