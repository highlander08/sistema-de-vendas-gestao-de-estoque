/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request: any) {
  console.log(`[${new Date().toISOString()}] Iniciando verificação de validade`);
  
  // Verificar se é chamada autorizada (GitHub Actions)
  const authHeader = request.headers.get('authorization');
  const isAuthorizedCall = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  // Se não for chamada autorizada, verificar horário
  if (!isAuthorizedCall) {
    const now = new Date();
    const brasiliaTime = now.toLocaleTimeString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const [hours, minutes] = brasiliaTime.split(':').map(Number);
    
    console.log(`Chamada manual às ${brasiliaTime}`);
    
    if (hours !== 21 || minutes > 0) {
      return NextResponse.json({
        message: 'Execução ignorada - só processa às 21:00',
        currentTime: brasiliaTime,
        requiredTime: '21:00',
        isAutomatedCall: false
      }, { status: 200 });
    }
  } else {
    console.log('Chamada automática do GitHub Actions');
  }

  // Lógica principal
  try {
    const today = new Date();
    const alertDate = new Date();
    alertDate.setDate(today.getDate() + 7);

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

    console.log(`Encontrados ${expiringProducts.length} produtos próximos da validade`);

    if (expiringProducts.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum produto próximo da validade',
        isAutomatedCall: isAuthorizedCall,
        timestamp: new Date().toISOString(),
        productsFound: 0
      });
    }

    // Construir mensagem para WhatsApp
    let alertMessage = '⚠️ *ALERTA DE VALIDADE* ⚠️\n\n';
    alertMessage += `*Data:* ${today.toLocaleDateString('pt-BR')}\n`;
    alertMessage += `*Executado via:* ${isAuthorizedCall ? 'GitHub Actions' : 'Manual'}\n\n`;
    
    expiringProducts.forEach(product => {
      const expiryDate = product.validade ? new Date(product.validade) : null;
      const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (86400000)) : 0;
      
      alertMessage += `▸ *${product.nome}*${product.marca ? ` (${product.marca})` : ''}\n`;
      alertMessage += `   📅 ${expiryDate?.toLocaleDateString('pt-BR')} (${daysLeft} dias)\n`;
      alertMessage += `   🏷️ ${product.sku} | 📦 ${product.estoque} un.\n\n`;
    });

    // Enviar via WhatsApp
    await client.messages.create({
      body: alertMessage,
      to: `whatsapp:${process.env.MANAGER_PHONE_NUMBER}`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`
    });

    console.log('WhatsApp enviado com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Alerta enviado com sucesso',
      products: expiringProducts.length,
      isAutomatedCall: isAuthorizedCall,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json(
      { 
        error: 'Falha no processamento',
        message: error.message,
        isAutomatedCall: isAuthorizedCall,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}