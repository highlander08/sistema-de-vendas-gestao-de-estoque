// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     console.log('Recebido body:', body)

//     const {
//       nome,
//       marca,
//       categoria,
//       preco,
//       estoque,
//       sku,
//       validade
//     } = body

//     const produto = await prisma.product.create({
//       data: {
//         nome,
//         marca,
//         categoria,
//         preco,
//         estoque,
//         sku,
//         validade: new Date(validade) // Aceita string ISO ou objeto Date
//       }
//     })

//     return NextResponse.json(
//       {
//         message: 'Produto cadastrado com sucesso',
//         product: produto
//       },
//       { status: 201 }
//     )

//   } catch (error) {
//     console.error('Erro ao criar produto:', error)
//     return NextResponse.json(
//       { message: 'Erro interno do servidor' },
//       { status: 500 }
//     )
//   }
// }

// export async function GET() {
//   try {
//     const products = await prisma.product.findMany({
//       orderBy: { createdAt: 'desc' }
//     })

//     return NextResponse.json({
//       products,
//       total: products.length
//     })
//   } catch (error) {
//     console.error('Erro ao buscar produtos:', error)
//     return NextResponse.json(
//       { message: 'Erro ao buscar produtos' },
//       { status: 500 }
//     )
//   }
// }

// versao 2
import { NextRequest, NextResponse } from 'next/server'
import { prisma, disconnectPrisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Recebido body:', body);

    const { nome, marca, categoria, preco, estoque, sku, validade } = body;

    const produto = await prisma.product.create({
      data: {
        nome,
        marca,
        categoria,
        preco,
        estoque: parseInt(estoque), // Converte estoque para número
        sku,
        validade: validade ? new Date(validade) : null,
      },
    });

    return NextResponse.json(
      {
        message: 'Produto cadastrado com sucesso',
        product: produto,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Força desconexão para limpar prepared statements
    await disconnectPrisma()
    
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products, { status: 200 })
    
  } catch (error) {
    console.error('Database error:', error)
    
    // Tratamento específico para erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Erro conhecido do banco de dados',
          code: error.code,
          message: error.message 
        },
        { status: 500 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return NextResponse.json(
        { 
          error: 'Erro desconhecido do banco de dados',
          message: 'Problema de conexão com o banco' 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {

    const body = await request.json();
    const { nome, marca, categoria, preco, estoque, sku, validade, updatedAt} = body;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(body.id) },
      data: {
        nome,
        marca,
        categoria,
        preco,
        estoque: parseInt(estoque), // Converte estoque para número
        sku,
        validade: validade ? new Date(validade) : null,
        updatedAt: new Date(updatedAt),
      },
    });

    return NextResponse.json({
      message: 'Produto atualizado com sucesso',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { productId, quantity, type } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: 'ID do produto não fornecido' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { message: 'Quantidade inválida' },
        { status: 400 }
      );
    }

    if (type !== 'add' && type !== 'remove') {
      return NextResponse.json(
        { message: 'Tipo de operação inválido' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    const newStock =
      type === 'add'
        ? (product.estoque ?? 0) + quantity
        : Math.max(0, (product.estoque ?? 0) - quantity);

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        estoque: newStock,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `Estoque ${type === 'add' ? 'adicionado' : 'removido'} com sucesso`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    return NextResponse.json(
      { message: 'Erro ao ajustar estoque' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // const { searchParams } = new URL(request.url);
    // const id = searchParams.get('id');
    // if (!id) {
    //   return NextResponse.json(
    //     { message: 'ID do produto não fornecido' },
    //     { status: 400 }
    //   );
    // }
     const body = await request.json();

    await prisma.product.delete({ where: { id: parseInt(body.id) } });

    return NextResponse.json({
      message: 'Produto deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { message: 'Erro ao deletar produto' },
      { status: 500 }
    );
  }
}

// Garante que o Prisma Client seja desconectado após o uso
export const dynamic = 'force-dynamic'; // Necessário para Next.js App Router
