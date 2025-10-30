"use client"

import { useEffect, useState } from 'react'
import { FiAward, FiShield, FiTruck, FiUsers } from 'react-icons/fi'
import { useContent } from '@/context/ContentContext'

export default function AboutSectionDynamic() {
  const { content } = useContent()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    const el = document.getElementById('about-section')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about-section" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {content.about.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {content.about.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className={`animate-slide-up ${isVisible ? 'animate-fade-in' : ''}`}>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Nossa História</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {content.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className={`animate-slide-up ${isVisible ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl overflow-hidden">
                {content.about.imageUrl ? (
                  <img src={content.about.imageUrl} alt={content.about.imageTitle || 'About image'} className="absolute inset-0 w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-primary-800/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    {!content.about.imageUrl && (
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <FiAward className="w-16 h-16" />
                      </div>
                    )}
                    <h4 className="text-2xl font-bold mb-2">{content.about.imageTitle || ''}</h4>
                    <p className="text-white/80">{content.about.imageSubtitle || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Nossa Missão</h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
              {content.about.mission}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                <FiShield className="w-6 h-6" />
                <span className="font-semibold">Produtos Originais</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                <FiTruck className="w-6 h-6" />
                <span className="font-semibold">Entrega Rápida</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                <FiUsers className="w-6 h-6" />
                <span className="font-semibold">Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
