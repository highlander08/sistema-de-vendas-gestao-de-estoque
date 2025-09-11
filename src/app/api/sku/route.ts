import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku } = body;

    if (!sku) {
      return NextResponse.json(
        { message: 'SKU não fornecido' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Produto não encontrado com este SKU' },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar produto por SKU:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}