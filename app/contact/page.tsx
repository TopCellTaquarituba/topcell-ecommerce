"use client"

import { FiMail, FiPhone, FiMapPin, FiInstagram, FiArrowRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

function buildWhatsAppHref(text?: string) {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '14 99622-8136'
  const digits = String(raw).replace(/\D/g, '')
  const normalized = digits.startsWith('55') ? digits : digits.length === 11 ? `55${digits}` : digits
  const msg = text || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Olá! Vim pelo site e gostaria de atendimento.'
  return `https://wa.me/${encodeURIComponent(normalized)}?text=${encodeURIComponent(msg)}`
}

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_STORE_EMAIL || process.env.STORE_EMAIL || 'loja@example.com'
  const phoneRaw = process.env.NEXT_PUBLIC_STORE_PHONE || '14 99622-8136'
  const phoneDigits = String(phoneRaw).replace(/\D/g, '')
  const phoneE164 = phoneDigits.startsWith('55') ? `+${phoneDigits}` : phoneDigits.length === 11 ? `+55${phoneDigits}` : `+${phoneDigits}`
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM?.replace(/^@/, '') || 'topcelloficial'
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Taquarituba - SP'
  const mapsUrl = (process.env.NEXT_PUBLIC_STORE_MAPS_URL || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`)

  const whatsappHref = buildWhatsAppHref()

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Canais de Contato</h1>
      <p className="text-gray-700 dark:text-gray-300 max-w-3xl">Fale com a nossa equipe pelos canais abaixo. Será um prazer ajudar!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        <a href={`mailto:${email}`} className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-2">
            <FiMail className="w-5 h-5" />
            <h2 className="text-lg font-semibold dark:text-white">E‑mail</h2>
          </div>
          <div className="text-gray-700 dark:text-gray-300">{email}</div>
        </a>

        <a href={`tel:${phoneE164}`} className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-2">
            <FiPhone className="w-5 h-5" />
            <h2 className="text-lg font-semibold dark:text-white">Telefone</h2>
          </div>
          <div className="text-gray-700 dark:text-gray-300">{phoneRaw}</div>
        </a>

        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-2">
            <FaWhatsapp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold dark:text-white">WhatsApp</h2>
          </div>
          <div className="text-gray-700 dark:text-gray-300">Abrir conversa <FiArrowRight className="inline w-4 h-4 ml-1" /></div>
        </a>

        <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-2">
            <FiInstagram className="w-5 h-5" />
            <h2 className="text-lg font-semibold dark:text-white">Instagram</h2>
          </div>
          <div className="text-gray-700 dark:text-gray-300">@{instagram}</div>
        </a>

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition md:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <FiMapPin className="w-5 h-5" />
            <h2 className="text-lg font-semibold dark:text-white">Localização</h2>
          </div>
          <div className="text-gray-700 dark:text-gray-300">{address}</div>
          <div className="text-xs text-primary-600 mt-1">Ver no mapa</div>
        </a>
      </div>
    </div>
  )
}

