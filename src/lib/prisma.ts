import { PrismaClient } from '@prisma/client'

// Configuração otimizada para Supabase
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Para Supabase, é melhor sempre criar nova instância
const prisma = createPrismaClient()

export { prisma }