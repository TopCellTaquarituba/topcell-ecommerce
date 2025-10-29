"use client"

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

type Order = {
  id: string
  number: string | null
  createdAt: string
  customer?: { name?: string | null }
  shippingName?: string | null
  shippingPhone?: string | null
  shippingZip?: string | null
  shippingAddress?: string | null
  shippingNumber?: string | null
  shippingComplement?: string | null
  shippingNeighborhood?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  items: { id: string; quantity: number; price: any; product: { name: string } }[]
}

export default function OrderLabelPage() {
  const { id } = useParams<{ id: string }>()
  const search = useSearchParams()
  const format = (search.get('format') || 'a4').toLowerCase() as 'a4' | '100x150'
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setOrder(j.order))
      .catch(() => setOrder(null))
  }, [id])

  const handlePrint = () => window.print()

  if (!order) return <div className="p-8">Carregando...</div>

  const toBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={`label-root ${format === 'a4' ? 'a4' : 'thermal'}`}>
      <div className="toolbar no-print">
        <div className="left">
          <a href={`/admin/sales`} className="btn">← Voltar</a>
        </div>
        <div className="right">
          <a href={`?format=a4`} className={`btn ${format==='a4'?'active':''}`}>A4</a>
          <a href={`?format=100x150`} className={`btn ${format==='100x150'?'active':''}`}>10x15cm</a>
          <button onClick={handlePrint} className="btn primary">Imprimir / Salvar PDF</button>
        </div>
      </div>

      <div className="label">
        <div className="header">
          <div>
            <div className="title">Etiqueta de Envio</div>
            <div className="muted">Pedido #{order.number || order.id}</div>
          </div>
          <div className="muted">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</div>
        </div>

        <div className="address">
          <div className="section">
            <div className="section-title">Destinatário</div>
            <div className="value">
              <div className="bold">{order.shippingName || order.customer?.name || 'Cliente'}</div>
              <div>{order.shippingAddress} {order.shippingNumber}</div>
              {order.shippingComplement && <div>{order.shippingComplement}</div>}
              <div>{order.shippingNeighborhood}</div>
              <div>{order.shippingCity}/{order.shippingState} • CEP {order.shippingZip}</div>
              {order.shippingPhone && <div>Tel.: {order.shippingPhone}</div>}
            </div>
          </div>
        </div>

        <div className="items">
          <div className="section-title">Itens</div>
          <table>
            <thead>
              <tr><th>Produto</th><th className="qty">Qtd</th><th className="price">Total</th></tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.product.name}</td>
                  <td className="qty">{it.quantity}</td>
                  <td className="price">{toBRL(Number(it.price) * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="footer">
          <div className="muted">Impressão gerada por TopCell</div>
        </div>
      </div>

      <style jsx>{`
        .toolbar { display:flex; justify-content:space-between; gap:12px; padding:12px; background:#f3f4f6; border-bottom:1px solid #e5e7eb }
        .btn { display:inline-block; padding:8px 12px; border-radius:8px; border:1px solid #d1d5db; background:white; color:#111827; text-decoration:none }
        .btn.active { background:#e5e7eb }
        .btn.primary { background:#2563eb; color:white; border-color:#2563eb }
        .label-root { padding:16px; }
        .label-root.a4 { display:flex; justify-content:center; }
        .label-root.thermal { display:flex; justify-content:center; }
        .label { width:100%; max-width:800px; background:white; color:#111827; border:1px solid #e5e7eb; padding:16px; border-radius:8px }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
        .title { font-weight:700; font-size:18px }
        .muted { color:#6b7280; font-size:12px }
        .section { margin-bottom:12px }
        .section-title { font-weight:600; margin-bottom:6px }
        .value .bold { font-weight:600 }
        .items table { width:100%; border-collapse:collapse; }
        .items th, .items td { padding:6px 8px; border-top:1px solid #e5e7eb; font-size:12px }
        .items th.qty, .items td.qty { text-align:center; width:60px }
        .items th.price, .items td.price { text-align:right; width:120px }
        .footer { margin-top:12px; text-align:right }
        @media print {
          .no-print { display:none }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: ${format === 'a4' ? 'A4' : '100mm 150mm'}; margin: 10mm; }
          .label-root { padding:0 }
          .label { border:none; }
        }
      `}</style>
    </div>
  )
}

