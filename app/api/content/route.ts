import { NextRequest, NextResponse } from 'next/server'
import { loadContent, saveContent } from '@/lib/contentStore'

export async function GET() {
  const content = await loadContent()
  return NextResponse.json(content)
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    await saveContent(body)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'invalid payload' }, { status: 400 })
  }
}

