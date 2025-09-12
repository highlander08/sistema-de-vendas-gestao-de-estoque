"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

interface SaleItem {
  id: number;
  productSku: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  items: SaleItem[];
}

interface ApiSale {
  id: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  items: SaleItem[];
}

interface ReceiptPageContentProps {
  saleId: string | null;
}

export default function ReceiptPageContent({ saleId }: ReceiptPageContentProps) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchSale = async (saleId?: string): Promise<void> => {
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
        throw new Error('Erro ao buscar dados da venda');
      }

      const sales: ApiSale[] = await response.json();
      if (!sales || sales.length === 0) {
        throw new Error('Nenhuma venda encontrada');
      }

      let selectedSale: ApiSale | undefined;
      if (saleId) {
        selectedSale = sales.find((s: ApiSale) => s.id === saleId);
      } else {
        selectedSale = sales.reduce((latest: ApiSale, current: ApiSale) =>
          new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
      }

      if (!selectedSale) {
        throw new Error('Venda não encontrada');
      }

      setSale({
        id: selectedSale.id,
        createdAt: selectedSale.createdAt,
        total: selectedSale.total,
        paymentMethod: selectedSale.paymentMethod,
        items: selectedSale.items,
      });
    } catch (err) {
      console.error('Erro ao carregar dados da venda:', err);
      setError('Não foi possível carregar os dados da venda.');
      setSale(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSale(saleId || undefined);
  }, [saleId]);

  const generatePdf = async () => {
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      if (receiptRef.current && sale) {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const filename = `recibo_venda_${new Date(sale.createdAt)
          .toLocaleDateString('pt-BR')
          .replace(/\//g, '-')}_${new Date(sale.createdAt)
          .toLocaleTimeString('pt-BR')
          .replace(/:/g, '-')}.pdf`;
        pdf.save(filename);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar o PDF. Tente novamente.');
    }
  };

  const handleGoBack = () => {
    router.push('/ponto-de-venda');
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', { 
      timeZone: 'America/Fortaleza' 
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4 opacity-60">⏳</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Carregando...
          </h3>
          <p className="text-gray-500">
            Aguarde enquanto os dados da venda são carregados.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4 opacity-60">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Erro
          </h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!sale || sale.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4 opacity-60">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum recibo encontrado
          </h3>
          <p className="text-gray-500">
            Finalize uma venda no PDV para gerar um recibo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <Head>
        <title>Recibo de Venda</title>
        <meta name="description" content="Recibo detalhado da venda" />
      </Head>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Recibo de Venda</h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto rounded"></div>
      </div>

      <div ref={receiptRef} className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua Empresa</h2>
            <p className="text-sm text-gray-500">CNPJ: 00.000.000/0001-00</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 text-right">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
              Recibo Nº
            </span>
            <span className="text-xl font-bold text-gray-900 block">
              {sale.id.slice(-6)}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Data/Hora:</span>
            <span className="text-sm font-medium text-gray-900">{formatDateTime(sale.createdAt)}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="grid grid-cols-[2fr_80px_120px_120px] gap-4 p-4 bg-gray-50 rounded-t-lg border border-gray-300 border-b-0">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Item</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide text-center">Qtd</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide text-center">Valor Unit.</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide text-center">Total</span>
          </div>
          
          <div className="border border-gray-300 rounded-b-lg">
            {sale.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[2fr_80px_120px_120px] gap-4 p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">{item.productName}</span>
                  <span className="text-xs text-gray-500">SKU: {item.productSku}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 text-center">{item.quantity}</span>
                <span className="text-sm text-gray-600 text-center">{formatCurrency(item.price)}</span>
                <span className="text-sm font-bold text-green-600 text-center">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Desconto:</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Forma de Pagamento:</span>
            <span className="text-sm font-semibold text-gray-900">
              {sale.paymentMethod || 'Não especificado'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-300">
            <span className="text-xl font-bold text-gray-900">Total:</span>
            <span className="text-2xl font-extrabold text-green-600">{formatCurrency(sale.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-base font-semibold text-gray-700 mb-2">
            Obrigado pela preferência!
          </p>
          <p className="text-xs text-gray-500 italic">
            Este documento não possui valor fiscal
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-sm"
        >
          <span>←</span>
          Voltar ao PDV
        </button>
        
        <button
          onClick={generatePdf}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          <span>📄</span>
          Gerar PDF
        </button>
      </div>
    </div>
  );
}