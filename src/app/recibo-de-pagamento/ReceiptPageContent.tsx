// src/app/recibo-de-pagamento/ReceiptPageContent.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { receiptStyles } from './receiptStyles';
// import { receiptStyles } from './receiptStyles';

// Interfaces
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
  items: Array<{
    id: number;
    productSku: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
}

const ReceiptPageContent: React.FC<{ saleId: string | null }> = ({ saleId }) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Função para carregar dados da venda da API
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

      // Encontrar a venda específica ou a mais recente
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
        items: selectedSale.items.map((item) => ({
          id: item.id,
          productSku: item.productSku,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      console.error('Erro ao carregar dados da venda:', err);
      setError('Não foi possível carregar os dados da venda.');
      setSale(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados da venda ao montar o componente
  useEffect(() => {
    fetchSale(saleId || undefined);
  }, [saleId]);

  // Função para gerar PDF
  const generatePdf = async () => {
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      if (receiptRef.current && sale) {
        const input = receiptRef.current;
        const originalPadding = input.style.padding;
        input.style.padding = '20px';

        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
        });

        input.style.padding = originalPadding;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // Largura A4 em mm
        const pageHeight = 297; // Altura A4 em mm
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

  // Função para voltar ao PDV
  const handleGoBack = () => {
    router.push('/ponto-de-venda');
  };

  // Função para formatar data
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
  };

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div style={receiptStyles.container}>
      <Head>
        <title>Recibo de Venda</title>
        <meta name="description" content="Recibo detalhado da venda" />
      </Head>

      <div style={receiptStyles.header}>
        <h1 style={receiptStyles.title}>Recibo de Venda</h1>
        <div style={receiptStyles.headerLine}></div>
      </div>

      {isLoading ? (
        <div style={receiptStyles.emptyState}>
          <div style={receiptStyles.emptyIcon}>⏳</div>
          <h3 style={receiptStyles.emptyTitle}>Carregando...</h3>
          <p style={receiptStyles.emptyMessage}>Aguarde enquanto os dados da venda são carregados.</p>
        </div>
      ) : error ? (
        <div style={receiptStyles.emptyState}>
          <div style={receiptStyles.emptyIcon}>❌</div>
          <h3 style={receiptStyles.emptyTitle}>Erro</h3>
          <p style={receiptStyles.emptyMessage}>{error}</p>
        </div>
      ) : !sale || sale.items.length === 0 ? (
        <div style={receiptStyles.emptyState}>
          <div style={receiptStyles.emptyIcon}>📋</div>
          <h3 style={receiptStyles.emptyTitle}>Nenhum recibo encontrado</h3>
          <p style={receiptStyles.emptyMessage}>
            Finalize uma venda no PDV para gerar um recibo.
          </p>
        </div>
      ) : (
        <div ref={receiptRef} style={receiptStyles.receiptContent}>
          <div style={receiptStyles.receiptHeader}>
            <div style={receiptStyles.companyInfo}>
              <h2 style={receiptStyles.companyName}>Sua Empresa</h2>
              <p style={receiptStyles.companyDetails}>CNPJ: 00.000.000/0001-00</p>
            </div>
            <div style={receiptStyles.receiptNumber}>
              <span style={receiptStyles.receiptLabel}>Recibo Nº</span>
              <span style={receiptStyles.receiptId}>{sale.id.slice(-6)}</span>
            </div>
          </div>

          <div style={receiptStyles.dateSection}>
            <div style={receiptStyles.dateItem}>
              <span style={receiptStyles.dateLabel}>Data/Hora:</span>
              <span style={receiptStyles.dateValue}>{formatDateTime(sale.createdAt)}</span>
            </div>
          </div>

          <div style={receiptStyles.itemsSection}>
            <div style={receiptStyles.itemsHeader}>
              <span style={receiptStyles.itemHeaderText}>Item</span>
              <span style={receiptStyles.itemHeaderText}>Qtd</span>
              <span style={receiptStyles.itemHeaderText}>Valor Unit.</span>
              <span style={receiptStyles.itemHeaderText}>Total</span>
            </div>
            
            <div style={receiptStyles.itemsList}>
              {sale.items.map((item) => (
                <div key={item.id} style={receiptStyles.itemRow}>
                  <div style={receiptStyles.itemInfo}>
                    <span style={receiptStyles.itemName}>{item.productName}</span>
                    <span style={receiptStyles.itemSku}>SKU: {item.productSku}</span>
                  </div>
                  <span style={receiptStyles.itemQuantity}>{item.quantity}</span>
                  <span style={receiptStyles.itemPrice}>{formatCurrency(item.price)}</span>
                  <span style={receiptStyles.itemTotal}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={receiptStyles.summarySection}>
            <div style={receiptStyles.summaryRow}>
              <span style={receiptStyles.summaryLabel}>Subtotal:</span>
              <span style={receiptStyles.summaryValue}>{formatCurrency(sale.total)}</span>
            </div>
            <div style={receiptStyles.summaryRow}>
              <span style={receiptStyles.summaryLabel}>Desconto:</span>
              <span style={receiptStyles.summaryValue}>{formatCurrency(0)}</span>
            </div>
            <div style={receiptStyles.summaryRow}>
              <span style={receiptStyles.summaryLabel}>Forma de Pagamento:</span>
              <span style={receiptStyles.summaryValue}>{sale.paymentMethod || 'Não especificado'}</span>
            </div>
            <div style={receiptStyles.totalRow}>
              <span style={receiptStyles.totalLabel}>Total:</span>
              <span style={receiptStyles.totalValue}>{formatCurrency(sale.total)}</span>
            </div>
          </div>

          <div style={receiptStyles.footer}>
            <p style={receiptStyles.footerText}>
              Obrigado pela preferência!
            </p>
            <p style={receiptStyles.footerSubtext}>
              Este documento não possui valor fiscal
            </p>
          </div>
        </div>
      )}

      <div style={receiptStyles.actionSection}>
        <button onClick={handleGoBack} style={receiptStyles.backButton}>
          <span style={receiptStyles.buttonIcon}>←</span>
          Voltar ao PDV
        </button>
        {sale && sale.items.length > 0 && (
          <button onClick={generatePdf} style={receiptStyles.pdfButton}>
            <span style={receiptStyles.buttonIcon}>📄</span>
            Gerar PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptPageContent;