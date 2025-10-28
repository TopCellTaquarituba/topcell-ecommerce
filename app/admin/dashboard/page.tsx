'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { FiUsers, FiDollarSign, FiShoppingCart, FiTrendingUp, FiLogOut, FiPackage, FiBarChart2, FiArrowUp, FiArrowDown } from 'react-icons/fi'

// Mock data for dashboard stats
const mockStats = {
  totalSales: 245890.50,
  totalOrders: 1234,
  totalCustomers: 892,
  averageOrder: 199.25,
  salesGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.7
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(mockStats)
  const [animatedStats, setAnimatedStats] = useState({
    sales: 0,
    orders: 0,
    customers: 0
  })

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
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/admin'
  }

  const statsCards = [
    {
      title: 'Vendas Totais',
      value: `R$ ${animatedStats.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: `+${stats.salesGrowth}%`,
      positive: true
    },
    {
      title: 'Pedidos',
      value: animatedStats.orders.toLocaleString('pt-BR'),
      icon: FiShoppingCart,
      color: 'bg-blue-500',
      change: `+${stats.ordersGrowth}%`,
      positive: true
    },
    {
      title: 'Clientes',
      value: animatedStats.customers.toLocaleString('pt-BR'),
      icon: FiUsers,
      color: 'bg-purple-500',
      change: `+${stats.customersGrowth}%`,
      positive: true
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      change: '+5.2%',
      positive: true
    }
  ]

  // Recent orders (mock data)
  const recentOrders = [
    { id: '#1234', customer: 'João Silva', product: 'iPhone 15 Pro', amount: 8999, status: 'Entregue' },
    { id: '#1235', customer: 'Maria Santos', product: 'MacBook Pro', amount: 22999, status: 'Em Trânsito' },
    { id: '#1236', customer: 'Pedro Costa', product: 'AirPods Pro', amount: 2299, status: 'Processando' },
    { id: '#1237', customer: 'Ana Oliveira', product: 'Samsung S24', amount: 7499, status: 'Entregue' }
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
                <span className={`text-sm font-semibold flex items-center ${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.positive ? <FiArrowUp className="w-4 h-4 mr-1" /> : <FiArrowDown className="w-4 h-4 mr-1" />}
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Vendas dos Últimos 7 Dias</h2>
            <SalesLineChart />
          </div>

          {/* Sales by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Vendas por Categoria</h2>
            <SalesPieChart />
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Entregue' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.status === 'Em Trânsito'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {order.status}
                      </span>
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

// Animated Line Chart Component
function SalesLineChart() {
  const data = [
    { day: 'Seg', sales: 32000 },
    { day: 'Ter', sales: 28000 },
    { day: 'Qua', sales: 41000 },
    { day: 'Qui', sales: 35000 },
    { day: 'Sex', sales: 49000 },
    { day: 'Sáb', sales: 42000 },
    { day: 'Dom', sales: 38000 }
  ]

  const maxSales = Math.max(...data.map(d => d.sales))
  const width = 400
  const height = 200
  const padding = 40

  const points = data.map((item, index) => {
    const x = padding + (index * (width - 2 * padding) / (data.length - 1))
    const y = height - padding - (item.sales / maxSales) * (height - 2 * padding)
    return { x, y, sales: item.sales, day: item.day }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  const areaPathData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1={padding}
            y1={padding + ((100 - percent) / 100) * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ((100 - percent) / 100) * (height - 2 * padding)}
            stroke="#e5e7eb"
            strokeWidth="1"
            className="dark:stroke-gray-600"
          />
        ))}
        
        {/* Area fill */}
        <path
          d={areaPathData}
          fill="url(#gradient)"
          opacity="0.3"
          className="animate-fade-in"
          style={{ animationDelay: '300ms' }}
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-slide-in"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#0ea5e9"
              className="animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            />
            <text
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {point.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// Animated Pie Chart Component
function SalesPieChart() {
  const data = [
    { category: 'Smartphones', value: 523450, color: '#10b981' },
    { category: 'Notebooks', value: 398200, color: '#0ea5e9' },
    { category: 'Acessórios', value: 156890, color: '#f59e0b' },
    { category: 'Tablets', value: 164830, color: '#8b5cf6' }
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  return (
    <div className="relative">
      <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const angle = (item.value / total) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle
          
          const x1 = 150 + 100 * Math.cos((startAngle - 90) * Math.PI / 180)
          const y1 = 150 + 100 * Math.sin((startAngle - 90) * Math.PI / 180)
          const x2 = 150 + 100 * Math.cos((endAngle - 90) * Math.PI / 180)
          const y2 = 150 + 100 * Math.sin((endAngle - 90) * Math.PI / 180)
          
          const largeArc = angle > 180 ? 1 : 0
          const pathData = `M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`
          
          currentAngle = endAngle

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              className="animate-scale-in"
              style={{ 
                animationDelay: `${index * 100}ms`,
                transformOrigin: '150px 150px'
              }}
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.category}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                R$ {item.value.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
