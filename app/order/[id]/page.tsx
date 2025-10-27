'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiHome } from 'react-icons/fi'

interface OrderStatus {
  id: string
  name: string
  description: string
  timestamp: Date
  completed: boolean
}

export default function OrderTracking() {
  const params = useParams()
  const orderId = params.id as string
  
  const [currentStatus, setCurrentStatus] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  const statuses: OrderStatus[] = [
    {
      id: '1',
      name: 'Pedido Confirmado',
      description: 'Seu pedido foi confirmado e está sendo preparado',
      timestamp: new Date(),
      completed: true
    },
    {
      id: '2',
      name: 'Em Preparação',
      description: 'Seus produtos estão sendo separados',
      timestamp: new Date(),
      completed: false
    },
    {
      id: '3',
      name: 'Saiu para Entrega',
      description: 'Seu pedido está a caminho',
      timestamp: new Date(),
      completed: false
    },
    {
      id: '4',
      name: 'Entregue',
      description: 'Pedido entregue com sucesso',
      timestamp: new Date(),
      completed: false
    }
  ]

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)

      // Simulate status progression
      if (elapsedTime >= 5 && currentStatus === 0) {
        setCurrentStatus(1)
      } else if (elapsedTime >= 15 && currentStatus === 1) {
        setCurrentStatus(2)
      } else if (elapsedTime >= 25 && currentStatus === 2) {
        setCurrentStatus(3)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [elapsedTime, currentStatus])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const StatusIcon = ({ status }: { status: OrderStatus }) => {
    const index = statuses.indexOf(status)
    const isCompleted = index <= currentStatus

    if (isCompleted) {
      return <FiCheckCircle className="w-8 h-8 text-green-500" />
    } else if (index === currentStatus + 1) {
      return <div className="w-8 h-8 rounded-full border-4 border-primary-600 animate-pulse" />
    } else {
      return <div className="w-8 h-8 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Seu pedido foi confirmado e você pode acompanhá-lo em tempo real
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-300">
              Pedido: {orderId}
            </p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 animate-scale-in">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Status do Pedido</h2>
          
          {/* Timer */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tempo decorrido</p>
            <p className="text-3xl font-bold text-primary-600">{formatTime(elapsedTime)}</p>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {statuses.map((status, index) => {
              const isActive = index === currentStatus + 1
              const isCompleted = index <= currentStatus
              
              return (
                <div
                  key={status.id}
                  className={`relative pl-12 pb-6 last:pb-0 animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Vertical Line */}
                  {index < statuses.length - 1 && (
                    <div 
                      className={`absolute left-4 top-10 w-0.5 h-full ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      } transition-colors duration-500`}
                    />
                  )}

                  {/* Status Content */}
                  <div className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-600' 
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}>
                    <div className="flex-shrink-0 mt-1">
                      <StatusIcon status={status} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {status.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {status.description}
                      </p>
                      {isActive && (
                        <div className="mt-2 flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold">Em andamento...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/products"
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition btn-animate"
          >
            <FiHome className="w-5 h-5" />
            <span>Continuar Comprando</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition btn-animate"
          >
            <FiClock className="w-5 h-5" />
            <span>Atualizar Status</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                O que esperar a seguir?
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Um email de confirmação foi enviado para você</li>
                <li>• Você receberá atualizações em tempo real no acompanhamento</li>
                <li>• O prazo de entrega é de 3 a 5 dias úteis</li>
                <li>• Um código de rastreamento será enviado quando o pedido sair para entrega</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

