// Dynamic Prisma client to avoid compile-time dependency before installation.
// Call getPrisma() from server-side code only.

let prismaSingleton: any

export async function getPrisma() {
  if (prismaSingleton) return prismaSingleton
  // Bypass webpack resolution to avoid build-time dependency before install
  const dynamicRequire = (0, eval)('require') as NodeRequire
  let PrismaClient: any
  try {
    PrismaClient = dynamicRequire('@prisma/client').PrismaClient
  } catch {
    throw new Error('PrismaClient not available. Install prisma and @prisma/client and run migrations.')
  }
  prismaSingleton = new PrismaClient()
  return prismaSingleton
}
