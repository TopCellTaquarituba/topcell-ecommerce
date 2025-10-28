"use client"

import { useState } from 'react'

type QA = { q: string; a: string }

const DEFAULT_FAQ: QA[] = [
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos cartão de crédito, PIX e boleto bancário. Em alguns produtos é possível parcelar sem juros.'
  },
  {
    q: 'Qual o prazo de entrega?',
    a: 'O prazo varia conforme sua região e modalidade de envio escolhida. Você verá o prazo estimado no checkout e recebe o código de rastreio por e‑mail.'
  },
  {
    q: 'Posso trocar ou devolver um produto?',
    a: 'Sim. Em até 7 dias corridos após o recebimento você pode solicitar devolução, e em até 30 dias trocas por defeito de fabricação, seguindo nossa política de trocas e devoluções.'
  },
  {
    q: 'Os produtos têm garantia?',
    a: 'Todos os produtos possuem garantia do fabricante. O prazo varia por marca e consta na página do produto e na nota fiscal.'
  },
  {
    q: 'Como falar com o suporte?',
    a: 'Você pode nos chamar pelo WhatsApp no botão fixo da página ou pelo e‑mail de atendimento informado no rodapé.'
  }
]

export default function FAQSection({ items = DEFAULT_FAQ }: { items?: QA[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Perguntas Frequentes</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          Encontre respostas rápidas sobre compras, envios, trocas e suporte.
        </p>

        <div className="space-y-4">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-between"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{item.q}</span>
                  <span className={`ml-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-5 py-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((i) => ({
              '@type': 'Question',
              name: i.q,
              acceptedAnswer: { '@type': 'Answer', text: i.a },
            })),
          }),
        }}
      />
    </section>
  )
}

