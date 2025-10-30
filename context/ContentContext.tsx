"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { CMSContent } from '@/lib/contentDefaults'
import { defaultContent } from '@/lib/contentDefaults'

interface ContentContextType {
  content: CMSContent
  setContent: (c: CMSContent) => void
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<CMSContent>(defaultContent)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setContent(data)
      }
    } catch {}
  }, [setContent])

  useEffect(() => {
    // Fetch once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refresh()
  }, [refresh])

  return (
    <ContentContext.Provider value={{ content, setContent, refresh }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
