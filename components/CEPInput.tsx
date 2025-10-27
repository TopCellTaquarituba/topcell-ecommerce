'use client'

import { useState } from 'react'
import { FiSearch, FiLoader } from 'react-icons/fi'

interface CEPInputProps {
  onCEPFound: (data: CEPData) => void
}

export interface CEPData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export default function CEPInput({ onCEPFound }: CEPInputProps) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCEP = async (cepValue: string) => {
    const cleanedCEP = cepValue.replace(/\D/g, '')
    
    if (cleanedCEP.length !== 8) {
      setError('CEP deve ter 8 dígitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`)
      const data: CEPData = await response.json()

      if (data.erro) {
        setError('CEP não encontrado')
        return
      }

      onCEPFound(data)
      setError('')
    } catch (err) {
      setError('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = () => {
    if (cep.length >= 8) {
      fetchCEP(cep)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchCEP(cep)
    }
  }

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 8) {
      return digits.replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
        CEP
      </label>
      <div className="relative">
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(formatCEP(e.target.value))}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder="00000-000"
          maxLength={9}
          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <FiLoader className="w-5 h-5 text-primary-600 animate-spin" />
          </div>
        )}
        {!loading && cep.length >= 8 && (
          <button
            onClick={() => fetchCEP(cep)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700 transition"
            type="button"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

