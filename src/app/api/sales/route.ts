import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Define interfaces for the request data
interface Product {
  sku: string;
  nome: string;
}

interface SaleItem {
  produto: Product;
  preco: number;
  quantidade: number;
}

interface SaleRequest {
  items: SaleItem[];
  total: number;
  paymentMethod: string;
}

export async function POST(request: Request) {
  try {
    const { items, total, paymentMethod }: SaleRequest = await request.json();

    // Validação básica dos dados
    if (!items || !total || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Cria a venda no banco de dados
    const sale = await prisma.sale.create({
      data: {
        total,
        paymentMethod,
        items: {
          create: items.map((item: SaleItem) => ({
            productSku: item.produto.sku,
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

    return NextResponse.json({ success: true, sale }, { status: 201 });
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
    console.log('GET /api/sales chamado:', new Date().toISOString()); // Log para debug
    const sales = await prisma.sale.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limita a 100 vendas para otimizar
    });

    return NextResponse.json(sales, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30', // Cache por 60s
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar vendas:', error);
    if (
      error.code === 'P1001' ||
      error.message.includes('prepared statement') ||
      error.message.includes('database')
    ) {
      // Tenta reconectar ao banco
      try {
        await prisma.$connect();
        console.log('Reconexão bem-sucedida:', new Date().toISOString());
        const sales = await prisma.sale.findMany({
          include: {
            items: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100,
        });
        return NextResponse.json(sales, {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          },
        });
      } catch (reconnectError) {
        console.error('Erro ao reconectar ao banco:', reconnectError);
        return NextResponse.json(
          { success: false, message: 'Erro ao reconectar ao banco de dados' },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar vendas' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    console.log('DELETE /api/sales chamado:', new Date().toISOString()); // Log para debug
    await prisma.$transaction([
      prisma.saleItem.deleteMany({}),
      prisma.sale.deleteMany({}),
    ]);

    return NextResponse.json(
      { success: true, message: 'Vendas excluídas com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir vendas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao excluir vendas' },
      { status: 500 }
    );
  }
}