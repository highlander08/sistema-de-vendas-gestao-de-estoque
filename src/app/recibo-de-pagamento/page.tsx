"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

// Interface alinhada com o PDVPage e o schema do Prisma
interface Product {
  sku: string;
  nome: string;
  preco: number;
  quantidade: number;
}

const ReceiptPage: React.FC = () => {
  const [saleCart, setSaleCart] = useState<Product[]>([]);
  const [saleTotal, setSaleTotal] = useState<string>('0.00');
  const [saleDate, setSaleDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>(''); // State for payment method
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('lastSaleCart');
      const storedTotal = localStorage.getItem('lastSaleTotal');
      const storedDate = localStorage.getItem('lastSaleDate');
      const storedPaymentMethod = localStorage.getItem('lastSalePaymentMethod');

      if (storedCart) {
        setSaleCart(JSON.parse(storedCart));
      }
      if (storedTotal) {
        setSaleTotal(storedTotal);
      }
      if (storedDate) {
        setSaleDate(storedDate);
      } else {
        setSaleDate(new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }));
      }
      if (storedPaymentMethod) {
        setPaymentMethod(storedPaymentMethod);
      }
    }
  }, []);

  // Função para gerar PDF
  const generatePdf = async () => {
    try {
      // Importar bibliotecas dinamicamente
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      if (receiptRef.current) {
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

        const filename = `recibo_venda_${new Date()
          .toLocaleDateString('pt-BR')
          .replace(/\//g, '-')}_${new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-')}.pdf`;
        pdf.save(filename);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    }
  };

  const handleGoBack = () => {
    router.push('/ponto-de-venda'); // Caminho ajustado para corresponder ao PDVPage
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

      {saleCart.length === 0 ? (
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
              <span style={receiptStyles.receiptId}>
                {new Date().getTime().toString().slice(-6)}
              </span>
            </div>
          </div>

          <div style={receiptStyles.dateSection}>
            <div style={receiptStyles.dateItem}>
              <span style={receiptStyles.dateLabel}>Data/Hora:</span>
              <span style={receiptStyles.dateValue}>{saleDate}</span>
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
              {saleCart.map((item, index) => (
                <div key={item.sku} style={receiptStyles.itemRow}>
                  <div style={receiptStyles.itemInfo}>
                    <span style={receiptStyles.itemName}>{item.nome}</span>
                    <span style={receiptStyles.itemSku}>SKU: {item.sku}</span>
                  </div>
                  <span style={receiptStyles.itemQuantity}>{item.quantidade}</span>
                  <span style={receiptStyles.itemPrice}>R$ {item.preco.toFixed(2)}</span>
                  <span style={receiptStyles.itemTotal}>
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={receiptStyles.summarySection}>
            <div style={receiptStyles.summaryRow}>
              <span style={receiptStyles.summaryLabel}>Subtotal:</span>
              <span style={receiptStyles.summaryValue}>R$ {saleTotal}</span>
            </div>
            <div style={receiptStyles.summaryRow}>
              <span style={receiptStyles.summaryLabel}>Desconto:</span>
              <span style={receiptStyles.summaryValue}>R$ 0,00</span>
            </div>
            <div style={receiptStyles.summaryRow}>
              <span style={receiptStyles.summaryLabel}>Forma de Pagamento:</span>
              <span style={receiptStyles.summaryValue}>{paymentMethod || 'Não especificado'}</span>
            </div>
            <div style={receiptStyles.totalRow}>
              <span style={receiptStyles.totalLabel}>Total:</span>
              <span style={receiptStyles.totalValue}>R$ {saleTotal}</span>
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
        {saleCart.length > 0 && (
          <button onClick={generatePdf} style={receiptStyles.pdfButton}>
            <span style={receiptStyles.buttonIcon}>📄</span>
            Gerar PDF
          </button>
        )}
      </div>
    </div>
  );
};

const receiptStyles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    padding: '20px',
    width: '100vw',
    height: '100vh',
    margin: '0',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.025em',
  },
  
  headerLine: {
    width: '80px',
    height: '4px',
    backgroundColor: '#3b82f6',
    margin: '0 auto',
    borderRadius: '2px',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.6,
  },
  
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 0.5rem 0',
  },
  
  emptyMessage: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0,
  },

  // Receipt Content
  receiptContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2.5rem',
    flex: 1,
    marginBottom: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    overflow: 'auto',
  },
  
  receiptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #e5e7eb',
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  
  companyDetails: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
  },
  
  receiptNumber: {
    textAlign: 'right',
    backgroundColor: '#f1f5f9',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
  },
  
  receiptLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  receiptId: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },

  // Date Section
  dateSection: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  
  dateItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  dateLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
  },
  
  dateValue: {
    fontSize: '0.875rem',
    color: '#0f172a',
    fontWeight: '500',
  },

  // Items Section
  itemsSection: {
    marginBottom: '2rem',
  },
  
  itemsHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 80px 120px 120px',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px 8px 0 0',
    border: '1px solid #cbd5e1',
    borderBottom: 'none',
  },
  
  itemHeaderText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center',
  },
  
  itemsList: {
    border: '1px solid #cbd5e1',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
  },
  
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 80px 120px 120px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '0.25rem',
  },
  
  itemSku: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  
  itemQuantity: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  
  itemPrice: {
    fontSize: '0.875rem',
    color: '#475569',
    textAlign: 'center',
  },
  
  itemTotal: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },

  // Summary Section
  summarySection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  
  summaryLabel: {
    fontSize: '0.875rem',
    color: '#475569',
  },
  
  summaryValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    marginTop: '1rem',
    borderTop: '2px solid #cbd5e1',
  },
  
  totalLabel: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#059669',
  },

  // Footer
  footer: {
    textAlign: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid #e5e7eb',
  },
  
  footerText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 0.5rem 0',
  },
  
  footerSubtext: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
    fontStyle: 'italic',
  },

  // Action Section
  actionSection: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 'auto',
    paddingTop: '1rem',
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#6b7280',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  
  pdfButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  
  buttonIcon: {
    fontSize: '1rem',
  },
};

export default ReceiptPage;