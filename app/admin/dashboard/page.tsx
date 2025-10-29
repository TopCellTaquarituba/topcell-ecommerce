'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { FiUsers, FiDollarSign, FiShoppingCart, FiTrendingUp, FiLogOut, FiPackage, FiBarChart2, FiArrowUp, FiArrowDown } from 'react-icons/fi'

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
  const [stats, setStats] = useState(initialStats)
  const [animatedStats, setAnimatedStats] = useState({ sales: 0, orders: 0, customers: 0 })
  const [lineData, setLineData] = useState<{ date: string; revenue: number; count: number }[]>([])
  const [categoryData, setCategoryData] = useState<{ category: string; revenue: number; count: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<{ id: string; customer: string; total: number; status: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(false)

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
        setRecentOrders((data?.orders || []).slice(0, 5).map((o: any) => ({
          id: o.number || o.id,
          customer: o.customer?.name || 'Cliente',
          total: Number(o.total || 0),
          status: o.status || 'pending',
          createdAt: o.createdAt,
        })))
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

  // Animate counters
  useEffect(() => {
    const animateCounter = (end: number, key: 'sales' | 'orders' | 'customers') => {
      let start = 0
      const duration = 2000
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(end) }))
          clearInterval(timer)
        } else {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(start) }))
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
      shipped: 'Em trânsito',
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
      title: 'Vendas Totais',
      value: `R$ ${animatedStats.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: formatChange(stats.salesGrowth),
      positive: stats.salesGrowth >= 0
    },
    {
      title: 'Pedidos',
      value: animatedStats.orders.toLocaleString('pt-BR'),
      icon: FiShoppingCart,
      color: 'bg-blue-500',
      change: formatChange(stats.ordersGrowth),
      positive: stats.ordersGrowth >= 0
    },
    {
      title: 'Clientes',
      value: animatedStats.customers.toLocaleString('pt-BR'),
      icon: FiUsers,
      color: 'bg-purple-500',
      change: formatChange(stats.customersGrowth),
      positive: stats.customersGrowth >= 0
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      change: '--',
      positive: true
    }
  ]


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Bem-vindo, {user?.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition btn-animate"
              >
                <FiPackage className="w-4 h-4" />
                <span>Produtos</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition btn-animate"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>Pedidos</span>
              </Link>
              <Link
                href="/admin/sales"
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition btn-animate"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>Vendas</span>
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition btn-animate"
              >
                <FiBarChart2 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
              <Link
                href="/admin/content"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition btn-animate"
              >
                <span>Configurar Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition btn-animate"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 card-hover animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-semibold flex items-center ${
                    stat.change === '--'
                      ? 'text-gray-400 dark:text-gray-500'
                      : stat.positive
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}
                >
                  {stat.change !== '--' && (
                    stat.positive ? <FiArrowUp className="w-4 h-4 mr-1" /> : <FiArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendas dos Últimos 7 Dias</h2>
              {loading && <span className="text-xs text-gray-400">Atualizando...</span>}
            </div>
            {lineData.length ? (
              <ul className="space-y-3">
                {lineData.map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>{new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Sem dados suficientes.</div>
            )}
          </div>

          {/* Sales by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendas por Categoria</h2>
              {loading && <span className="text-xs text-gray-400">Atualizando...</span>}
            </div>
            {categoryData.length ? (
              <ul className="space-y-3">
                {categoryData.map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>{item.category}</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.count} unidades</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Sem dados por categoria.</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pedidos Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-right">
                      R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}



