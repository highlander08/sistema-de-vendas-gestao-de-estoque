"use client";

import Link from "next/link";
import { ShoppingCart, FileText, BarChart2, Package } from "lucide-react";

export default function Home() {
  const features = [
    {
      name: "PDV",
      description: "Processe vendas rapidamente com nosso ponto de venda intuitivo.",
      href: "/ponto-de-venda",
      icon: ShoppingCart,
    },
    {
      name: "Recibo",
      description: "Gere recibos detalhados para todas as suas transações.",
      href: "/recibo-de-pagamento",
      icon: FileText,
    },
    {
      name: "Dashboard",
      description: "Acompanhe métricas de vendas e analise o desempenho em tempo real.",
      href: "/dashboard",
      icon: BarChart2,
    },
    {
      name: "Gestão de Estoque",
      description: "Controle seu inventário com facilidade e precisão.",
      href: "/gestao-de-estoque",
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Sistema PDV
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Gerencie suas vendas, recibos, análises e estoque com uma solução completa e fácil de usar.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              href="/ponto-de-venda"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Venda
              <ShoppingCart className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/gestao-de-estoque"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium text-sm sm:text-base rounded-lg hover:bg-gray-100 transition-colors"
            >
              Gerenciar Estoque
              <Package className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
                <h3 className="ml-3 text-lg font-semibold text-gray-900">{feature.name}</h3>
              </div>
              <p className="text-gray-600 text-sm flex-grow">{feature.description}</p>
              <span className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center">
                Acessar
                <span className="ml-1">→</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Sistema PDV. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}