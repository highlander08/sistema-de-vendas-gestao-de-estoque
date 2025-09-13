/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { NextResponse } from 'next/server';

// const prisma = new PrismaClient();

// Configurações da API Meta WhatsApp
const whatsappApiUrl = 'https://graph.facebook.com/v22.0';
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const managerPhoneNumber = process.env.MANAGER_PHONE_NUMBER;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Iniciando verificação de validade de produtos`);

    const isCron = request.headers.get('x-vercel-cron') === 'true';
  const authHeader = request.headers.get('authorization');

  if (!isCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[AUTH ERROR] Tentativa de acesso não autorizada');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Validar variáveis de ambiente PRIMEIRO
    console.log('Validando variáveis de ambiente...');
    console.log(`phoneNumberId exists: ${!!phoneNumberId}`);
    console.log(`accessToken exists: ${!!accessToken}`);
    console.log(`managerPhoneNumber exists: ${!!managerPhoneNumber}`);
    
    if (!phoneNumberId || !accessToken || !managerPhoneNumber) {
      const missingVars = [];
      if (!phoneNumberId) missingVars.push('WHATSAPP_PHONE_NUMBER_ID');
      if (!accessToken) missingVars.push('WHATSAPP_ACCESS_TOKEN');
      if (!managerPhoneNumber) missingVars.push('MANAGER_PHONE_NUMBER');
      
      throw new Error(`Variáveis de ambiente não configuradas: ${missingVars.join(', ')}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa
    
    const alertDate = new Date();
    alertDate.setDate(today.getDate() + 7);
    alertDate.setHours(23, 59, 59, 999); // Fim do dia

    console.log(`Buscando produtos entre ${today.toISOString()} e ${alertDate.toISOString()}`);

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

    // SEMPRE enviar uma mensagem, mesmo se não houver produtos
    let alertMessage = '';
    
    if (expiringProducts.length === 0) {
      alertMessage = '✅ *VERIFICAÇÃO DE VALIDADE* ✅\n\n';
      alertMessage += `*Data:* ${today.toLocaleDateString('pt-BR')}\n`;
      alertMessage += '*Status:* Nenhum produto próximo da validade nos próximos 7 dias.\n\n';
      alertMessage += '🎉 Tudo em ordem!';
    } else {
      alertMessage = '⚠️ *ALERTA DE VALIDADE* ⚠️\n\n';
      alertMessage += `*Data da verificação:* ${today.toLocaleDateString('pt-BR')}\n`;
      alertMessage += `*Total de produtos:* ${expiringProducts.length}\n\n`;
      
      // Limitar a 10 produtos para evitar mensagem muito longa
      const productsToShow = expiringProducts.slice(0, 10);
      
      productsToShow.forEach((product, index) => {
        const expiryDate = product.validade ? new Date(product.validade) : null;
        const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (86400000)) : 0;
        
        alertMessage += `*${index + 1}. ${product.nome}*${product.marca ? ` (${product.marca})` : ''}\n`;
        alertMessage += `📅 Validade: ${expiryDate?.toLocaleDateString('pt-BR')} (${daysLeft} dias)\n`;
        alertMessage += `🏷️ SKU: ${product.sku} | 📦 Estoque: ${product.estoque} un.\n\n`;
      });
      
      if (expiringProducts.length > 10) {
        alertMessage += `... e mais ${expiringProducts.length - 10} produtos.\n\n`;
      }
    }

    // Garantir que o número de telefone esteja no formato correto
    let formattedPhoneNumber = managerPhoneNumber.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    // Se não começar com código do país, adicionar 55 (Brasil)
    if (!formattedPhoneNumber.startsWith('55')) {
      formattedPhoneNumber = '55' + formattedPhoneNumber;
    }

    console.log(`Enviando mensagem para: ${formattedPhoneNumber}`);
    console.log(`Tamanho da mensagem: ${alertMessage.length} caracteres`);

    // Enviar via API Meta WhatsApp com timeout e retry
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhoneNumber,
      type: 'text',
      text: {
        preview_url: false,
        body: alertMessage
      }
    };

    console.log('Payload WhatsApp:', JSON.stringify(whatsappPayload, null, 2));

    const response = await axios.post(
      `${whatsappApiUrl}/${phoneNumberId}/messages`,
      whatsappPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 segundos de timeout
      }
    );

    console.log(`[${new Date().toISOString()}] WhatsApp Response:`, response.data);

    const messageId = response.data?.messages?.[0]?.id || 'ID não disponível';
    console.log(`[${new Date().toISOString()}] WhatsApp enviado com ID: ${messageId}`);

    return NextResponse.json({
      success: true,
      message: 'Alerta enviado com sucesso',
      productsCount: expiringProducts.length,
      whatsappMessageId: messageId,
      phoneNumber: formattedPhoneNumber,
      messageLength: alertMessage.length,
      timestamp: new Date().toISOString(),
      executionTime: `${(new Date().getTime() - startTime.getTime())}ms`
    });

  } catch (error: any) {
    console.error(`[ERROR] ${new Date().toISOString()}`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    // Tentar enviar mensagem de erro via WhatsApp
    if (phoneNumberId && accessToken && managerPhoneNumber) {
      try {
        let formattedPhoneNumber = managerPhoneNumber.replace(/\D/g, '');
        if (!formattedPhoneNumber.startsWith('55')) {
          formattedPhoneNumber = '55' + formattedPhoneNumber;
        }

        const errorMessage = `❌ ERRO NO SISTEMA DE VALIDADE ❌\n\n${error.message || 'Erro desconhecido'}\n\nTimestamp: ${new Date().toISOString()}`;
        
        await axios.post(
          `${whatsappApiUrl}/${phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhoneNumber,
            type: 'text',
            text: {
              preview_url: false,
              body: errorMessage
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        console.log('Mensagem de erro enviada via WhatsApp');
      } catch (whatsappError: any) {
        console.error('[WHATSAPP ERROR] Falha ao enviar mensagem de erro:', {
          message: whatsappError.message,
          response: whatsappError.response?.data
        });
      }
    }

    return NextResponse.json(
      { 
        error: 'Falha no processamento',
        message: error.message,
        details: error.response?.data || null,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log(`[${new Date().toISOString()}] Conexão com Prisma encerrada`);
  }
}

// Função para teste manual (opcional)
export async function POST(request: Request) {
  console.log('Executando teste manual da verificação de validade');
  return GET(request);
}