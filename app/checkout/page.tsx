'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import CEPInput, { CEPData } from '@/components/CEPInput'
import { FiCheck, FiCreditCard, FiTruck, FiLock, FiMapPin } from 'react-icons/fi'

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    paymentMethod: 'credit',
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCEPFound = (cepData: CEPData) => {
    setFormData({
      ...formData,
      cep: cepData.cep,
      address: cepData.logradouro,
      neighborhood: cepData.bairro,
      city: cepData.localidade,
      state: cepData.uf,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'shipping') {
      setStep('payment')
      return
    }
    if (step === 'payment') {
      setStep('review')
      return
    }
    // Create order in backend and redirect to tracking
    try {
      const payload = {
        customer: { name: formData.name, email: formData.email, phone: formData.phone },
        shipping: {
          name: formData.name,
          phone: formData.phone,
          cep: formData.cep,
          address: formData.address,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        items: items.map((it) => ({ productId: it.id, quantity: it.quantity })),
      }
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao criar pedido')
      const orderId = data.id as string
      localStorage.setItem('lastOrderId', data.number || orderId)
      clearCart()
      router.push(`/order/${orderId}`)
    } catch (err: any) {
      alert('Falha ao finalizar: ' + (err?.message || 'Erro desconhecido'))
    }
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Finalizar Pedido</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4 w-full max-w-2xl">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'shipping' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <FiTruck className="w-5 h-5" />
            </div>
            <span className={`ml-2 ${step === 'shipping' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Envio
            </span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'payment' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <FiCreditCard className="w-5 h-5" />
            </div>
            <span className={`ml-2 ${step === 'payment' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Pagamento
            </span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'review' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <FiCheck className="w-5 h-5" />
            </div>
            <span className={`ml-2 ${step === 'review' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Revisão
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {step === 'shipping' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Informações de Envio</h2>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Telefone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* CEP Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <FiMapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Endereço</h3>
                  </div>
                  <CEPInput onCEPFound={handleCEPFound} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Logradouro</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Número</label>
                    <input
                      type="text"
                      name="number"
                      required
                      value={formData.number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Complemento</label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Bairro</label>
                    <input
                      type="text"
                      name="neighborhood"
                      required
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Cidade</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Estado</label>
                    <input
                      type="text"
                      name="state"
                      required
                      maxLength={2}
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment and Review steps remain similar but use formData for all fields */}
            {/* (keeping similar structure as before for brevity) */}
            
            {step === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Pagamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Forma de pagamento</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="credit">Cartão de crédito</option>
                      <option value="pix">Pix</option>
                      <option value="boleto">Boleto</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Revisão do Pedido</h2>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold mb-2 dark:text-white">Endereço de envio</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formData.name} • {formData.phone}<br/>
                    {formData.address}, {formData.number} {formData.complement && `- ${formData.complement}`}<br/>
                    {formData.neighborhood} - {formData.city}/{formData.state} • CEP {formData.cep}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold mb-2 dark:text-white">Pagamento</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formData.paymentMethod === 'credit' && 'Cartão de crédito'}
                    {formData.paymentMethod === 'pix' && 'Pix'}
                    {formData.paymentMethod === 'boleto' && 'Boleto bancário'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold mb-4 dark:text-white">Itens</h3>
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-4">
                        <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-medium dark:text-white">{it.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Qtd: {it.quantity}</div>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span className="font-semibold dark:text-white">Total</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">R$ {getTotalPrice().toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step !== 'shipping' && (
                <button
                  type="button"
                  onClick={() => setStep(step === 'payment' ? 'shipping' : 'payment')}
                  className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                className="ml-auto px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center space-x-2"
              >
                <span>{step === 'review' ? 'Confirmar Pedido' : 'Continuar'}</span>
                <FiLock className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Resumo do Pedido</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qtd: {item.quantity}</p>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors duration-300">
              <div className="flex justify-between text-lg font-bold">
                <span className="dark:text-white">Total</span>
                <span className="text-primary-600 dark:text-primary-400">
                  R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
