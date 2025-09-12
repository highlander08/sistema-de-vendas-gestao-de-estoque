"use client";

import { useSearchParams } from 'next/navigation';
import ReceiptPageContent from './ReceiptPageContent';

export default function ReceiptContent() {
  const searchParams = useSearchParams();
  const saleId = searchParams.get('saleId');

  return <ReceiptPageContent saleId={saleId} />;
}