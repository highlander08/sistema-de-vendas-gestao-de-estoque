/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Configurações da API Meta WhatsApp
const whatsappApiUrl = 'https://graph.facebook.com/v22.0';
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const managerPhoneNumber = process.env.MANAGER_PHONE_NUMBER;

export const dynamic = 'force-dynamic'; // Necessário para cron jobs na Vercel

export async function GET(request: Request) {
  // Log de inicialização com timestamp
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Iniciando verificação de validade de produtos`);

  // Verificação de segurança - apenas chamadas com token secreto
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[AUTH ERROR] Tentativa de acesso não autorizada');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const alertDate = new Date();
    alertDate.setDate(today.getDate() + 7); // 7 dias no futuro

    // Buscar produtos com validade próxima
    const expiringProducts = await prisma.product.findMany({
      where: {
        validade: {
          not: null,
          gte: today,
          lte: alertDate
        },
        estoque: { gt: 0 }
      },
      orderBy: { validade: 'asc' }
    });

    console.log(`[${new Date().toISOString()}] Produtos encontrados: ${expiringProducts.length}`);

    // Se não houver produtos, retornar early
    if (expiringProducts.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum produto próximo da validade',
        timestamp: new Date().toISOString(),
        executionTime: `${(new Date().getTime() - startTime.getTime())}ms`
      });
    }

    // Construir mensagem para WhatsApp
    let alertMessage = '⚠️ *ALERTA DE VALIDADE* ⚠️\n\n';
    alertMessage += `*Data da verificação:* ${today.toLocaleDateString('pt-BR')}\n`;
    alertMessage += `*Total de produtos:* ${expiringProducts.length}\n\n`;
    
    // Adicionar detalhes de cada produto
    expiringProducts.forEach((product, index) => {
      const expiryDate = product.validade ? new Date(product.validade) : null;
      const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (86400000)) : 0;
      
      alertMessage += `*${index + 1}. ${product.nome}*${product.marca ? ` (${product.marca})` : ''}\n`;
      alertMessage += `   📅 Validade: ${expiryDate?.toLocaleDateString('pt-BR')} (${daysLeft} dias)\n`;
      alertMessage += `   🏷️ SKU: ${product.sku} | 📦 Estoque: ${product.estoque} un.\n\n`;
    });

    // Validar variáveis de ambiente do WhatsApp
    if (!phoneNumberId || !accessToken || !managerPhoneNumber) {
      throw new Error('Variáveis de ambiente do WhatsApp não configuradas');
    }

    // Enviar via API Meta WhatsApp
    const response = await axios.post(
      `${whatsappApiUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: managerPhoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: alertMessage
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[${new Date().toISOString()}] WhatsApp enviado com ID: ${response.data.messages[0].id}`);

    return NextResponse.json({
      success: true,
      message: 'Alerta enviado com sucesso',
      productsCount: expiringProducts.length,
      whatsappMessageId: response.data.messages[0].id,
      timestamp: new Date().toISOString(),
      executionTime: `${(new Date().getTime() - startTime.getTime())}ms`
    });

  } catch (error: any) {
    console.error(`[ERROR] ${new Date().toISOString()}`, error);
    
    // Tentar enviar mensagem de erro via WhatsApp (se as credenciais estiverem disponíveis)
    if (phoneNumberId && accessToken && managerPhoneNumber) {
      try {
        await axios.post(
          `${whatsappApiUrl}/${phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: managerPhoneNumber,
            type: 'text',
            text: {
              preview_url: false,
              body: `❌ ERRO NO SISTEMA DE VALIDADE ❌\n\n${error.message || 'Erro desconhecido'}\n\nTimestamp: ${new Date().toISOString()}`
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (whatsappError) {
        console.error('[WHATSAPP ERROR] Falha ao enviar mensagem de erro', whatsappError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Falha no processamento',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log(`[${new Date().toISOString()}] Conexão com Prisma encerrada`);
  }
}