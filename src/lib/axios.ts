/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse } from '@/types'

// Configuração base da API
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

// Interface para configurações customizadas
interface ApiConfig extends AxiosRequestConfig {
  skipAuth?: boolean
}

// Criação da instância do Axios
const api: AxiosInstance = axios.create(API_CONFIG)

// Interceptor para requisições
api.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig): import('axios').InternalAxiosRequestConfig => {
    // Log da requisição em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    // Adicionar token de autenticação se necessário
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token && !(config as ApiConfig).skipAuth) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`)
      } else if (config.headers) {
        (config.headers as any)['Authorization'] = `Bearer ${token}`
      }
    }

    // Adicionar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    return config
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log da resposta em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    
    return response
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Log do erro
    console.error('❌ Response Error:', {
      status: error.response?.status,
      message: error.response?.data,
      url: error.config?.url,
    })

    // Tratamento de erros específicos
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Token expirado ou inválido
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            // Redirecionar para login se necessário
            // window.location.href = '/login'
          }
          break

        case 403:
          // Acesso negado
          console.warn('Access denied')
          break

        case 404:
          // Recurso não encontrado
          console.warn('Resource not found')
          break

        case 422:
          // Erro de validação
          console.warn('Validation error:', data)
          break

        case 500:
          // Erro interno do servidor
          console.error('Internal server error')
          break

        default:
          console.error(`HTTP Error ${status}:`, data)
      }
    } else if (error.request) {
      // Erro de rede
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

// Funções utilitárias para as requisições mais comuns
export const apiClient = {
  // GET request
  get: async <T = any>(url: string, config?: ApiConfig): Promise<T> => {
    const response = await api.get<T>(url, config)
    return response.data
  },

  // POST request
  post: async <T = any, D = any>(url: string, data?: D, config?: ApiConfig): Promise<T> => {
    const response = await api.post<T>(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T = any, D = any>(url: string, data?: D, config?: ApiConfig): Promise<T> => {
    const response = await api.put<T>(url, data, config)
    return response.data
  },

  // PATCH request
  patch: async <T = any, D = any>(url: string, data?: D, config?: ApiConfig): Promise<T> => {
    const response = await api.patch<T>(url, data, config)
    return response.data
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: ApiConfig): Promise<T> => {
    const response = await api.delete<T>(url, config)
    return response.data
  },
}

// Funções específicas para produtos
export const productApi = {
  // Criar produto
  create: async (productData: any): Promise<ApiResponse> => {
    return apiClient.post('/api/products', productData)
  },

  // Listar produtos
  getAll: async (params?: any): Promise<ApiResponse> => {
    return apiClient.get('/api/products', { params })
  },

  // Buscar produto por ID
  getById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/api/products/${id}`)
  },

  // Atualizar produto
  update: async (id: string, productData: any): Promise<ApiResponse> => {
    return apiClient.put(`/api/products/${id}`, productData)
  },

  // Deletar produto
  delete: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete(`/api/products/${id}`)
  },

  // Buscar produtos com filtros
  search: async (filters: any): Promise<ApiResponse> => {
    return apiClient.get('/api/products/search', { params: filters })
  },
}

// Função para tratamento de erros de API
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data && typeof error.response.data === 'object') {
    const errorData = error.response.data as any
    return errorData.message || errorData.error || 'Erro desconhecido'
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'Erro de conexão'
}

// Hook personalizado para requisições (opcional)
export const useApi = () => {
  const makeRequest = async <T = any>(
    requestFn: () => Promise<T>
  ): Promise<{ data: T | null; error: string | null }> => {
    try {
      const data = await requestFn()
      return { data, error: null }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError)
      return { data: null, error: errorMessage }
    }
  }

  return { makeRequest }
}

export default api