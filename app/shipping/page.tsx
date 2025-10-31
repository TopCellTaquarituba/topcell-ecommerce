"use client"

import Link from "next/link"
import { useMemo } from "react"
import { FiMail, FiPhone, FiArrowRight } from "react-icons/fi"

function buildWhatsAppHref(text?: string) {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14 99622-8136"
  const digits = String(raw).replace(/\D/g, "")
  const normalized = digits.startsWith("55") ? digits : digits.length === 11 ? `55${digits}` : digits
  const msg = text || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Olá! Preciso de ajuda com envio/devolução."
  return `https://wa.me/${encodeURIComponent(normalized)}?text=${encodeURIComponent(msg)}`
}

export default function ShippingReturnsPage() {
  const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL || process.env.STORE_EMAIL || "loja@example.com"
  const whatsappHref = useMemo(() => buildWhatsAppHref("Olá! Gostaria de solicitar etiqueta reversa."), [])

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Envio e Devolução</h1>
      <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
        Aqui você encontra informações sobre prazos, formas de envio e como solicitar devolução.
        Precisa de suporte? Fale com a nossa equipe pelos canais abaixo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">Prazos e envio</h2>
          <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Processamento do pedido em até 1 dia útil.</li>
            <li>Envios via Correios e transportadoras parceiras.</li>
            <li>O prazo final depende do CEP e da modalidade escolhida no checkout.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">Devoluções</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Você pode solicitar devolução em até 7 (sete) dias corridos após o recebimento, conforme o CDC.
            O produto deve estar em perfeitas condições, com acessórios e embalagem.
          </p>
          <div className="mt-4">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white hover:bg-green-500">
              Entrar em contato para etiqueta reversa <FiArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>

      <section className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Canais de suporte</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={`mailto:${storeEmail}`} className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
            <FiMail className="w-5 h-5" /> {storeEmail}
          </a>
          <a href={buildWhatsAppHref()} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
            <FiPhone className="w-5 h-5" /> WhatsApp
          </a>
          <Link href="/faq" className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
            FAQ
          </Link>
        </div>
      </section>
    </div>
  )
}

