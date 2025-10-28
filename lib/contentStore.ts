import { defaultContent, CMSContent } from '@/lib/contentDefaults'
import { getPrisma } from '@/lib/prisma'
import fs from 'node:fs'
import path from 'node:path'

const DATA_PATH = path.join(process.cwd(), 'data', 'content.json')

function ensureDir(p: string) {
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function readFileFallback(): Promise<CMSContent> {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return defaultContent
  }
}

async function writeFileFallback(content: CMSContent) {
  ensureDir(DATA_PATH)
  await fs.promises.writeFile(DATA_PATH, JSON.stringify(content, null, 2), 'utf-8')
}

export async function loadContent(): Promise<CMSContent> {
  if (!process.env.DATABASE_URL) return readFileFallback()
  try {
    const prisma = await getPrisma()
    const row = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
    if (!row) return defaultContent
    const heroSlides = (row.heroSlides as any) || defaultContent.heroSlides
    const about = (row.about as any) || defaultContent.about
    return { heroSlides, about }
  } catch {
    return readFileFallback()
  }
}

export async function saveContent(content: CMSContent) {
  // basic validation
  if (!Array.isArray(content.heroSlides) || !content.about) {
    throw new Error('Invalid content payload')
  }
  if (!process.env.DATABASE_URL) {
    return writeFileFallback(content)
  }
  try {
    const prisma = await getPrisma()
    await prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', heroSlides: content.heroSlides, about: content.about },
      update: { heroSlides: content.heroSlides, about: content.about },
    })
  } catch (e) {
    await writeFileFallback(content)
  }
}

