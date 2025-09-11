import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { items, total, paymentMethod } = await request.json();

    // Cria a venda no banco de dados
    const sale = await prisma.sale.create({
      data: {
        total,
        paymentMethod,
        items: {
          create: items.map((item: any) => ({
            productSku: item.produto.sku, // Assumindo que você passará o SKU
            productName: item.produto.nome,
            price: item.preco,
            quantity: item.quantidade,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      sale 
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar venda' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: true,
      },
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar vendas' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    return NextResponse.json({ success: true, message: 'Vendas excluídas com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir vendas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao excluir vendas' },
      { status: 500 }
    );
  }
}