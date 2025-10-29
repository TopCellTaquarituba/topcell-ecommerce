// Dynamic Prisma client loader compatible with ESM/Next.js route handlers.
// Call getPrisma() from server-side code only.

let prismaSingleton: any

export async function getPrisma() {
  if (prismaSingleton) return prismaSingleton

  let PrismaClientCtor: any
  // Prefer dynamic import to work in ESM contexts (e.g., Next.js route handlers)
  try {
    const mod: any = await import('@prisma/client')
    PrismaClientCtor = mod.PrismaClient
  } catch (_e) {
    // Fallback to require when available (CommonJS environments)
    try {
      // eslint-disable-next-line no-eval
      const req: any = (0, eval)('require')
      PrismaClientCtor = req('@prisma/client').PrismaClient
    } catch {
      throw new Error('PrismaClient not available. Install prisma and @prisma/client and run migrations.')
    }
  }

  prismaSingleton = new PrismaClientCtor()
  return prismaSingleton
}
