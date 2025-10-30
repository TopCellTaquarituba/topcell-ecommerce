"use client"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CheckoutPendingPage() {
  const sp = useSearchParams()
  const status = sp.get('status') || 'pending'
  const paymentId = sp.get('payment_id')

  return (
    <div className="container-custom py-16">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Pagamento em análise</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">Recebemos o seu pagamento e ele está sendo processado pelo Mercado Pago. Assim que houver atualização, avisaremos.</p>
      <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-300">
        <div>status: {status}</div>
        {paymentId && <div>payment_id: {paymentId}</div>}
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/orders" className="px-5 py-3 rounded bg-primary-600 text-white hover:bg-primary-700">Ver meus pedidos</Link>
        <Link href="/" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Voltar à loja</Link>
      </div>
    </div>
  )
}

