// src/app/recibo-de-pagamento/page.tsx
import { Suspense } from 'react';
import ReceiptContent from './ReceiptContent';
import { receiptStyles } from './receiptStyles';

export const dynamic = 'force-dynamic';

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div style={receiptStyles.container}>
        <div style={receiptStyles.emptyState}>
          <div style={receiptStyles.emptyIcon}>⏳</div>
          <h3 style={receiptStyles.emptyTitle}>Carregando...</h3>
          <p style={receiptStyles.emptyMessage}>Aguarde enquanto os dados da venda são carregados.</p>
        </div>
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  );
}

// Mantenha o restante do seu código (receiptStyles, etc.)