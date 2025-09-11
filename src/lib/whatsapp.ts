import axios, { AxiosError } from 'axios';

const whatsappApiUrl = 'https://graph.facebook.com/v22.0';
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const managerPhoneNumber = process.env.MANAGER_PHONE_NUMBER;

interface ProdutoEstoqueBaixo {
  sku: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export async function enviarNotificacaoEstoqueBaixo(produtos: ProdutoEstoqueBaixo[]) {
  try {
    // Validar variáveis de ambiente
    if (!phoneNumberId || !accessToken || !managerPhoneNumber) {
      console.error('Variáveis de ambiente do WhatsApp não configuradas:', {
        phoneNumberId: !!phoneNumberId,
        accessToken: !!accessToken,
        managerPhoneNumber: !!managerPhoneNumber
      });
      return false;
    }

    // Validar lista de produtos
    if (!produtos || produtos.length === 0) {
      console.error('Nenhum produto com estoque baixo fornecido');
      return false;
    }

    console.log('Enviando notificação para produtos:', produtos);

    // Criar mensagem formatada
    let mensagem = '🚨 *ALERTA DE ESTOQUE BAIXO* 🚨\n\n';
    
    produtos.forEach((produto, index) => {
      mensagem += `${index + 1}. *${produto.nome}*\n`;
      mensagem += `   SKU: ${produto.sku}\n`;
      mensagem += `   Estoque atual: ${produto.estoqueAtual}\n`;
      mensagem += `   Estoque mínimo: ${produto.estoqueMinimo}\n\n`;
    });

    mensagem += '⚠️ *Reposição urgente necessária!*';

    console.log('Mensagem a ser enviada:', mensagem);

    // Enviar mensagem via WhatsApp Business API
    const response = await axios.post(
      `${whatsappApiUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: managerPhoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: mensagem
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Resposta da API do WhatsApp:', JSON.stringify(response.data, null, 2));
    console.log(`Notificação enviada com sucesso. ID: ${response.data.messages[0].id}`);
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Erro ao enviar notificação WhatsApp:', {
        message: axiosError.message,
        stack: axiosError.stack,
        response: axiosError.response ? JSON.stringify(axiosError.response.data, null, 2) : null
      });
    } else if (error instanceof Error) {
      console.error('Erro ao enviar notificação WhatsApp:', {
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Erro ao enviar notificação WhatsApp:', error);
    }
    return false;
  }
}