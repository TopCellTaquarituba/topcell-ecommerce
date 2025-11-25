"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type FavoritesContextType = {
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isAuthenticated?: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const LS_KEY_LEGACY = 'favorites_v1'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [customerId, setCustomerId] = useState<string | 'guest'>('guest')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const storageKey = useMemo(() => `favorites_${customerId || 'guest'}`, [customerId])
  const prevKeyRef = useRef<string>(storageKey)

  // Discover current user id for per-user storage
  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        const authed = !!(j?.authenticated && j?.customer?.id)
        setIsAuthenticated(authed)
        setCustomerId(authed ? String(j.customer.id) : 'guest')
      })
      .catch(() => {
        setIsAuthenticated(false)
        setCustomerId('guest')
      })
      .finally(() => setMounted(true))
  }, [])

  // Load favorites for current key; migrate legacy key on first load
  useEffect(() => {
    if (!mounted) return
    try {
      // Merge legacy list if exists (one-time)
      const legacyRaw = localStorage.getItem(LS_KEY_LEGACY)
      const legacy = legacyRaw ? (JSON.parse(legacyRaw) as string[]) : []

      const raw = localStorage.getItem(storageKey)
      const cur = raw ? (JSON.parse(raw) as string[]) : []
      const merged = Array.from(new Set([...(Array.isArray(cur) ? cur : []), ...(Array.isArray(legacy) ? legacy : [])])).filter(Boolean)
      setFavorites(merged)
      if (legacy && legacy.length) {
        try { localStorage.removeItem(LS_KEY_LEGACY) } catch {}
        try { localStorage.setItem(storageKey, JSON.stringify(merged)) } catch {}
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, storageKey])

  // If user transitions guest -> logged, merge guest favorites into user list
  useEffect(() => {
    if (!mounted) return
    const prevKey = prevKeyRef.current
    if (prevKey !== storageKey && prevKey.endsWith('guest') && !storageKey.endsWith('guest')) {
      try {
        const guestRaw = localStorage.getItem(prevKey)
        const guest = guestRaw ? (JSON.parse(guestRaw) as string[]) : []
        const userRaw = localStorage.getItem(storageKey)
        const user = userRaw ? (JSON.parse(userRaw) as string[]) : []
        const merged = Array.from(new Set([...(Array.isArray(user) ? user : []), ...(Array.isArray(guest) ? guest : [])])).filter(Boolean)
        setFavorites(merged)
        localStorage.setItem(storageKey, JSON.stringify(merged))
        localStorage.removeItem(prevKey)
      } catch {}
    }
    prevKeyRef.current = storageKey
  }, [mounted, storageKey])

  // Persist changes for current user key
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(storageKey, JSON.stringify(favorites)) } catch {}
  }, [favorites, mounted, storageKey])

  const isFavorite = (id: string) => favorites.includes(String(id))

  const ensureAuth = () => {
    if (!mounted) return false
    if (isAuthenticated) return true
    alert('Entre na sua conta para salvar favoritos.')
    router.push('/login?mode=login')
    return false
  }

  const addFavorite = (id: string) => {
    if (!ensureAuth()) return
    setFavorites((s) => (s.includes(id) ? s : [...s, id]))
  }
  const removeFavorite = (id: string) => setFavorites((s) => s.filter((x) => x !== id))
  const toggleFavorite = (id: string) => {
    if (!ensureAuth()) return
    setFavorites((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite, isAuthenticated }),
    [favorites, isAuthenticated]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
