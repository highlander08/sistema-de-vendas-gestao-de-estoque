/* eslint-disable @typescript-eslint/no-explicit-any */
// types/index.ts

// Enum para status do produto
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

// Enum para categorias (extensível)
export enum ProductCategory {
  ELETRONICOS = 'eletronicos',
  ROUPAS = 'roupas',
  CASA = 'casa',
  ESPORTES = 'esportes',
  LIVROS = 'livros',
  BELEZA = 'beleza',
  OUTROS = 'outros'
}

// Interface base do produto
export interface BaseProduct {
  name: string
  description?: string
  price: number
  category: ProductCategory | string
  brand?: string
  stock: number
  sku?: string
  status: ProductStatus
}

// Interface para dados do formulário (strings antes da conversão)
export interface ProductFormData {
  name: string
  description: string
  price: string // String no form, convertida para number
  category: string
  brand: string
  stock: string // String no form, convertida para number
  sku: string
  status: ProductStatus
}

// Interface completa do produto (com ID e timestamps)
export interface Product extends BaseProduct {
  id: string
  createdAt: string
  updatedAt: string
}

// Interface para resposta da API
export interface ApiResponse<T = any> {
  message: string
  data?: T
  error?: string
}

// Interface específica para resposta de criação de produto
export interface CreateProductResponse extends ApiResponse {
  product: Product
}

// Interface para listagem de produtos
export interface ProductListResponse extends ApiResponse {
  products: Product[]
  total: number
  page?: number
  limit?: number
}

// Interface para filtros de busca
export interface ProductFilters {
  category?: ProductCategory | string
  status?: ProductStatus
  priceMin?: number
  priceMax?: number
  search?: string
  brand?: string
  inStock?: boolean
}

// Interface para paginação
export interface PaginationParams {
  page: number
  limit: number
  orderBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

// Interface para estado de loading/erro
export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

// Interface para status de submit do formulário
export interface SubmitStatus {
  type: 'success' | 'error' | 'warning' | ''
  message: string
}

// Tipos para validação de formulário
export interface FieldError {
  message: string
  type: string
}

export interface FormErrors {
  [key: string]: FieldError | undefined
}

// Interface para configurações da aplicação
export interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
  }
  pagination: {
    defaultLimit: number
    maxLimit: number
  }
  validation: {
    maxProductNameLength: number
    maxDescriptionLength: number
    minPrice: number
    maxPrice: number
    maxStock: number
  }
}

// Tipos para hooks customizados
export interface UseProductsOptions {
  filters?: ProductFilters
  pagination?: PaginationParams
  enabled?: boolean
}

export interface UseProductReturn {
  products: Product[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => void
}

// Tipos para banco de dados (exemplo com Prisma)
export interface PrismaProductData {
  name: string
  description?: string | null
  price: number
  category: string
  brand?: string | null
  stock: number
  sku?: string | null
  status: string
}

// Tipos para MongoDB (exemplo com Mongoose)
export interface MongoProductDocument extends BaseProduct {
  _id: string
  createdAt: Date
  updatedAt: Date
}

// Utilitários de tipo
export type PartialProduct = Partial<Product>
export type ProductUpdate = Partial<Omit<Product, 'id' | 'createdAt'>>
export type CreateProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

// Tipos para eventos do formulário
export type FormEvent = React.FormEvent<HTMLFormElement>
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>

// Tipos para componentes
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface FormFieldProps extends ComponentProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
}