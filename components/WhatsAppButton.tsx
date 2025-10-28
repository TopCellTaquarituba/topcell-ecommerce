import { FaWhatsapp } from 'react-icons/fa'

interface WhatsAppButtonProps {
  phone?: string // E.164 digits only, e.g. 5599999999999
  message?: string
}

export default function WhatsAppButton({ phone, message }: WhatsAppButtonProps) {
  const number = phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const text = message || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Olá! Gostaria de tirar uma dúvida.'

  if (!number) return null

  const href = `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(text)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
    >
      <FaWhatsapp className="w-5 h-5" />
      <span className="hidden sm:block font-semibold">WhatsApp</span>
    </a>
  )
}

