import { Suspense } from 'react';
import ReceiptContent from './ReceiptContent';

export const dynamic = 'force-dynamic';

export default function ReceiptPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReceiptContent />
    </Suspense>
  );
}

function LoadingFallback() {
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