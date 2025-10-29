'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
  FiUsers,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiLogOut,
  FiPackage,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiSettings,
  FiFileText,
  FiTag,
  FiSun,
  FiMoon,
} from 'react-icons/fi'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

const initialStats = {
  totalSales: 0,
  totalOrders: 0,
  totalCustomers: 0,
  averageOrder: 0,
  salesGrowth: 0,
  ordersGrowth: 0,
  customersGrowth: 0,
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [stats, setStats] = useState(initialStats)
  const [animatedStats, setAnimatedStats] = useState({ sales: 0, orders: 0, customers: 0 })
  const [lineData, setLineData] = useState<{ date: string; revenue: number; count: number }[]>([])
  const [categoryData, setCategoryData] = useState<{ category: string; revenue: number; count: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<
    { id: string; customer: string; total: number; status: string; createdAt: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/orders?page=1&pageSize=200', { cache: 'no-store' })
        if (!res.ok) throw new Error('Falha ao carregar pedidos')
        const data = await res.json()
        const summary = data?.summary || {}
        const revenue = Number(summary.revenue || 0)
        const ordersCount = Number(summary.count || 0)
        const averageOrder = Number(summary.avgTicket || (ordersCount > 0 ? revenue / ordersCount : 0))
        const customers = Number(data?.customerCount || 0)

        setStats({
          totalSales: revenue,
          totalOrders: ordersCount,
          totalCustomers: customers,
          averageOrder,
          salesGrowth: 0,
          ordersGrowth: 0,
          customersGrowth: 0,
        })
        setLineData((data?.byDay || []).slice(-7))
        setCategoryData(data?.byCategory || [])
        setRecentOrders(
          (data?.orders || [])
            .slice(0, 5)
            .map((order: any) => ({
              id: order.number || order.id,
              customer: order.customer?.name || 'Cliente',
              total: Number(order.total || 0),
              status: order.status || 'pending',
              createdAt: order.createdAt,
            })),
        )
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard', error)
        setStats(initialStats)
        setLineData([])
        setCategoryData([])
        setRecentOrders([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    const animateCounter = (end: number, key: 'sales' | 'orders' | 'customers') => {
      let start = 0
      const duration = 2000
      const increment = end / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setAnimatedStats((prev) => ({ ...prev, [key]: Math.floor(end) }))
          clearInterval(timer)
        } else {
          setAnimatedStats((prev) => ({ ...prev, [key]: Math.floor(start) }))
        }
      }, 16)
    }

    animateCounter(stats.totalSales, 'sales')
    animateCounter(stats.totalOrders, 'orders')
    animateCounter(stats.totalCustomers, 'customers')
  }, [stats.totalSales, stats.totalOrders, stats.totalCustomers])

  const handleLogout = () => {
    logout()
    window.location.href = '/admin'
  }

  const formatChange = (value: number) => {
    if (!value) return '--'
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${value.toFixed(1)}%`
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Em transito',
      delivered: 'Entregue',
      canceled: 'Cancelado',
    }
    return map[status] || status
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'shipped':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  const statsCards = [
    {
      title: 'Receita total',
      value: `R$ ${animatedStats.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      color: 'bg-emerald-500',
      change: formatChange(stats.salesGrowth),
      positive: stats.salesGrowth >= 0,
    },
    {
      title: 'Pedidos',
      value: animatedStats.orders.toLocaleString('pt-BR'),
      icon: FiShoppingCart,
      color: 'bg-indigo-500',
      change: formatChange(stats.ordersGrowth),
      positive: stats.ordersGrowth >= 0,
    },
    {
      title: 'Clientes',
      value: animatedStats.customers.toLocaleString('pt-BR'),
      icon: FiUsers,
      color: 'bg-purple-500',
      change: formatChange(stats.customersGrowth),
      positive: stats.customersGrowth >= 0,
    },
    {
      title: 'Ticket Medio',
      value: `R$ ${stats.averageOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      change: '--',
      positive: true,
    },
  ]

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: FiBarChart2 },
    { label: 'Produtos', href: '/admin/products', icon: FiTag },
    { label: 'Pedidos', href: '/admin/orders', icon: FiShoppingCart },
    { label: 'Vendas', href: '/admin/sales', icon: FiTrendingUp },
    { label: 'Conteudo', href: '/admin/content', icon: FiFileText },
    { label: 'Configuracoes', href: '/admin/analytics', icon: FiSettings },
  ]

  const isActive = (href: string) => pathname?.startsWith(href)

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#060b1d] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <aside
        className={`group/sidebar hidden md:flex flex-col w-20 hover:w-60 transition-all duration-300 border-r ${
          isDark
            ? 'bg-gradient-to-b from-indigo-900/80 via-[#0e1530] to-[#050720] border-slate-800/60 shadow-xl text-slate-100'
            : 'bg-white border-slate-200 shadow-lg text-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-6">
          <div
            className={`h-10 w-10 flex items-center justify-center rounded-xl font-semibold ${
              isDark ? 'bg-indigo-500/30 text-indigo-200' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            TC
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
            <p className="text-sm font-semibold">TopCell Admin</p>
            <p className="text-xs text-slate-400">Painel de controle</p>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-200'
                      : 'bg-indigo-50 text-indigo-600'
                    : isDark
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-6 border-t border-slate-800/30">
          <div className="text-xs text-slate-400">Conectado como</div>
          <div className="text-sm font-medium">{user?.name || 'admin'}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header
          className={`sticky top-0 z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-6 md:px-8 py-6 ${
            isDark ? 'bg-[#060b1d]/90 backdrop-blur border-b border-slate-800/60' : 'bg-white border-b border-slate-200'
          }`}
        >
          <div>
            <h1 className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Dashboard</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bem-vindo, {user?.name || 'admin'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
              <span className="text-sm font-medium">{isDark ? 'Modo claro' : 'Modo escuro'}</span>
            </button>
            <Link
              href="/admin/products/new"
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition"
            >
              Novo produto
            </Link>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition border ${
                isDark ? 'border-red-500/60 text-red-300 hover:bg-red-500/10' : 'border-red-200 text-red-500 hover:bg-red-50'
              }`}
            >
              <FiLogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 md:px-8 py-8 space-y-8">
          <section>
            <h2 className={`text-sm uppercase tracking-wide mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visao geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {statsCards.map((stat) => (
                <div
                  key={stat.title}
                  className={`rounded-2xl border p-5 transition transform hover:-translate-y-1 ${
                    isDark
                      ? 'border-slate-800/60 bg-slate-900/50 backdrop-blur shadow-lg shadow-black/20 hover:border-indigo-500/60'
                      : 'border-slate-200 bg-white shadow-sm hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        stat.change === '--'
                          ? isDark
                            ? 'text-slate-400'
                            : 'text-slate-400'
                          : stat.positive
                            ? isDark
                              ? 'text-emerald-400'
                              : 'text-emerald-500'
                            : isDark
                              ? 'text-rose-400'
                              : 'text-rose-500'
                      }`}
                    >
                      {stat.change !== '--' && (
                        stat.positive ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <h3 className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{stat.title}</h3>
                  <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800/60 bg-slate-900/40 backdrop-blur' : 'border-slate-200 bg-white shadow-sm'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Vendas dos ultimos 7 dias</h3>
                {loading && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Atualizando...</span>}
              </div>
              {lineData.length ? (
                <ul className="space-y-3">
                  {lineData.map((item, index) => (
                    <li
                      key={`${item.date}-${index}`}
                      className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      <span>{new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Sem dados suficientes.</div>
              )}
            </div>

            <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800/60 bg-slate-900/40 backdrop-blur' : 'border-slate-200 bg-white shadow-sm'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Vendas por categoria</h3>
                {loading && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Atualizando...</span>}
              </div>
              {categoryData.length ? (
                <ul className="space-y-3">
                  {categoryData.map((item, index) => (
                    <li
                      key={`${item.category}-${index}`}
                      className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      <span>{item.category}</span>
                      <div className="text-right">
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.count} unidades</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Sem dados por categoria.</div>
              )}
            </div>
          </section>

          <section className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800/60 bg-slate-900/40 backdrop-blur' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Pedidos recentes</h3>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ultimos {recentOrders.length} pedidos criados</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`text-xs uppercase ${isDark ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left">Pedido</th>
                    <th className="px-6 py-3 text-left">Data</th>
                    <th className="px-6 py-3 text-left">Cliente</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {recentOrders.length ? (
                    recentOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className={`px-6 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>#{order.id}</td>
                        <td className={`px-6 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className={`px-6 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{order.customer}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className={`px-6 py-3 text-sm font-semibold text-right ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={`px-6 py-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Nenhum pedido recente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
