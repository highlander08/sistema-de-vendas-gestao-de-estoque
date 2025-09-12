import { PrismaClient } from '@prisma/client';

// Configuração otimizada para Supabase
const createPrismaClient = () => {
  console.log('Criando nova instância do PrismaClient:', new Date().toISOString()); // Log para debug
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Sempre cria nova instância para Supabase
const prisma = createPrismaClient();

export { prisma };