import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verificarEstoqueBaixo } from '@/lib/stockChecker';

const prisma = new PrismaClient();

interface StockItem {
  sku: string;
  quantidade: number;
}

interface RequestBody {
  itens: StockItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { itens } = body;

    // Validar dados de entrada
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Nenhum item fornecido ou formato inválido' 
        },
        { status: 400 }
      );
    }

    // Validar cada item
    for (const item of itens) {
      if (!item.sku || typeof item.sku !== 'string') {
        return NextResponse.json(
          { 
            success: false,
            message: 'SKU é obrigatório e deve ser uma string' 
          },
          { status: 400 }
        );
      }
      if (!item.quantidade || typeof item.quantidade !== 'number' || item.quantidade <= 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Quantidade deve ser um número maior que zero' 
          },
          { status: 400 }
        );
      }
    }

    // Executar transação para decrementar estoque
    const resultados = await prisma.$transaction(async (tx) => {
      const updates = [];

      for (const item of itens) {
        // Buscar produto
        const produto = await tx.product.findUnique({
          where: { sku: item.sku },
          select: { 
            sku: true, 
            nome: true, 
            estoque: true 
          }
        });

        // Verificar se produto existe
        if (!produto) {
          throw new Error(`Produto com SKU "${item.sku}" não foi encontrado`);
        }

        // Verificar estoque (apenas se não for null)
        if (produto.estoque !== null && produto.estoque < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para "${produto.nome}". ` +
            `Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`
          );
        }

        // Decrementar estoque
        const produtoAtualizado = await tx.product.update({
          where: { sku: item.sku },
          data: {
            estoque: produto.estoque !== null ? {
              decrement: item.quantidade
            } : {
              set: -item.quantidade // Se estoque era null, define como negativo
            }
          },
          select: {
            sku: true,
            nome: true,
            estoque: true
          }
        });

        updates.push({
          sku: produtoAtualizado.sku,
          nome: produtoAtualizado.nome,
          estoqueAnterior: produto.estoque,
          estoqueAtual: produtoAtualizado.estoque,
          quantidadeVendida: item.quantidade
        });
      }

      return updates;
    });

    // NOVA FUNCIONALIDADE: Verificar estoque baixo após atualização
    try {
      await verificarEstoqueBaixo();
    } catch (error) {
      console.error('Erro ao verificar estoque baixo:', error);
      // Não falhar a operação principal por conta da notificação
    }

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: `Estoque atualizado com sucesso para ${resultados.length} produto(s)`,
      produtos: resultados
    });

  } catch (error) {
    console.error('Erro ao decrementar estoque:', error);

    // Diferentes tipos de erro
    if (error instanceof Error) {
      // Erro de validação ou negócio
      if (error.message.includes('não foi encontrado') || 
          error.message.includes('Estoque insuficiente')) {
        return NextResponse.json(
          {
            success: false,
            message: error.message
          },
          { status: 400 }
        );
      }
    }

    // Erro interno do servidor
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor ao atualizar estoque'
      },
      { status: 500 }
    );

  } finally {
    // Desconectar Prisma
    await prisma.$disconnect();
  }
}