"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi"

type QA = { q: string; a: string; category: string }

const FAQ_DATA: QA[] = [
  // Pedidos
  { category: "Pedidos", q: "Como faço um pedido?", a: "Adicione os produtos ao carrinho, informe endereço e confirme. Você será direcionado ao pagamento pelo Mercado Pago.", },
  { category: "Pedidos", q: "Como acompanho meu pedido?", a: "Acesse Meus Pedidos no menu da sua conta. Você receberá e-mail quando o status for atualizado.", },
  // Pagamentos
  { category: "Pagamentos", q: "Quais formas de pagamento são aceitas?", a: "Cartão de crédito, Pix e boleto via Mercado Pago. Parcelamento disponível conforme condições exibidas no checkout.", },
  { category: "Pagamentos", q: "Meu pagamento não foi aprovado. O que faço?", a: "Confira os dados do cartão, limite e saldo. Se persistir, tente outra forma (Pix/Boleto) ou fale com o banco emissor.", },
  // Entregas
  { category: "Entregas", q: "Quais são os prazos de entrega?", a: "O prazo é calculado no checkout de acordo com o CEP e a modalidade (Correios/transportadora).", },
  { category: "Entregas", q: "Recebi o código de rastreio?", a: "Assim que o pedido é postado, enviamos o código por e-mail e ele aparece nos detalhes do pedido.", },
  // Trocas e Devoluções
  { category: "Trocas e Devoluções", q: "Posso devolver um produto?", a: "Sim. Você pode solicitar devolução em até 7 dias corridos após o recebimento, conforme o CDC, em perfeitas condições e com acessórios.", },
  { category: "Trocas e Devoluções", q: "Como solicito etiqueta reversa?", a: "Acesse a página Envio e Devolução e clique em 'Entrar em contato para etiqueta reversa' para falar conosco pelo WhatsApp.", },
  // Conta
  { category: "Conta", q: "Preciso ter conta para comprar?", a: "Não é obrigatório, mas recomendamos criar conta para acompanhar seus pedidos e agilizar futuras compras.", },
  { category: "Conta", q: "Esqueci minha senha. E agora?", a: "Use a opção de recuperação na tela de login para redefinir sua senha.", },
  // Segurança
  { category: "Segurança", q: "Meus dados estão seguros?", a: "Sim. Utilizamos conexões seguras (HTTPS) e processamos pagamentos pelo Mercado Pago, que é certificado e confiável.", },
]

export default function FAQPage() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const categories = useMemo(
    () => Array.from(new Set(FAQ_DATA.map((i) => i.category))),
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FAQ_DATA
    return FAQ_DATA.filter((item) =>
      item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    )
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<string, QA[]>()
    for (const c of categories) map.set(c, [])
    for (const item of filtered) {
      const arr = map.get(item.category) || []
      arr.push(item)
      map.set(item.category, arr)
    }
    return map
  }, [filtered, categories])

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">FAQ – Perguntas Frequentes</h1>
      <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
        Reunimos aqui as principais dúvidas sobre pedidos, pagamentos, entregas e devoluções.
        Se ainda precisar de ajuda, visite a página <Link href="/shipping" className="text-primary-600">Envio e Devolução</Link> para falar conosco.
      </p>

      <div className="mt-6 max-w-2xl">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
          <FiSearch className="w-5 h-5 text-gray-500" />
          <input
            value={query}
            onChange={(e)=> setQuery(e.target.value)}
            placeholder="Busque por palavras-chave (ex.: Pix, entrega, devolução)"
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {categories.map((cat) => {
          const items = grouped.get(cat) || []
          if (items.length === 0) return null
          return (
            <section key={cat}>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{cat}</h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {items.map((item, idx) => {
                  const k = `${cat}-${idx}`
                  const isOpen = !!open[k]
                  return (
                    <div key={k}>
                      <button
                        onClick={() => setOpen((s) => ({ ...s, [k]: !s[k] }))}
                        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{item.q}</span>
                        {isOpen ? (
                          <FiChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

