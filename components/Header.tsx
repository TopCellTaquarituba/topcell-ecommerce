'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiPackage, FiHeart } from 'react-icons/fi'
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
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // check session
    fetch('/api/auth/me', { cache: 'no-store' }).then(async (r) => {
      const j = await r.json().catch(() => null)
      if (j?.authenticated && j?.customer?.name) setCustomerName(j.customer.name as string)
    }).catch(() => {})
  }, [])

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [accountMenuRef])

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
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Pesquisar">
              <FiSearch className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <Link href="/favorites" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Favoritos">
              <FiHeart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
            <div className="relative" ref={accountMenuRef}>
              <button onClick={() => setAccountOpen((v)=>!v)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition" aria-label="Minha conta">
                <FiUser className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                {customerName && <span className="text-gray-700 dark:text-gray-200 text-sm max-w-[140px] truncate">{customerName}</span>}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 animate-fade-in-fast">
                  {customerName ? (
                    <>
                      <Link href="/favorites" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiHeart className="w-4 h-4" /> <span>Meus favoritos</span>
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiPackage className="w-4 h-4" /> <span>Meus pedidos</span>
                      </Link>
                      <button onClick={async ()=>{ try { await fetch('/api/auth/logout',{method:'POST'}); location.reload() } catch {} }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiLogOut className="w-4 h-4" /> <span>Sair</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login?mode=login" className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Entrar</Link>
                      <Link href="/login?mode=signup" className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Cadastrar</Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <FiShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="p-2" aria-label="Pesquisar">
              <FiSearch className="w-6 h-6" />
            </button>
            <Link href="/favorites" className="p-2" aria-label="Favoritos">
              <FiHeart className="w-6 h-6" />
            </Link>
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
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
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={() => setSearchOpen(false)}>
          <div className="container-custom">
            <form
              onSubmit={(e)=>{ e.preventDefault(); const q = searchText.trim(); setSearchOpen(false); if(q) router.push(`/products?q=${encodeURIComponent(q)}`) }}
              className="relative mt-4 md:mt-6"
              onClick={(e)=> e.stopPropagation()}
            >
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow">
                <FiSearch className="w-5 h-5 text-gray-500" />
                <input
                  autoFocus
                  value={searchText}
                  onChange={(e)=> setSearchText(e.target.value)}
                  placeholder="Buscar produtos, marcas..."
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <button type="button" onClick={()=> setSearchOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Fechar">
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
