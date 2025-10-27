'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiArrowUp, FiArrowDown } from 'react-icons/fi'

export default function Analytics() {
  const { user } = useAuth()

  // Mock sales data for the last 7 days
  const salesData = [
    { day: 'Seg', sales: 32000, orders: 45 },
    { day: 'Ter', sales: 28000, orders: 38 },
    { day: 'Qua', sales: 41000, orders: 52 },
    { day: 'Qui', sales: 35000, orders: 48 },
    { day: 'Sex', sales: 49000, orders: 65 },
    { day: 'Sáb', sales: 42000, orders: 58 },
    { day: 'Dom', sales: 38000, orders: 51 }
  ]

  // Top selling products
  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 45, revenue: 404955 },
    { name: 'MacBook Pro 16"', sales: 28, revenue: 643972 },
    { name: 'AirPods Pro 2', sales: 89, revenue: 204611 },
    { name: 'Samsung Galaxy S24 Ultra', sales: 34, revenue: 254966 },
    { name: 'iPad Pro 12.9"', sales: 31, revenue: 402969 }
  ]

  // Sales by category
  const salesByCategory = [
    { category: 'Smartphones', sales: 523450, percentage: 42, color: '#10b981' },
    { category: 'Notebooks', sales: 398200, percentage: 32, color: '#0ea5e9' },
    { category: 'Acessórios', sales: 156890, percentage: 13, color: '#f59e0b' },
    { category: 'Tablets', sales: 164830, percentage: 13, color: '#8b5cf6' }
  ]

  const maxSales = Math.max(...salesData.map(d => d.sales))
  const barWidth = 60
  const spacing = 20
  const totalWidth = (barWidth + spacing) * salesData.length - spacing
  const chartHeight = 300

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition">
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-scale-in">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de Vendas (7 dias)</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 265.000</p>
            <div className="flex items-center mt-2 text-green-600">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-semibold">+12.5%</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de Pedidos</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">357</p>
            <div className="flex items-center mt-2 text-green-600">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-semibold">+8.3%</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ticket Médio</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 742,30</p>
            <div className="flex items-center mt-2 text-green-600">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-semibold">+5.2%</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Vendas por Dia (últimos 7 dias)</h2>
          <div className="flex items-end justify-center gap-5" style={{ height: chartHeight }}>
            {salesData.map((data, index) => {
              const height = (data.sales / maxSales) * (chartHeight - 60)
              return (
                <div key={index} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative group">
                    <div 
                      className="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg w-16 mb-2 transition-all duration-500 hover:opacity-80 cursor-pointer"
                      style={{ height: `${height}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          R$ {data.sales.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-center text-gray-600 dark:text-gray-400 font-semibold">
                      {data.day}
                    </div>
                    <div className="text-xs text-center text-gray-500 dark:text-gray-500">
                      {data.orders} pedidos
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Products & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Produtos Mais Vendidos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Vendas</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {product.sales} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Vendas por Categoria</h2>
            <div className="space-y-4">
              {salesByCategory.map((item, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      R$ {item.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.percentage}% do total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">Taxa de Conversão</h3>
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold mb-2">3.8%</p>
            <div className="flex items-center space-x-1 text-sm opacity-90">
              <FiArrowUp className="w-4 h-4" />
              <span>+0.4% em relação ao mês anterior</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white animate-scale-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">Tempo Médio de Resposta</h3>
              <FiTrendingDown className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold mb-2">2.4h</p>
            <div className="flex items-center space-x-1 text-sm opacity-90">
              <FiArrowDown className="w-4 h-4" />
              <span>-0.3h em relação ao mês anterior</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white animate-scale-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">Satisfação do Cliente</h3>
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold mb-2">4.7/5</p>
            <div className="flex items-center space-x-1 text-sm opacity-90">
              <FiArrowUp className="w-4 h-4" />
              <span>+0.2 em relação ao mês anterior</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
