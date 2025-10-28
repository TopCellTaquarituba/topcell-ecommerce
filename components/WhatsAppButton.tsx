"use client"

import { FaWhatsapp } from 'react-icons/fa'

interface WhatsAppButtonProps {
  phone?: string // E.164 digits only, e.g. 5599999999999
  message?: string
}

export default function WhatsAppButton({ phone, message }: WhatsAppButtonProps) {
  // Padrão solicitado: "14 99622-8136" (DDD 14 – Brasil)
  const RAW_DEFAULT = '14 99622-8136'
  const DEFAULT_MESSAGE = 'Olá! Vim pelo site e gostaria de atendimento.'

  const rawNumber = phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || RAW_DEFAULT
  const text = message || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || DEFAULT_MESSAGE

  // Sanitiza e garante código do país BR (55) se vier apenas DDD+numero
  const digits = String(rawNumber).replace(/\D/g, '')
  const normalized = digits.startsWith('55') ? digits : digits.length === 11 ? `55${digits}` : digits

  const href = `https://wa.me/${encodeURIComponent(normalized)}?text=${encodeURIComponent(text)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      title={`WhatsApp: +${normalized}`}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
    >
      <FaWhatsapp className="w-5 h-5" />
      <span className="hidden sm:block font-semibold">WhatsApp</span>
    </a>
  )
}

