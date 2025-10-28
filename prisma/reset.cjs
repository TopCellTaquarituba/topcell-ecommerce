/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Delete respecting FKs
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.inventoryMovement.deleteMany().catch(()=>{})
  await prisma.review.deleteMany().catch(()=>{})
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.syncLog.deleteMany().catch(()=>{})
  await prisma.siteSettings.deleteMany().catch(()=>{})
  console.log('Banco limpo: todos os dados de exemplo removidos.')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => prisma.$disconnect())

