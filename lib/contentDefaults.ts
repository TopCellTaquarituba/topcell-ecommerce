export type CMSSlide = {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  link: string
  linkText: string
}

export type CMSAbout = {
  title: string
  subtitle: string
  paragraphs: string[]
  mission: string
}

export type CMSContent = {
  heroSlides: CMSSlide[]
  about: CMSAbout
}

export const defaultContent: CMSContent = {
  heroSlides: [
    {
      id: 1,
      title: 'Tecnologia de Ponta',
      subtitle: 'Bem-vindo à TopCell',
      description: 'Os melhores smartphones e gadgets do mercado com tecnologia de última geração',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1920',
      link: '/products?category=smartphones',
      linkText: 'Ver Smartphones',
    },
    {
      id: 2,
      title: 'Produtividade sem Limites',
      subtitle: 'Notebooks Potentes',
      description: 'Encontre o notebook ideal para seu trabalho e criatividade',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920',
      link: '/products?category=laptops',
      linkText: 'Ver Notebooks',
    },
    {
      id: 3,
      title: 'Complete seu Setup',
      subtitle: 'Acessórios Essenciais',
      description: 'Fones, carregadores e muito mais para turbinar seus dispositivos',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920',
      link: '/products?category=accessories',
      linkText: 'Ver Acessórios',
    },
  ],
  about: {
    title: 'Sobre a TopCell',
    subtitle: 'Há mais de 15 anos, somos referência em tecnologia no Brasil, oferecendo os melhores produtos eletrônicos com qualidade, confiança e atendimento excepcional.',
    paragraphs: [
      'Fundada em 2009, a TopCell nasceu da paixão por tecnologia e do desejo de democratizar o acesso aos melhores produtos eletrônicos do mercado. Começamos como uma pequena loja física em São Paulo, especializada em smartphones e acessórios.',
      'Com o crescimento do e-commerce, expandimos nossa presença digital e hoje atendemos clientes em todo o Brasil. Nossa missão sempre foi oferecer produtos de qualidade com preços justos e um atendimento que realmente faz a diferença.',
      'Hoje, somos uma das principais referências em eletrônicos online, com mais de 50 mil clientes satisfeitos e uma equipe especializada pronta para ajudar você a encontrar exatamente o que precisa.',
    ],
    mission:
      '“Democratizar o acesso à tecnologia de qualidade, oferecendo produtos eletrônicos inovadores com preços justos, atendimento excepcional e garantia total da satisfação do cliente.”',
  },
}

