'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition btn-animate"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FiMoon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      ) : (
        <FiSun className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 animate-fade-in">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">TopCell</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 animate-slide-down">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Início
            </Link>
            <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Produtos
            </Link>
            <Link href="/products?category=smartphones" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Smartphones
            </Link>
            <Link href="/products?category=laptops" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Notebooks
            </Link>
            <Link href="/products?category=accessories" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Acessórios
            </Link>
            <a href="/#about-section" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Sobre Nós
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <FiSearch className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <Link href="/login" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Entrar
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <FiShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 animate-slide-down">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Início
              </Link>
              <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Produtos
              </Link>
              <Link href="/products?category=smartphones" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Smartphones
              </Link>
              <Link href="/products?category=laptops" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Notebooks
              </Link>
              <Link href="/products?category=accessories" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Acessórios
              </Link>
              <a href="/#about-section" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Sobre Nós
              </a>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
              </div>
              <Link href="/login" className="flex items-center space-x-2">
                <span>Entrar</span>
              </Link>
              <Link href="/cart" className="flex items-center space-x-2">
                <FiShoppingCart className="w-6 h-6" />
                <span>Carrinho ({totalItems})</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

