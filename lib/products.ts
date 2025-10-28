export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  brand: string
  rating: number
  description: string
  specifications: { [key: string]: string }
  images: string[]
  inStock: boolean
  createdAt?: string
  reviews?: Review[]
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  verified: boolean
}

export function getProducts(): Product[] {
  return [
    // Smartphones
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 8999,
      originalPrice: 9999,
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
      category: 'smartphones',
      brand: 'Apple',
      rating: 4.8,
      description: 'O mais recente iPhone com chip A17 Pro e câmera profissional.',
      specifications: {
        'Tela': '6.7" Super Retina XDR',
        'Processador': 'A17 Pro',
        'RAM': '8GB',
        'Armazenamento': '256GB',
        'Câmera': '48MP + 12MP + 12MP',
        'Bateria': '4422 mAh'
      },
      images: [
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'
      ],
      inStock: true,
      reviews: [
        {
          id: '1',
          userId: 'user1',
          userName: 'Maria Silva',
          rating: 5,
          title: 'Excelente qualidade!',
          comment: 'Produto incrível, superou minhas expectativas. A câmera é fantástica e a bateria dura o dia todo.',
          date: '2024-01-15',
          helpful: 12,
          verified: true
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'João Santos',
          rating: 4,
          title: 'Muito bom, mas caro',
          comment: 'O produto é excelente, mas o preço está bem alto. Vale a pena se você tem o orçamento.',
          date: '2024-01-10',
          helpful: 8,
          verified: true
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Ana Costa',
          rating: 5,
          title: 'Perfeito para trabalho',
          comment: 'Uso para trabalho e lazer. A qualidade da tela e o desempenho são excepcionais.',
          date: '2024-01-08',
          helpful: 15,
          verified: false
        }
      ]
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      price: 7499,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      category: 'smartphones',
      brand: 'Samsung',
      rating: 4.7,
      description: 'Flagship Samsung com S Pen e câmera de 200MP.',
      specifications: {
        'Tela': '6.8" Dynamic AMOLED 2X',
        'Processador': 'Snapdragon 8 Gen 3',
        'RAM': '12GB',
        'Armazenamento': '512GB',
        'Câmera': '200MP + 50MP + 12MP + 10MP',
        'Bateria': '5000 mAh'
      },
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
      inStock: true
    },
    {
      id: '3',
      name: 'Xiaomi 14 Pro',
      price: 4999,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
      category: 'smartphones',
      brand: 'Xiaomi',
      rating: 4.6,
      description: 'High-end com Leica lenses e Snapdragon 8 Gen 3.',
      specifications: {
        'Tela': '6.73" LTPO OLED',
        'Processador': 'Snapdragon 8 Gen 3',
        'RAM': '12GB',
        'Armazenamento': '512GB',
        'Câmera': '50MP Leica',
        'Bateria': '4880 mAh'
      },
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'],
      inStock: true
    },
    {
      id: '4',
      name: 'OnePlus 12',
      price: 5499,
      image: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=500',
      category: 'smartphones',
      brand: 'OnePlus',
      rating: 4.5,
      description: 'Fast charging e snapdragon 8 gen 3.',
      specifications: {
        'Tela': '6.82" LTPO AMOLED',
        'Processador': 'Snapdragon 8 Gen 3',
        'RAM': '12GB',
        'Armazenamento': '256GB',
        'Câmera': '50MP + 48MP + 64MP',
        'Bateria': '5400 mAh'
      },
      images: ['https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=500'],
      inStock: true
    },
    // Laptops
    {
      id: '5',
      name: 'MacBook Pro 16" M3 Max',
      price: 22999,
      originalPrice: 24999,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      category: 'laptops',
      brand: 'Apple',
      rating: 4.9,
      description: 'O notebook mais poderoso da Apple com chip M3 Max.',
      specifications: {
        'Tela': '16.2" Liquid Retina XDR',
        'Processador': 'M3 Max',
        'RAM': '32GB',
        'Armazenamento': '1TB SSD',
        'GPU': '38-core',
        'Bateria': 'Até 22h'
      },
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      inStock: true
    },
    {
      id: '6',
      name: 'Dell XPS 15',
      price: 11999,
      image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500',
      category: 'laptops',
      brand: 'Dell',
      rating: 4.7,
      description: 'Notebook premium com Intel i9 e RTX 4070.',
      specifications: {
        'Tela': '15.6" 4K OLED',
        'Processador': 'Intel i9-13900H',
        'RAM': '32GB',
        'Armazenamento': '1TB SSD',
        'GPU': 'RTX 4070',
        'Bateria': '6h'
      },
      images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
      inStock: true
    },
    {
      id: '7',
      name: 'HP Spectre x360',
      price: 9999,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
      category: 'laptops',
      brand: 'HP',
      rating: 4.6,
      description: '2 em 1 convertível premium.',
      specifications: {
        'Tela': '13.5" 3K OLED',
        'Processador': 'Intel i7-13700H',
        'RAM': '16GB',
        'Armazenamento': '1TB SSD',
        'GPU': 'Intel Iris Xe',
        'Bateria': 'Até 12h'
      },
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
      inStock: true
    },
    {
      id: '8',
      name: 'ASUS ROG Strix G16',
      price: 13999,
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500',
      category: 'laptops',
      brand: 'ASUS',
      rating: 4.8,
      description: 'Gaming notebook com RTX 4080.',
      specifications: {
        'Tela': '16" 144Hz QHD',
        'Processador': 'Intel i9-13980HX',
        'RAM': '32GB',
        'Armazenamento': '2TB SSD',
        'GPU': 'RTX 4080',
        'Bateria': '4h'
      },
      images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'],
      inStock: true
    },
    // Accessories
    {
      id: '9',
      name: 'AirPods Pro 2',
      price: 2299,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b7c8e55783?w=500',
      category: 'accessories',
      brand: 'Apple',
      rating: 4.7,
      description: 'Fones com cancelamento de ruído ativo e áudio espacial.',
      specifications: {
        'Tipo': 'Bluetooth',
        'Cancelamento': 'ANC',
        'Bateria': '6h + 24h case',
        'Conectividade': 'Bluetooth 5.3',
        'Microfone': '6 microfones',
        'Resistência': 'IPX4'
      },
      images: ['https://images.unsplash.com/photo-1606220945770-b5b7c8e55783?w=500'],
      inStock: true
    },
    {
      id: '10',
      name: 'Samsung Galaxy Buds2 Pro',
      price: 1199,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      category: 'accessories',
      brand: 'Samsung',
      rating: 4.6,
      description: 'Earbuds premium com áudio Hi-Fi.',
      specifications: {
        'Tipo': 'Bluetooth',
        'Cancelamento': 'ANC',
        'Bateria': '8h + 20h case',
        'Conectividade': 'Bluetooth 5.3',
        'Qualidade': '24-bit Hi-Fi',
        'Resistência': 'IPX7'
      },
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      inStock: true
    },
    {
      id: '11',
      name: 'Apple Watch Ultra 2',
      price: 7999,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
      category: 'accessories',
      brand: 'Apple',
      rating: 4.8,
      description: 'O relógio mais robusto da Apple para aventuras extremas.',
      specifications: {
        'Tela': '49mm LTPO OLED',
        'Processador': 'S9 SiP',
        'Armazenamento': '64GB',
        'Bateria': '36h',
        'Resistência': 'WR100',
        'GPS': 'Dual'
      },
      images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'],
      inStock: true
    },
    {
      id: '12',
      name: 'Logitech MX Master 3S',
      price: 599,
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500',
      category: 'accessories',
      brand: 'Logitech',
      rating: 4.7,
      description: 'Mouse sem fio premium para produtividade.',
      specifications: {
        'Sensor': 'Darkfield 8000 DPI',
        'Conectividade': 'Bluetooth + USB Receiver',
        'Bateria': '70 dias',
        'Botões': '7 botões programáveis',
        'Scroll': 'Magnetic',
        'Compatibilidade': 'Multi-device'
      },
      images: ['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500'],
      inStock: true
    },
    {
      id: '13',
      name: 'iPad Pro 12.9" M2',
      price: 12999,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
      category: 'tablets',
      brand: 'Apple',
      rating: 4.8,
      description: 'Tablet profissional com chip M2 e display Liquid Retina.',
      specifications: {
        'Tela': '12.9" Liquid Retina XDR',
        'Processador': 'M2',
        'RAM': '16GB',
        'Armazenamento': '512GB',
        'Câmera': '12MP + 10MP',
        'Conectividade': 'Wi-Fi + 5G'
      },
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'],
      inStock: true
    },
    {
      id: '14',
      name: 'Samsung Galaxy Tab S9 Ultra',
      price: 9999,
      image: 'https://images.unsplash.com/photo-1587103477887-68c79e35480a?w=500',
      category: 'tablets',
      brand: 'Samsung',
      rating: 4.7,
      description: 'Tablet Samsung de 14.6" com S Pen.',
      specifications: {
        'Tela': '14.6" Dynamic AMOLED 2X',
        'Processador': 'Snapdragon 8 Gen 2',
        'RAM': '12GB',
        'Armazenamento': '512GB',
        'S Pen': 'Incluso',
        'Resistência': 'IP68'
      },
      images: ['https://images.unsplash.com/photo-1587103477887-68c79e35480a?w=500'],
      inStock: true
    },
    {
      id: '15',
      name: 'Google Pixel 8 Pro',
      price: 5999,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      category: 'smartphones',
      brand: 'Google',
      rating: 4.6,
      description: 'Smartphone Google com IA avançada e câmera excepcional.',
      specifications: {
        'Tela': '6.7" LTPO OLED',
        'Processador': 'Tensor G3',
        'RAM': '12GB',
        'Armazenamento': '256GB',
        'Câmera': '50MP + 48MP + 48MP',
        'Bateria': '5050 mAh'
      },
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
      inStock: true
    },
    {
      id: '16',
      name: 'ASUS ZenBook Pro 16X',
      price: 15999,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      category: 'laptops',
      brand: 'ASUS',
      rating: 4.8,
      description: 'Notebook criativo com mini LED e Intel i9.',
      specifications: {
        'Tela': '16" 4K mini LED',
        'Processador': 'Intel i9-13900H',
        'RAM': '32GB',
        'Armazenamento': '2TB SSD',
        'GPU': 'RTX 4070',
        'Bateria': '8h'
      },
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      inStock: true
    },
  ]
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return getProducts().filter((product) => product.category === category)
}
