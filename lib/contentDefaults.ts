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
  imageUrl?: string
  imageTitle?: string
  imageSubtitle?: string
}

export type CMSContent = {
  heroSlides: CMSSlide[]
  about: CMSAbout
}

export const defaultContent: CMSContent = {
  heroSlides: [],
  about: {
    title: '',
    subtitle: '',
    paragraphs: [],
    mission: '',
    imageUrl: '',
    imageTitle: '',
    imageSubtitle: '',
  },
}
