import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt']
    return config
  },
  // Configurações adicionais recomendadas para Prisma
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Otimizações para API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Configurações de logging para debug
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig