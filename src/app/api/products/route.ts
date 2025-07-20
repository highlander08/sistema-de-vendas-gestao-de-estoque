/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

// Interfaces TypeScript
interface ProductData {
  name: string
  description?: string
  price: number
  category: string
  brand?: string
  stock: number
  sku?: string
  status: 'active' | 'inactive' | 'draft'
}

interface Product extends ProductData {
  id: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  message: string
  product?: Product
}

interface ProductListResponse {
  products: Product[]
  total: number
}

// Simulação de banco de dados (substitua pela sua conexão real)
// Exemplo com Prisma, MongoDB, MySQL, PostgreSQL, etc.
const products: Product[] = [] // Array temporário para demonstração

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: ProductData = await request.json()
    
    // Validação básica dos dados
    const { name, price, stock, category } = body
    
    if (!name || price === undefined || stock === undefined || !category) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validações adicionais
    if (price <= 0) {
      return NextResponse.json(
        { message: 'Preço deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (stock < 0) {
      return NextResponse.json(
        { message: 'Estoque não pode ser negativo' },
        { status: 400 }
      )
    }

    // Criação do produto
    const newProduct: Product = {
      id: Date.now().toString(), // ID simples para demonstração
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    /*
    // PRISMA EXAMPLE:
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        brand: body.brand,
        stock: body.stock,
        sku: body.sku,
        status: body.status
      }
    })
    */

    /* 
    // MONGOOSE (MongoDB) EXAMPLE:
    const product = new Product({
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      brand: body.brand,
      stock: body.stock,
      sku: body.sku,
      status: body.status
    })
    await product.save()
    */

    /*
    // MYSQL/PostgreSQL com raw queries:
    const query = `
      INSERT INTO products (name, description, price, category, brand, stock, sku, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `
    const result = await db.execute(query, [
      body.name,
      body.description,
      body.price,
      body.category,
      body.brand,
      body.stock,
      body.sku,
      body.status
    ])
    */

    // Simulação - adicionar ao array temporário
    products.push(newProduct)
    
    console.log('Produto criado:', newProduct)

    return NextResponse.json(
      {
        message: 'Produto cadastrado com sucesso',
        product: newProduct
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar produto:', error)
    
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar produtos (opcional)
export async function GET(): Promise<NextResponse<ProductListResponse>> {
  try {
    // Buscar produtos do banco de dados
    // const products = await prisma.product.findMany()
    
    return NextResponse.json({
      products,
      total: products.length
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar produtos' } as any,
      { status: 500 }
    )
  }
}