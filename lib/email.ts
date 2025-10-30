import nodemailer from 'nodemailer'

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !port || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  try {
    const transport = getTransport()
    if (!transport) return { ok: false, error: 'smtp_not_configured' as const }
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com'
    await transport.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text })
    return { ok: true as const }
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'send_failed' }
  }
}

