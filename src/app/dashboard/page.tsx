"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { DollarSign, ShoppingCart, RefreshCw, ChevronDown, ChevronUp, Calendar, Package, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

// Interfaces compatíveis com o PDV e Prisma
interface SaleItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: string;
  data: string;
  itens: SaleItem[];
  total: number;
  paymentMethod: string;
}

interface CategoryData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface KPIs {
  totalVendas: number;
  totalPedidos: number;
  ticketMedio: number;
  produtoMaisVendido: string;
}

// Interface para o payload do tooltip
interface TooltipPayloadItem {
  payload: {
    amount: number;
    name: string;
    value: number;
    color: string;
  };
}

const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    totalVendas: 0,
    totalPedidos: 0,
    ticketMedio: 0,
    produtoMaisVendido: '',
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categoryColors: string[] = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
    '#EC4899', '#6366F1', '#14B8A6', '#F97316'
  ];

  // Função para carregar dados da API
  const fetchSalesData = async (): Promise<Sale[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/sales', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar vendas da API');
      }

      const data = await response.json();
      // Mapear os dados da API para o formato esperado
      const formattedSales: Sale[] = data.map((sale: {
        id: string;
        createdAt: string;
        items: SaleItem[];
        total: number;
        paymentMethod: string;
      }) => ({
        id: sale.id,
        data: sale.createdAt,
        itens: sale.items.map((item: SaleItem) => ({
          id: item.id,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
        total: sale.total,
        paymentMethod: sale.paymentMethod,
      }));
      return formattedSales;
    } catch (err) {
      console.error('Erro ao carregar dados da API:', err);
      setError('Não foi possível carregar os dados das vendas.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Função para calcular total de vendas
  const calculateTotalSales = (sales: Sale[]): number => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  };

  // Função para calcular ticket médio
  const calculateAverageTicket = (sales: Sale[]): number => {
    if (sales.length === 0) return 0;
    const total = calculateTotalSales(sales);
    return total / sales.length;
  };

  // Função para encontrar produto mais vendido
  const findTopSellingProduct = (sales: Sale[]): string => {
    const productCounts: Record<string, number> = {};
    
    sales.forEach(sale => {
      sale.itens.forEach(item => {
        productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
      });
    });

    let topProduct = '';
    let maxQuantity = 0;
    
    Object.entries(productCounts).forEach(([product, quantity]) => {
      if (quantity > maxQuantity) {
        maxQuantity = quantity;
        topProduct = product;
      }
    });

    return topProduct || 'Nenhum';
  };

  // Função para agrupar vendas por produto para o gráfico de pizza
  const groupByProduct = (sales: Sale[]): CategoryData[] => {
    const grouped = sales.reduce((acc: Record<string, number>, sale) => {
      sale.itens.forEach(item => {
        if (!acc[item.productName]) {
          acc[item.productName] = 0;
        }
        acc[item.productName] += item.price * item.quantity;
      });
      return acc;
    }, {});

    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);
    
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, amount], index) => ({
        name,
        value: total > 0 ? Math.round((amount / total) * 100) : 0,
        amount,
        color: categoryColors[index % categoryColors.length],
      }));
  };

  // Função para processar todos os dados
  const processData = async (): Promise<void> => {
    const sales = await fetchSalesData();
    setSalesData(sales);
    
    if (sales.length === 0) {
      setCategoriesData([]);
      setKpis({
        totalVendas: 0,
        totalPedidos: 0,
        ticketMedio: 0,
        produtoMaisVendido: '',
      });
      return;
    }

    // Calcular métricas principais
    const totalVendas = calculateTotalSales(sales);
    const totalPedidos = sales.length;
    const ticketMedio = calculateAverageTicket(sales);
    const produtoMaisVendido = findTopSellingProduct(sales);

    // Processar dados por produto
    const products = groupByProduct(sales);
    setCategoriesData(products);

    // Atualizar KPIs
    setKpis({
      totalVendas,
      totalPedidos,
      ticketMedio,
      produtoMaisVendido,
    });

    setLastUpdate(new Date());
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    processData();
  }, []);

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle para expandir/recolher detalhes da venda
  const toggleSaleDetails = (saleId: string): void => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  // Função para limpar todas as vendas (opcional, requer endpoint DELETE na API)
  const clearAllSales = async (): Promise<void> => {
    if (window.confirm('Tem certeza que deseja limpar todas as vendas? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch('/api/sales', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          processData();
        } else {
          setError('Erro ao limpar vendas.');
        }
      } catch (err) {
        console.error('Erro ao limpar vendas:', err);
        setError('Erro ao limpar vendas.');
      }
    }
  };

  // Função para exportar vendas do dia para Excel
  const exportDailySalesToExcel = (): void => {
    // Filtrar vendas do dia atual
    const today = new Date().toISOString().split('T')[0];
    const dailySales = salesData.filter(sale => sale.data.includes(today));

    if (dailySales.length === 0) {
      alert('Não há vendas para o dia atual.');
      return;
    }

    // Preparar os dados para a planilha (uma linha por venda)
    const worksheetData = dailySales.map(sale => {
      // Concatenar todos os produtos em uma string
      const produtos = sale.itens.map(item =>
        `${item.productName} (Qtd: ${item.quantity}, R$ ${item.price.toFixed(2)})`
      ).join('; ');

      return {
        'Data': formatDate(sale.data),
        'Hora': formatTime(sale.data),
        'ID Venda': sale.id,
        'Forma Pagamento': sale.paymentMethod,
        'Total Venda': sale.total,
        'Produtos': produtos,
        'Quantidade Total': sale.itens.reduce((sum, item) => sum + item.quantity, 0),
      };
    });

    // Criar a planilha
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas do Dia");

    // Gerar nome do arquivo com data atual
    const fileName = `Relatorio_Vendas_${today}.xlsx`;

    // Exportar o arquivo
    XLSX.writeFile(workbook, fileName);
  };

  // Componente de card de estatística
  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  }> = ({ title, value, icon: Icon, color }) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    );
  };

  // Formatter customizado para tooltip
  const customTooltipFormatter = (
    value: number, 
    name: string | number, 
    entry: TooltipPayloadItem
  ): [string, string] => {
    if (entry.payload.amount !== undefined) {
      return [`${value}% (${formatCurrency(entry.payload.amount)})`, String(name)];
    }
    return [String(value), String(name)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Vendas</h1>
            <p className="text-gray-600">Dados do sistema PDV em tempo real</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={processData}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </button>
            <button
              onClick={exportDailySalesToExcel}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              type="button"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Excel</span>
            </button>
            {kpis.totalPedidos > 0 && (
              <button
                onClick={clearAllSales}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                type="button"
              >
                <span>Limpar Dados</span>
              </button>
            )}
          </div>
        </div>

        {/* Indicador de carregamento ou erro */}
        {isLoading && (
          <div className="text-center text-gray-600">Carregando dados...</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {/* Verificar se há dados */}
        {kpis.totalPedidos === 0 && !isLoading && !error && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma venda encontrada</h3>
            <p className="text-gray-600">
              Não há vendas registradas no sistema ainda. Utilize o sistema PDV para gerar vendas.
            </p>
          </div>
        )}

        {/* KPIs e Gráficos */}
        {!isLoading && !error && kpis.totalPedidos > 0 && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total de Vendas (R$)"
                value={formatCurrency(kpis.totalVendas)}
                icon={DollarSign}
                color="bg-blue-500"
              />
              <StatCard
                title="Total de Pedidos"
                value={kpis.totalPedidos.toLocaleString('pt-BR')}
                icon={ShoppingCart}
                color="bg-green-500"
              />
              <StatCard
                title="Ticket Médio"
                value={formatCurrency(kpis.ticketMedio)}
                icon={DollarSign}
                color="bg-yellow-500"
              />
              <StatCard
                title="Produto Mais Vendido"
                value={kpis.produtoMaisVendido.length > 20 ? kpis.produtoMaisVendido.substring(0, 20) + '...' : kpis.produtoMaisVendido}
                icon={Package}
                color="bg-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Lista de Vendas */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Vendas Recentes</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {salesData
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((sale) => (
                      <div key={sale.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleSaleDetails(sale.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {formatDate(sale.data)} - {formatTime(sale.data)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {sale.itens.length} item{sale.itens.length > 1 ? 's' : ''} • ID: {sale.id}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(sale.total)}
                              </span>
                              {expandedSale === sale.id ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Detalhes da venda (expandível) */}
                        {expandedSale === sale.id && (
                          <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Package className="h-4 w-4 mr-2" />
                              Itens da Venda:
                            </h4>
                            <div className="space-y-2">
                              {sale.itens.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                                  <div>
                                    <span className="font-medium text-gray-900">{item.productName}</span>
                                    <span className="text-sm text-gray-500 ml-2">
                                      (Qtd: {item.quantity})
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">
                                      {formatCurrency(item.price)} × {item.quantity}
                                    </div>
                                    <div className="font-medium text-gray-900">
                                      {formatCurrency(item.price * item.quantity)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900">Forma de Pagamento:</span>
                                <span className="text-sm font-medium text-gray-700">{sale.paymentMethod || 'Não especificado'}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-medium text-gray-900">Total da Venda:</span>
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(sale.total)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Distribuição por Produtos */}
              {categoriesData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Distribuição de Vendas por Produto</h3>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoriesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, entry) => customTooltipFormatter(Number(value), name, entry as TooltipPayloadItem)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {categoriesData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-700 truncate" title={item.name}>
                            {item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                          <span className="text-xs text-gray-500 block">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Última atualização: {lastUpdate.toLocaleDateString('pt-BR')} às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;