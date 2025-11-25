'use client'

import Link from 'next/link'
import { useEffect, useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiPackage,
  FiHeart,
  FiPhoneCall,
  FiGlobe,
  FiHelpCircle,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMapPin,
} from 'react-icons/fi'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition btn-animate"
      aria-label="Trocar tema"
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
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const categoriesMenuRef = useRef<HTMLDivElement>(null)
  const handleCategoryNavigate = (slug: string) => {
    if (!slug) return
    router.push(`/products?category=${encodeURIComponent(slug)}`)
    setCategoriesOpen(false)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json().catch(() => null)
        if (j?.authenticated && j?.customer?.name) setCustomerName(j.customer.name as string)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false)
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [accountMenuRef])

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        const json = await res.json()
        const items = Array.isArray(json?.items)
          ? json.items.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
          : []
        setCategories(items)
      } catch {}
    }
    loadCategories()
  }, [])

  const handleSearchSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const q = searchText.trim()
    setSearchOpen(false)
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-300 border-b border-gray-100">
      

      <div className="hidden lg:block bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 text-xs text-gray-700 border-b border-gray-100">
        <div className="container-custom flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2 font-semibold text-gray-800">
              <FiGlobe className="w-4 h-4 text-primary-600" />
              Português (BR)
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-primary-600" />
              Enviando para Brasil
            </span>
            
          </div>
          <div className="flex items-center gap-4 text-primary-700">
            <span className="flex items-center gap-2 font-semibold">
              <FiPhoneCall className="w-4 h-4" />
              (14) 99622-8136
            </span>
            <div className="flex items-center gap-3 text-primary-600">
              <a href="https://facebook.com" className="hover:text-primary-800" aria-label="Facebook">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" className="hover:text-primary-800" aria-label="Instagram">
                <FiInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-4">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center space-x-2 animate-fade-in">
            <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">TopCell</span>
            <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Eletrônicos premium</span>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm px-2 py-2"
          >
            <span className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 uppercase">
              Categorias
            </span>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 bg-transparent px-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none"
              placeholder="Busque por produtos, marcas ou códigos..."
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition btn-animate"
            >
              <FiSearch className="w-5 h-5" />
              <span className="hidden lg:inline">Buscar</span>
            </button>
          </form>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 border border-primary-100 shadow-sm">
              <FiPhoneCall className="w-5 h-5" />
              <div className="leading-tight">
                <p className="text-xs font-semibold">Fale com a TopCell</p>
                <p className="text-sm font-bold">+55 (14) 99622-8136</p>
              </div>
            </div>
            <ThemeToggle />
            <Link href="/favorites" className="hidden md:inline-flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Favoritos">
              <FiHeart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
            <div className="relative hidden md:block" ref={accountMenuRef}>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                aria-label="Minha conta"
              >
                <FiUser className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                {customerName && (
                  <span className="text-gray-700 dark:text-gray-200 text-sm max-w-[140px] truncate">
                    {customerName.split(' ')[0]}
                  </span>
                )}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 animate-fade-in">
                  {customerName ? (
                    <>
                      <Link href="/favorites" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiHeart className="w-4 h-4" /> <span>Meus favoritos</span>
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiPackage className="w-4 h-4" /> <span>Meus pedidos</span>
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/auth/logout', { method: 'POST' })
                            location.reload()
                          } catch {}
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiLogOut className="w-4 h-4" /> <span>Sair</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login?mode=login" className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Entrar
                      </Link>
                      <Link href="/login?mode=signup" className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Cadastrar
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link href="/cart" className="relative hidden md:inline-flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <FiShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setSearchOpen(true)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Pesquisar">
              <FiSearch className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block border-t border-gray-100 dark:border-gray-800 bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container-custom flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide relative">
          <div ref={categoriesMenuRef}>
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition btn-animate whitespace-nowrap"
            >
              <FiMenu className="w-5 h-5" />
              <span className="font-semibold">Categorias</span>
            </button>
            {categoriesOpen && (
              <div className="absolute mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 w-64 max-h-80 overflow-y-auto">
                {categories.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">Nenhuma categoria cadastrada</div>
                )}
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleCategoryNavigate(c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
            <Link href="/" className="hover:text-primary-700 dark:hover:text-primary-300 transition">
              Início
            </Link>
            <Link href="/products" className="hover:text-primary-700 dark:hover:text-primary-300 transition">
              Produtos
            </Link>
            <Link href="/products?category=smartphones" className="hover:text-primary-700 dark:hover:text-primary-300 transition">
              Smartphones
            </Link>
            <Link href="/products?category=accessories" className="hover:text-primary-700 dark:hover:text-primary-300 transition">
              Acessórios
            </Link>
            <Link href="/products?sort=newest" className="hover:text-primary-700 dark:hover:text-primary-300 transition">
              Novidades
            </Link>
            <Link href="/contact" className="hover:text-primary-700 dark:hover:text-primary-300 transition">
              Contato
            </Link>
          </nav>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden pb-4 pt-2 px-4 animate-slide-down bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="mb-4">
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition btn-animate whitespace-nowrap w-full justify-center"
            >
              <FiMenu className="w-5 h-5" />
              <span className="font-semibold">Categorias</span>
            </button>
            {categoriesOpen && (
              <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 w-full max-h-80 overflow-y-auto">
                {categories.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">Nenhuma categoria cadastrada</div>
                )}
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleCategoryNavigate(c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <ThemeToggle />
              <span>Trocar tema</span>
            </div>
            <Link href="/favorites" className="flex items-center space-x-2">
              <FiHeart className="w-6 h-6" />
              <span>Favoritos</span>
            </Link>
            <Link href="/account" className="flex items-center space-x-2">
              <FiUser className="w-6 h-6" />
              <span>{customerName ? customerName : 'Minha conta'}</span>
            </Link>
            <Link href="/cart" className="flex items-center space-x-2">
              <FiShoppingCart className="w-6 h-6" />
              <span>Carrinho ({totalItems})</span>
            </Link>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={() => setSearchOpen(false)}>
          <div className="container-custom">
            <form onSubmit={handleSearchSubmit} className="relative mt-4 md:mt-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow">
                <FiSearch className="w-5 h-5 text-gray-500" />
                <input
                  autoFocus
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar produtos, marcas..."
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Fechar">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
