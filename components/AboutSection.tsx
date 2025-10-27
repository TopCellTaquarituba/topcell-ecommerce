'use client'

import { useState, useEffect } from 'react'
import { FiUsers, FiAward, FiTruck, FiShield, FiTrendingUp, FiHeart } from 'react-icons/fi'

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('about-section')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    {
      icon: FiUsers,
      number: '50K+',
      label: 'Clientes Satisfeitos',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: FiAward,
      number: '15+',
      label: 'Anos de Experiência',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: FiTruck,
      number: '99%',
      label: 'Entregas no Prazo',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: FiShield,
      number: '100%',
      label: 'Garantia Estendida',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ]

  const values = [
    {
      icon: FiHeart,
      title: 'Paixão pela Tecnologia',
      description: 'Somos apaixonados por tecnologia e sempre buscamos os melhores produtos para nossos clientes.',
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    },
    {
      icon: FiShield,
      title: 'Confiança e Segurança',
      description: 'Garantimos produtos originais com garantia estendida e suporte técnico especializado.',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      icon: FiUsers,
      title: 'Atendimento Personalizado',
      description: 'Nossa equipe está sempre pronta para ajudar você a encontrar o produto ideal.',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    },
    {
      icon: FiTrendingUp,
      title: 'Inovação Constante',
      description: 'Sempre atualizados com as últimas tendências e lançamentos do mercado tecnológico.',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <section id="about-section" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Sobre a <span className="text-primary-600 dark:text-primary-400">TopCell</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Há mais de 15 anos, somos referência em tecnologia no Brasil, oferecendo os melhores produtos eletrônicos com qualidade, confiança e atendimento excepcional.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className={`animate-slide-up ${isVisible ? 'animate-fade-in' : ''}`}>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Nossa História
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Fundada em 2009, a TopCell nasceu da paixão por tecnologia e do desejo de democratizar o acesso aos melhores produtos eletrônicos do mercado. Começamos como uma pequena loja física em São Paulo, especializada em smartphones e acessórios.
              </p>
              <p>
                Com o crescimento do e-commerce, expandimos nossa presença digital e hoje atendemos clientes em todo o Brasil. Nossa missão sempre foi oferecer produtos de qualidade com preços justos e um atendimento que realmente faz a diferença.
              </p>
              <p>
                Hoje, somos uma das principais referências em eletrônicos online, com mais de 50 mil clientes satisfeitos e uma equipe especializada pronta para ajudar você a encontrar exatamente o que precisa.
              </p>
            </div>
          </div>
          
          <div className={`animate-slide-up ${isVisible ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <FiAward className="w-16 h-16" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2">TopCell</h4>
                    <p className="text-white/80">Desde 2009</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Números que Compõem Nossa História
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center animate-scale-in ${isVisible ? 'animate-fade-in' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Nossos Valores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={`animate-slide-up ${isVisible ? 'animate-fade-in' : ''}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mb-6`}>
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {value.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Nossa Missão
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
              "Democratizar o acesso à tecnologia de qualidade, oferecendo produtos eletrônicos inovadores com preços justos, atendimento excepcional e garantia total da satisfação do cliente."
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
