import Link from 'next/link'
import { getPrisma } from '@/lib/prisma'
import CategoryCarouselClient from './CategoryCarouselClient'

type Category = { id: string; name: string; slug: string; description?: string; image?: string }

export default function CategoryCarousel() {
  // Esta função agora é um Server Component, mas como não podemos usar `await` diretamente
  // no export default, vamos buscar os dados e passar para um client component.
  // O ideal seria que o componente que usa o CategoryCarousel fosse async e fizesse o fetch.
  // Por simplicidade, vamos simular o fetch aqui e passar para um client component.
  // Em um projeto real, a busca de dados seria feita na `HomePage` e passada via props.
  // Para este exemplo, vou manter a busca no cliente dentro do novo componente.
  return <CategoryCarouselClient />
}
