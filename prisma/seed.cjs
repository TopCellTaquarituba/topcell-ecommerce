/* eslint-disable no-console */
const { PrismaClient, Prisma } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Categories
  const categories = [
    { slug: 'smartphones', name: 'Smartphones' },
    { slug: 'notebooks', name: 'Notebooks' },
    { slug: 'acessorios', name: 'Acessórios' },
    { slug: 'tablets', name: 'Tablets' },
  ]
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c })
  }

  // Brands
  const brands = [
    { slug: 'apple', name: 'Apple' },
    { slug: 'samsung', name: 'Samsung' },
  ]
  for (const b of brands) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: { name: b.name }, create: b })
  }

  // Products
  const prods = [
    {
      name: 'iPhone 15 Pro',
      description: 'Smartphone Apple com chip A17 Pro e câmera avançada',
      price: new Prisma.Decimal(8999.0),
      originalPrice: new Prisma.Decimal(9499.0),
      image: 'https://images.unsplash.com/photo-1695048133533-iphone15',
      images: [],
      categorySlug: 'smartphones',
      brandSlug: 'apple',
    },
    {
      name: 'Galaxy S24',
      description: 'Smartphone Samsung topo de linha',
      price: new Prisma.Decimal(7499.0),
      originalPrice: new Prisma.Decimal(7999.0),
      image: 'https://images.unsplash.com/photo-169505-s24',
      images: [],
      categorySlug: 'smartphones',
      brandSlug: 'samsung',
    },
    {
      name: 'MacBook Pro 16"',
      description: 'Notebook Apple com alto desempenho',
      price: new Prisma.Decimal(22999.0),
      originalPrice: new Prisma.Decimal(23999.0),
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef',
      images: [],
      categorySlug: 'notebooks',
      brandSlug: 'apple',
    },
  ]

  const createdProducts = []
  for (const p of prods) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        images: p.images,
        category: { connect: { slug: p.categorySlug } },
        brand: { connect: { slug: p.brandSlug } },
        rating: 4.5,
      },
    })
    createdProducts.push(product)
  }

  // Customers
  const customer = await prisma.customer.upsert({
    where: { email: 'cliente@example.com' },
    update: { name: 'Cliente Demo' },
    create: { name: 'Cliente Demo', email: 'cliente@example.com', phone: '+55 11 90000-0000' },
  })

  // Orders with items
  const p1 = createdProducts[0]
  const p2 = createdProducts[1]

  const order1Total = p1.price.add(new Prisma.Decimal(0)).mul(1)
  const order1 = await prisma.order.create({
    data: {
      number: '1001',
      status: 'paid',
      total: order1Total,
      customer: { connect: { id: customer.id } },
      items: {
        create: [
          { product: { connect: { id: p1.id } }, quantity: 1, price: p1.price },
        ],
      },
    },
  })

  const order2Total = p2.price.mul(2)
  const order2 = await prisma.order.create({
    data: {
      number: '1002',
      status: 'shipped',
      total: order2Total,
      customer: { connect: { id: customer.id } },
      items: {
        create: [
          { product: { connect: { id: p2.id } }, quantity: 2, price: p2.price },
        ],
      },
    },
  })

  // Site settings (CMS)
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      heroSlides: [
        { id: 1, title: 'Tecnologia de Ponta', subtitle: 'Bem-vindo à TopCell', description: 'Os melhores produtos', image: '', link: '/products', linkText: 'Ver produtos' },
      ],
      about: { title: 'Sobre Nós', subtitle: 'Qualidade e Inovação', paragraphs: ['Somos uma loja demo.'], mission: 'Atender bem.' },
    },
    create: {
      id: 'default',
      heroSlides: [
        { id: 1, title: 'Tecnologia de Ponta', subtitle: 'Bem-vindo à TopCell', description: 'Os melhores produtos', image: '', link: '/products', linkText: 'Ver produtos' },
      ],
      about: { title: 'Sobre Nós', subtitle: 'Qualidade e Inovação', paragraphs: ['Somos uma loja demo.'], mission: 'Atender bem.' },
    },
  })

  console.log('Seed concluído:', { products: createdProducts.length, orders: [order1.number, order2.number] })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

