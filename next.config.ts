// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ['@prisma/client'], // Substitui serverComponentsExternalPackages
  },
};

export default nextConfig;