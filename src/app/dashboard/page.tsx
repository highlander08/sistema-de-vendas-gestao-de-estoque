"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { DollarSign, ShoppingCart, RefreshCw, ChevronDown, ChevronUp, Calendar, Package, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { debounce } from 'lodash';

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
  
  // Usar ref para controlar se já está fazendo uma requisição
  const isFetchingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);

  const categoryColors: string[] = useMemo(() => [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
    '#EC4899', '#6366F1', '#14B8A6', '#F97316'
  ], []);

  // Função para carregar dados da API - usando useCallback com dependências mínimas
  const fetchSalesData = useCallback(async (): Promise<Sale[]> => {
    // Verificar se já está fazendo uma requisição
    if (isFetchingRef.current) {
      console.log('fetchSalesData bloqueado: requisição já em andamento', new Date().toISOString());
      return [];
    }

    isFetchingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Chamando /api/sales:', new Date().toISOString());
      
      const response = await fetch('/api/sales', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Adicionar cache control para evitar cache desnecessário
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
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
      
      console.log(`Dados carregados: ${formattedSales.length} vendas`);
      return formattedSales;
    } catch (err) {
      console.error('Erro ao carregar dados da API:', err);
      setError('Não foi possível carregar os dados das vendas.');
      return [];
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Funções de cálculo com useMemo para evitar recálculos desnecessários
  const calculateTotalSales = useCallback((sales: Sale[]): number => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  }, []);

  const calculateAverageTicket = useCallback((sales: Sale[]): number => {
    if (sales.length === 0) return 0;
    const total = calculateTotalSales(sales);
    return total / sales.length;
  }, [calculateTotalSales]);

  const findTopSellingProduct = useCallback((sales: Sale[]): string => {
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
  }, []);

  const groupByProduct = useCallback((sales: Sale[]): CategoryData[] => {
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
  }, [categoryColors]);

  // Função principal de processamento dos dados
  const processData = useCallback(async () => {
    console.log('processData chamado:', new Date().toISOString());
    
    const sales = await fetchSalesData();
    
    if (sales.length === 0) {
      setCategoriesData([]);
      setKpis({
        totalVendas: 0,
        totalPedidos: 0,
        ticketMedio: 0,
        produtoMaisVendido: '',
      });
      setSalesData([]);
      setLastUpdate(new Date());
      return;
    }

    const totalVendas = calculateTotalSales(sales);
    const totalPedidos = sales.length;
    const ticketMedio = calculateAverageTicket(sales);
    const produtoMaisVendido = findTopSellingProduct(sales);
    const products = groupByProduct(sales);

    setSalesData(sales);
    setCategoriesData(products);
    setKpis({
      totalVendas,
      totalPedidos,
      ticketMedio,
      produtoMaisVendido,
    });
    setLastUpdate(new Date());
  }, [fetchSalesData, calculateTotalSales, calculateAverageTicket, findTopSellingProduct, groupByProduct]);

  // Debounce para o botão de atualização manual
  const debouncedProcessData = useMemo(() => 
    debounce(() => {
      if (!isFetchingRef.current) {
        processData();
      }
    }, 1000), 
    [processData]
  );

  // useEffect para carregar dados apenas na montagem inicial
  useEffect(() => {
    // Verificar se já foi inicializado para evitar dupla execução
    if (hasInitializedRef.current) {
      return;
    }
    
    console.log('useEffect inicial disparado:', new Date().toISOString());
    hasInitializedRef.current = true;
    processData();
    
    // Cleanup function
    return () => {
      console.log('useEffect cleanup:', new Date().toISOString());
      isFetchingRef.current = false;
    };
  }, []); // Dependência vazia - executa apenas uma vez

  // Funções de formatação com useMemo quando necessário
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }, []);

  const formatTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const toggleSaleDetails = useCallback((saleId: string): void => {
    setExpandedSale(prevExpanded => prevExpanded === saleId ? null : saleId);
  }, []);

  const clearAllSales = useCallback(async (): Promise<void> => {
    if (window.confirm('Tem certeza que deseja limpar todas as vendas? Esta ação não pode ser desfeita.')) {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sales', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          // Aguardar um pouco antes de recarregar os dados
          setTimeout(() => {
            if (!isFetchingRef.current) {
              processData();
            }
          }, 500);
        } else {
          setError('Erro ao limpar vendas.');
        }
      } catch (err) {
        console.error('Erro ao limpar vendas:', err);
        setError('Erro ao limpar vendas.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [processData]);

  const exportDailySalesToExcel = useCallback((): void => {
    const today = new Date().toISOString().split('T')[0];
    const dailySales = salesData.filter(sale => sale.data.includes(today));

    if (dailySales.length === 0) {
      alert('Não há vendas para o dia atual.');
      return;
    }

    const worksheetData = dailySales.map(sale => {
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

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas do Dia");
    const fileName = `Relatorio_Vendas_${today}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [salesData, formatDate, formatTime]);

  // Memorizar as vendas ordenadas para evitar re-ordenação desnecessária
  const sortedSales = useMemo(() => {
    return salesData
      .slice() // criar cópia para não mutar o array original
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [salesData]);

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  }> = React.memo(({ title, value, icon: Icon, color }) => {
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
  });

  StatCard.displayName = "StatCard";

  const customTooltipFormatter = useCallback((
    value: number, 
    name: string, 
    entry: TooltipPayloadItem
  ): [string, string] => {
    if (entry.payload.amount !== undefined) {
      return [`${value}% (${formatCurrency(entry.payload.amount)})`, name];
    }
    return [String(value), name];
  }, [formatCurrency]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Vendas</h1>
            <p className="text-gray-600">Dados do sistema PDV em tempo real</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={debouncedProcessData}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
            <button
              onClick={exportDailySalesToExcel}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
              type="button"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Excel</span>
            </button>
            {kpis.totalPedidos > 0 && (
              <button
                onClick={clearAllSales}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
                type="button"
              >
                <span>Limpar Dados</span>
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600 py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            Carregando dados...
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {kpis.totalPedidos === 0 && !isLoading && !error && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma venda encontrada</h3>
            <p className="text-gray-600">
              Não há vendas registradas no sistema ainda. Utilize o sistema PDV para gerar vendas.
            </p>
          </div>
        )}

        {!isLoading && !error && kpis.totalPedidos > 0 && (
          <>
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
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Vendas Recentes</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedSales.map((sale) => (
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
                        <Tooltip formatter={(value, name, entry) => customTooltipFormatter(Number(value), String(name), entry as TooltipPayloadItem)} />
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