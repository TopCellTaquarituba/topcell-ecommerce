"use client"
import { useEffect, useCallback, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter, useSearchParams } from 'next/navigation'

declare global { interface Window { MercadoPago?: any } }

export default function PayPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const orderId = sp.get('orderId') || ''
  const [amount, setAmount] = useState<number>(0)
  const [ready, setReady] = useState(false)
  const [pixData, setPixData] = useState<{ qr_code?: string; qr_code_base64?: string; ticket_url?: string } | null>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [payDetails, setPayDetails] = useState<any>(null)
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''
  const containerId = 'payment-brick-container'
  const loadedRef = useRef(false)

  // Load order amount
  useEffect(() => {
    async function load() {
      if (!orderId) return
      const res = await fetch(`/api/orders/${orderId}`)
      const json = await res.json()
      if (res.ok && json?.ok) setAmount(Number((json.order?.total ?? json.item?.total) || 0))
    }
    load()
  }, [orderId])

  const initBricks = useCallback(async () => {
      if (!window.MercadoPago || !publicKey || !amount || loadedRef.current) return
      loadedRef.current = true
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
      const bricksBuilder = mp.bricks()
      await bricksBuilder.create('payment', containerId, {
        initialization: { amount, payer: { email: '', entityType: 'individual' } },
        customization: {
          visual: { style: { theme: 'default' } },
          // Exibir Pix (bankTransfer) e Cartão; valores: 'all' | false
          paymentMethods: { bankTransfer: 'all', creditCard: 'all' },
        },
        callbacks: {
          onReady: () => setReady(true),
          onError: (error: any) => {
            console.error('MP Brick error', error)
            alert('Falha ao carregar o componente de pagamento. Verifique as credenciais e tente novamente.')
          },
          onSubmit: async (data: any) => {
            // O objeto recebido é { formData }, então precisamos desestruturá-lo
            const { formData } = data;
            setPayError(null); setPayDetails(null)
            const res = await fetch('/api/mp/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, ...formData }) })
            const json = await res.json().catch(()=>({}))
            if (!res.ok || !json?.status) {
              setPayError(json?.error || 'Pagamento falhou')
              setPayDetails(json?.details || null)
              console.error('Pagamento 400:', json)
              return
            }
            if (json?.pix) { // Se a API retornar dados de PIX
              setPixData(json.pix)
              return
            }
            // Card approved or pending
            const status = String(json.status || '')
            if (status === 'approved') router.push(`/checkout/success?orderId=${orderId}`)
            else if (status === 'in_process') router.push(`/checkout/pending?orderId=${orderId}`)
            else router.push(`/checkout/failure?orderId=${orderId}`)
          },
        },
      })
    }, [amount, orderId, publicKey, router])

  useEffect(() => { initBricks() }, [amount, initBricks])

  return (
    <div className="container-custom py-10">
      <Script id="mp-sdk" src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" onLoad={() => initBricks()} />
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Pagamento</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">Pedido: {orderId} — Total: R$ {amount.toFixed(2).replace('.', ',')}</p>
      {!publicKey && (
        <div className="mb-4 p-3 rounded border border-yellow-200 bg-yellow-50 text-yellow-800">Defina NEXT_PUBLIC_MP_PUBLIC_KEY no .env.local para carregar o componente.</div>
      )}
      {!amount && (
        <div className="mb-4 p-3 rounded border border-gray-200 bg-gray-50 text-gray-700">Carregando valor do pedido…</div>
      )}
      <div id={containerId} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700" />
      {payError && (
        <div className="mt-4 p-3 rounded border border-red-300 bg-red-50 text-red-800 text-sm">
          <div className="font-semibold">Falha ao processar pagamento</div>
          <div className="mt-1">{payError}</div>
          {payDetails && (
            <pre className="mt-2 whitespace-pre-wrap text-xs opacity-80">{JSON.stringify(payDetails, null, 2)}</pre>
          )}
        </div>
      )}
      {pixData && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-3 dark:text-white">Pague com Pix</h2>
            {pixData.qr_code_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-64 h-64" />
            ) : null}
          </div>
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2 dark:text-white">Copia e cola</h3>
            <textarea readOnly value={pixData.qr_code || ''} className="w-full h-32 border rounded p-2 bg-gray-50 dark:bg-gray-900 text-sm" />
            <button type="button" onClick={() => { navigator.clipboard.writeText(pixData.qr_code || '') }} className="mt-2 px-4 py-2 rounded bg-primary-600 text-white">Copiar código</button>
            {pixData.ticket_url && (
              <a href={pixData.ticket_url} target="_blank" className="block mt-3 text-primary-600">Abrir no Mercado Pago</a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
