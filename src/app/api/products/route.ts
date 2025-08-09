import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Necessário para Next.js App Router

function handlePrismaError(error: unknown) {
  console.error('Database error:', error)
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      { 
        error: 'Database error',
        code: error.code,
        message: error.message 
      },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received body:', body)

    const { nome, marca, categoria, preco, estoque, sku, validade } = body

    const produto = await prisma.product.create({
      data: {
        nome,
        marca,
        categoria,
        preco: parseFloat(preco),
        estoque: parseInt(estoque),
        sku,
        validade: validade ? new Date(validade) : null,
      },
    })

    return NextResponse.json(
      {
        message: 'Produto cadastrado com sucesso',
        product: produto,
      },
      { status: 201 }
    )
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nome, marca, categoria, preco, estoque, sku, validade } = body

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        marca,
        categoria,
        preco: parseFloat(preco),
        estoque: parseInt(estoque),
        sku,
        validade: validade ? new Date(validade) : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Produto atualizado com sucesso',
      product: updatedProduct,
    })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { productId, quantity, type } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { message: 'ID do produto não fornecido' },
        { status: 400 }
      )
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { message: 'Quantidade inválida' },
        { status: 400 }
      )
    }

    if (type !== 'add' && type !== 'remove') {
      return NextResponse.json(
        { message: 'Tipo de operação inválido' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const newStock = type === 'add'
      ? (product.estoque ?? 0) + quantity
      : Math.max(0, (product.estoque ?? 0) - quantity)

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        estoque: newStock,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: `Estoque ${type === 'add' ? 'adicionado' : 'removido'} com sucesso`,
      product: updatedProduct,
    })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { message: 'ID do produto não fornecido' },
        { status: 400 }
      )
    }

    await prisma.product.delete({ where: { id: parseInt(body.id) } })

    return NextResponse.json({
      message: 'Produto deletado com sucesso',
    })
  } catch (error) {
    return handlePrismaError(error)
  }
}