import { PrismaClient } from '@prisma/client';
import { enviarNotificacaoEstoqueBaixo } from './whatsapp';

const prisma = new PrismaClient();

interface ConfiguracaoEstoque {
  estoqueMinimoPadrao: number;
  // Você pode adicionar configurações específicas por categoria ou produto
  configuracaoPorCategoria?: {
    [categoria: string]: number;
  };
}

const configuracao: ConfiguracaoEstoque = {
  estoqueMinimoPadrao: 10, // Estoque mínimo padrão
  configuracaoPorCategoria: {
    'Eletrônicos': 5,
    'Roupas': 15,
    'Alimentação': 20,
    // Adicione mais categorias conforme necessário
  }
};

export async function verificarEstoqueBaixo() {
  try {
    // Buscar todos os produtos com estoque
    const produtos = await prisma.product.findMany({
      where: {
        estoque: {
          not: null
        }
      },
      select: {
        sku: true,
        nome: true,
        categoria: true,
        estoque: true
      }
    });

    const produtosComEstoqueBaixo = [];

    for (const produto of produtos) {
      if (produto.estoque === null) continue;

      // Determinar estoque mínimo baseado na categoria
      const estoqueMinimo = configuracao.configuracaoPorCategoria?.[produto.categoria] 
        || configuracao.estoqueMinimoPadrao;

      // Verificar se está abaixo do estoque mínimo
      if (produto.estoque <= estoqueMinimo) {
        produtosComEstoqueBaixo.push({
          sku: produto.sku,
          nome: produto.nome,
          estoqueAtual: produto.estoque,
          estoqueMinimo: estoqueMinimo
        });
      }
    }

    // Enviar notificação se houver produtos com estoque baixo
    if (produtosComEstoqueBaixo.length > 0) {
      console.log(`Encontrados ${produtosComEstoqueBaixo.length} produtos com estoque baixo`);
      await enviarNotificacaoEstoqueBaixo(produtosComEstoqueBaixo);
      return produtosComEstoqueBaixo;
    }

    console.log('Nenhum produto com estoque baixo encontrado');
    return [];

  } catch (error) {
    console.error('Erro ao verificar estoque baixo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}