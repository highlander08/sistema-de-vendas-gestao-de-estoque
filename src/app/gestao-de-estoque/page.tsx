'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import axios, { AxiosError } from 'axios'

// Tipos de dados
interface Product {
  id: string
  name: string
  price: number
  category: string
  brand: string
  sku: string
  stock: number
  createdAt: string
  updatedAt: string
}

interface ProductFormData {
  name: string
  price: string
  category: string
  brand: string
  sku: string
}

interface StockAdjustment {
  productId: string
  quantity: number
  type: 'add' | 'remove'
}

interface ApiErrorResponse {
  message: string
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null)
  const [stockQuantity, setStockQuantity] = useState<number>(0)
  const [stockOperation, setStockOperation] = useState<'add' | 'remove'>('add')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const categories = [
    { value: 'eletronicos', label: 'Eletrônicos' },
    { value: 'roupas', label: 'Roupas' },
    { value: 'casa', label: 'Casa e Jardim' },
    { value: 'esportes', label: 'Esportes' },
    { value: 'livros', label: 'Livros' },
    { value: 'beleza', label: 'Beleza e Saúde' },
    { value: 'outros', label: 'Outros' }
  ]

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>()

  // Carregar produtos
  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substitua pela sua API
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'iPhone 14 Pro',
          price: 8999.99,
          category: 'eletronicos',
          brand: 'Apple',
          sku: 'IPH14PRO128',
          stock: 25,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        },
        {
          id: '2',
          name: 'Camiseta Nike Dri-FIT',
          price: 129.90,
          category: 'roupas',
          brand: 'Nike',
          sku: 'NK-DF-001',
          stock: 50,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        },
        {
          id: '3',
          name: 'Smart TV 55" Samsung',
          price: 2899.99,
          category: 'eletronicos',
          brand: 'Samsung',
          sku: 'TV55-SAM-4K',
          stock: 8,
          createdAt: '2024-01-05',
          updatedAt: '2024-01-22'
        }
      ]
      
      // const response = await axios.get('/api/products')
      // setProducts(response.data)
      setProducts(mockProducts)
      setFilteredProducts(mockProducts)
    } catch (error) {
      showNotification('error', 'Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar produtos
  useEffect(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterCategory) {
      filtered = filtered.filter(product => product.category === filterCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, filterCategory, products])

  useEffect(() => {
    fetchProducts()
  }, [])

  // Mostrar notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Abrir modal de edição
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setValue('name', product.name)
    setValue('price', product.price.toString())
    setValue('category', product.category)
    setValue('brand', product.brand)
    setValue('sku', product.sku)
    setIsModalOpen(true)
  }

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    reset()
  }

  // Atualizar produto
  const onUpdateSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!editingProduct) return

    try {
      const updatedData = {
        ...data,
        price: parseFloat(data.price)
      }

      // await axios.put(`/api/products/${editingProduct.id}`, updatedData)
      
      // Simulação de atualização
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...updatedData, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      ))

      showNotification('success', 'Produto atualizado com sucesso!')
      closeModal()
    } catch (error) {
      showNotification('error', 'Erro ao atualizar produto')
    }
  }

  // Deletar produto
  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      // await axios.delete(`/api/products/${productId}`)
      
      // Simulação de exclusão
      setProducts(prev => prev.filter(p => p.id !== productId))
      showNotification('success', 'Produto deletado com sucesso!')
    } catch (error) {
      showNotification('error', 'Erro ao deletar produto')
    }
  }

  // Ajustar estoque
  const adjustStock = async () => {
    if (!stockModalProduct || stockQuantity <= 0) return

    try {
      const adjustment: StockAdjustment = {
        productId: stockModalProduct.id,
        quantity: stockQuantity,
        type: stockOperation
      }

      // await axios.patch(`/api/products/${stockModalProduct.id}/stock`, adjustment)

      // Simulação de ajuste de estoque
      setProducts(prev => prev.map(p => 
        p.id === stockModalProduct.id 
          ? { 
              ...p, 
              stock: stockOperation === 'add' 
                ? p.stock + stockQuantity 
                : Math.max(0, p.stock - stockQuantity),
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : p
      ))

      showNotification('success', `Estoque ${stockOperation === 'add' ? 'adicionado' : 'removido'} com sucesso!`)
      setStockModalProduct(null)
      setStockQuantity(0)
    } catch (error) {
      showNotification('error', 'Erro ao ajustar estoque')
    }
  }

  // Obter nome da categoria
  const getCategoryName = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <h1 className="text-3xl font-bold text-white">Gestão de Produtos e Estoque</h1>
            <p className="text-blue-100 mt-2">Gerencie seus produtos, estoque e informações</p>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar produtos
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Nome, SKU ou marca..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchProducts}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Atualizar Lista
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total de Produtos</h3>
              <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Produtos em Estoque</h3>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock > 0).length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800">Produtos Zerados</h3>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Notificações */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Tabela de Produtos */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-2">Carregando produtos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 10 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar produto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setStockModalProduct(product)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Ajustar estoque"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Deletar produto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Edição */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Editar Produto</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Nome é obrigatório',
                        minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500 ${
                        errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      {...register('category', { required: 'Categoria é obrigatória' })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900 ${
                        errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      {...register('brand')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      {...register('sku')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Atualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ajuste de Estoque */}
{stockModalProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Ajustar Estoque</h2>
          <button
            onClick={() => setStockModalProduct(null)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 text-lg">{stockModalProduct.name}</h3>
          <p className="text-sm text-gray-600">Estoque atual: <span className="font-medium">{stockModalProduct.stock} unidades</span></p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operação
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="add"
                  checked={stockOperation === 'add'}
                  onChange={(e) => setStockOperation(e.target.value as 'add' | 'remove')}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-800">Adicionar</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="remove"
                  checked={stockOperation === 'remove'}
                  onChange={(e) => setStockOperation(e.target.value as 'add' | 'remove')}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-800">Remover</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-800 placeholder-gray-400"
              placeholder="Digite a quantidade"
            />
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              onClick={() => setStockModalProduct(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={adjustStock}
              disabled={stockQuantity <= 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stockOperation === 'add' ? 'Adicionar' : 'Remover'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  )
}