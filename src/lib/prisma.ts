import { PrismaClient } from '@prisma/client'

// Adiciona o Prisma Client ao objeto global em desenvolvimento
// para evitar múltiplas instâncias
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma