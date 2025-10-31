'use client'

import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Link from 'next/link'
import { useContent } from '@/context/ContentContext'

interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  link: string
  linkText: string
}

const defaultSlides: Slide[] = []

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { content } = useContent()
  const slides: Slide[] = (content?.heroSlides as any) || defaultSlides

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  if (!slides || slides.length === 0) {
    return null
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Carousel Container */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/5"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container-custom text-white animate-slide-up">
                <div className="max-w-2xl">
                  <p className="text-lg md:text-xl mb-2 text-blue-400 font-semibold">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-gray-200">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.link}
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 btn-animate shadow-lg"
                  >
                    {slide.linkText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-300 btn-animate z-10"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-300 btn-animate z-10"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}








