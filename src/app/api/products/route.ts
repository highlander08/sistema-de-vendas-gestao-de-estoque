import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Recebido body:', body)

    const {
      nome,
      marca,
      categoria,
      preco,
      estoque,
      sku,
      validade
    } = body

    const produto = await prisma.product.create({
      data: {
        nome,
        marca,
        categoria,
        preco,
        estoque,
        sku,
        validade: new Date(validade) // Aceita string ISO ou objeto Date
      }
    })

    return NextResponse.json(
      {
        message: 'Produto cadastrado com sucesso',
        product: produto
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

export async function GET() {
  try {
    const produtos = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      products: produtos,
      total: produtos.length
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}
