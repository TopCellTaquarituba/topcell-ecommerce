"use client"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CheckoutFailurePage() {
  const sp = useSearchParams()
  const status = sp.get('status') || 'rejected'
  const paymentId = sp.get('payment_id')

  return (
    <div className="container-custom py-16">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Pagamento não concluído</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">Seu pagamento não foi aprovado ou foi cancelado. Você pode tentar novamente.</p>
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-300">
        <div>status: {status}</div>
        {paymentId && <div>payment_id: {paymentId}</div>}
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/cart" className="px-5 py-3 rounded bg-primary-600 text-white hover:bg-primary-700">Voltar ao carrinho</Link>
        <Link href="/" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Voltar à loja</Link>
      </div>
    </div>
  )
}

