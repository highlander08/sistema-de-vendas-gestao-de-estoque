import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const managerPhoneNumber = process.env.MANAGER_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

interface ProdutoEstoqueBaixo {
  sku: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export async function enviarNotificacaoEstoqueBaixo(produtos: ProdutoEstoqueBaixo[]) {
  try {
    if (!accountSid || !authToken || !twilioPhoneNumber || !managerPhoneNumber) {
      console.error('Variáveis de ambiente do Twilio não configuradas');
      return false;
    }

    // Criar mensagem formatada
    let mensagem = '🚨 *ALERTA DE ESTOQUE BAIXO* 🚨\n\n';
    
    produtos.forEach((produto, index) => {
      mensagem += `${index + 1}. *${produto.nome}*\n`;
      mensagem += `   SKU: ${produto.sku}\n`;
      mensagem += `   Estoque atual: ${produto.estoqueAtual}\n`;
      mensagem += `   Estoque mínimo: ${produto.estoqueMinimo}\n\n`;
    });

    mensagem += '⚠️ *Reposição urgente necessária!*';

    // Enviar mensagem via WhatsApp
    const message = await client.messages.create({
      body: mensagem,
      to: `whatsapp:${managerPhoneNumber}`,
      from: `whatsapp:${twilioPhoneNumber}`,
    });

    console.log(`Notificação enviada com sucesso. SID: ${message.sid}`);
    return true;

  } catch (error) {
    console.error('Erro ao enviar notificação WhatsApp:', error);
    return false;
  }
}