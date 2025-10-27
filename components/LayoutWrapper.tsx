'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { usePathname } from 'next/navigation'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // Don't show Header/Footer on admin routes
  if (isAdminRoute) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </>
  )
}

