'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import axios, { AxiosError } from 'axios'

// Definição dos tipos
interface ProductFormData {
  name: string
  price: string
  category: string
  brand: string
  sku: string
}

interface SubmitStatus {
  type: 'success' | 'error' | ''
  message: string
}

interface ApiErrorResponse {
  message: string
}

export default function ProductRegistration() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: '', message: '' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      price: '',
      category: '',
      brand: '',
      sku: ''
    }
  })

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setIsLoading(true)
    setSubmitStatus({ type: '', message: '' })

    try {
      // Converte price para número
      const productData = {
        ...data,
        price: parseFloat(data.price)
      }

      const response = await axios.post('/api/products', productData)
      
      setSubmitStatus({
        type: 'success',
        message: 'Produto cadastrado com sucesso!'
      })
      reset() // Limpa o formulário
      
      console.log('Produto criado:', response.data)
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>
      setSubmitStatus({
        type: 'error',
        message: axiosError.response?.data?.message || 'Erro ao cadastrar produto. Tente novamente.'
      })
      console.error('Erro ao criar produto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              Cadastro de Produtos
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Adicione um novo produto ao catálogo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-8 space-y-6">
            {/* Status Message */}
            {submitStatus.message && (
              <div className={`p-4 rounded-md ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <div className="flex items-center">
                  {submitStatus.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {submitStatus.message}
                </div>
              </div>
            )}

            {/* Nome do Produto */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-900 placeholder-gray-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Digite o nome do produto"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Preço */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Preço é obrigatório',
                  min: { value: 0.01, message: 'Preço deve ser maior que zero' }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-900 placeholder-gray-500 ${
                  errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0,00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Categoria e Marca */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  {...register('category', { required: 'Categoria é obrigatória' })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-900 ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="eletronicos">Eletrônicos</option>
                  <option value="roupas">Roupas</option>
                  <option value="casa">Casa e Jardim</option>
                  <option value="esportes">Esportes</option>
                  <option value="livros">Livros</option>
                  <option value="beleza">Beleza e Saúde</option>
                  <option value="outros">Outros</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  {...register('brand')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Nome da marca"
                />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                {...register('sku')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Código do produto"
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  reset()
                  setSubmitStatus({ type: '', message: '' })
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
              >
                Limpar Formulário
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Produto'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}