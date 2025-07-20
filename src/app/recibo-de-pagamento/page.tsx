/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useState, useEffect } from 'react';
// import Head from 'next/head';
// import { useRouter } from 'next/navigation';

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// const ReceiptPage: React.FC = () => {
//   const [saleCart, setSaleCart] = useState<Product[]>([]);
//   const [saleTotal, setSaleTotal] = useState<string>('0.00');
//   const [saleDate, setSaleDate] = useState<string>('');
//   const router = useRouter();

//   useEffect(() => {
//     // Garante que o código só rode no lado do cliente
//     if (typeof window !== 'undefined') {
//       const storedCart = localStorage.getItem('lastSaleCart');
//       const storedTotal = localStorage.getItem('lastSaleTotal');
//       const storedDate = localStorage.getItem('lastSaleDate');

//       if (storedCart) {
//         setSaleCart(JSON.parse(storedCart));
//       }
//       if (storedTotal) {
//         setSaleTotal(storedTotal);
//       }
//       if (storedDate) {
//         setSaleDate(storedDate);
//       } else {
//         setSaleDate(new Date().toLocaleString('pt-BR')); // Fallback se não tiver data
//       }
//     }
//   }, []);

//   const handleGoBack = () => {
//     router.push('/'); // Ou para a sua página PDV, se for diferente de '/'
//   };

//   return (
//     <div style={receiptStyles.container}>
//       <Head>
//         <title>Recibo de Venda</title>
//         <meta name="description" content="Recibo detalhado da venda" />
//       </Head>

//       <h1 style={receiptStyles.title}>Recibo de Venda</h1>

//       {saleCart.length === 0 ? (
//         <p style={receiptStyles.noReceiptMessage}>Nenhum recibo encontrado. Finalize uma venda para gerar um recibo.</p>
//       ) : (
//         <div style={receiptStyles.receiptContent}>
//           <p style={receiptStyles.date}>**Data/Hora da Venda:** {saleDate}</p>
//           <h3 style={receiptStyles.sectionTitle}>Itens Vendidos:</h3>
//           <ul style={receiptStyles.itemList}>
//             {saleCart.map((item) => (
//               <li key={item.id} style={receiptStyles.item}>
//                 <span style={receiptStyles.itemName}>{item.name}</span>
//                 <span style={receiptStyles.itemDetails}>
//                   {item.quantity} x R$ {item.price.toFixed(2)} = **R$ {(item.price * item.quantity).toFixed(2)}**
//                 </span>
//               </li>
//             ))}
//           </ul>
//           <div style={receiptStyles.totalSection}>
//             <h2 style={receiptStyles.totalText}>Total da Venda: **R$ {saleTotal}**</h2>
//           </div>
//         </div>
//       )}
//       <button onClick={handleGoBack} style={receiptStyles.backButton}>
//         Voltar ao PDV
//       </button>
//     </div>
//   );
// };

// const receiptStyles: { [key: string]: React.CSSProperties } = {
//   container: {
//     fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
//     padding: '30px',
//     maxWidth: '700px',
//     margin: '30px auto',
//     backgroundColor: '#ffffff',
//     borderRadius: '12px',
//     boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//     color: '#333',
//     textAlign: 'center',
//   },
//   title: {
//     color: '#2c3e50',
//     marginBottom: '30px',
//     fontSize: '2.2em',
//     fontWeight: '600',
//   },
//   receiptContent: {
//     border: '1px solid #e0e0e0',
//     borderRadius: '8px',
//     padding: '25px',
//     marginBottom: '30px',
//     backgroundColor: '#f8f9fa',
//     textAlign: 'left',
//   },
//   date: {
//     fontSize: '1.1em',
//     fontWeight: '500',
//     marginBottom: '20px',
//     color: '#555',
//     textAlign: 'center',
//   },
//   sectionTitle: {
//     fontSize: '1.5em',
//     color: '#34495e',
//     marginBottom: '15px',
//     borderBottom: '1px solid #dee2e6',
//     paddingBottom: '10px',
//   },
//   itemList: {
//     listStyle: 'none',
//     padding: '0',
//     marginBottom: '20px',
//   },
//   item: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '10px 0',
//     borderBottom: '1px dashed #ced4da',
//     fontSize: '1.1em',
//   },
//   itemName: {
//     flexGrow: 1,
//     fontWeight: 'normal',
//   },
//   itemDetails: {
//     fontWeight: 'bold',
//     color: '#28a745',
//   },
//   totalSection: {
//     marginTop: '25px',
//     paddingTop: '20px',
//     borderTop: '2px solid #e9ecef',
//     textAlign: 'right',
//   },
//   totalText: {
//     fontSize: '2em',
//     color: '#2c3e50',
//     fontWeight: '700',
//   },
//   noReceiptMessage: {
//     fontSize: '1.2em',
//     color: '#666',
//     marginTop: '50px',
//     marginBottom: '50px',
//   },
//   backButton: {
//     backgroundColor: '#6c757d', // Cinza para voltar
//     color: 'white',
//     border: 'none',
//     padding: '12px 25px',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontSize: '1.1em',
//     fontWeight: 'bold',
//     transition: 'background-color 0.3s ease, transform 0.2s ease',
//     marginTop: '20px',
//   },
// };

// export default ReceiptPage;

// versao 2
// app/receipt/page.tsx (para Next.js 13+ App Router)

// src/app/recibo-de-pagamento/page.tsx

"use client"; // Keep this at the very top

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

// Dynamically import html2canvas and jsPDF
// These imports will only execute on the client side
let html2canvas: any;
let jsPDF: any;

if (typeof window !== 'undefined') {
  import('html2canvas').then((module) => {
    html2canvas = module.default;
  });
  import('jspdf').then((module) => {
    jsPDF = module.default;
  });
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const ReceiptPage: React.FC = () => {
  const [saleCart, setSaleCart] = useState<Product[]>([]);
  const [saleTotal, setSaleTotal] = useState<string>('0.00');
  const [saleDate, setSaleDate] = useState<string>('');
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('lastSaleCart');
      const storedTotal = localStorage.getItem('lastSaleTotal');
      const storedDate = localStorage.getItem('lastSaleDate');

      if (storedCart) {
        setSaleCart(JSON.parse(storedCart));
      }
      if (storedTotal) {
        setSaleTotal(storedTotal);
      }
      if (storedDate) {
        setSaleDate(storedDate);
      } else {
        setSaleDate(new Date().toLocaleString('pt-BR'));
      }
    }
  }, []);

  const handleGoBack = () => {
    router.push('/ponto-de-venda'); // Adjust the path as needed
  };

  const generatePdf = async () => {
    // Ensure html2canvas and jsPDF are loaded before attempting to use them
    if (!html2canvas || !jsPDF) {
      console.warn('PDF generation libraries not yet loaded. Please try again in a moment.');
      alert('Aguarde um momento, as bibliotecas de PDF estão sendo carregadas.');
      return;
    }

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

      const filename = `recibo_venda_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}_${new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-')}.pdf`;
      pdf.save(filename);
    }
  };

  return (
    <div style={receiptStyles.container}>
      <Head>
        <title>Recibo de Venda</title>
        <meta name="description" content="Recibo detalhado da venda" />
      </Head>

      <h1 style={receiptStyles.title}>Recibo de Venda</h1>

      {saleCart.length === 0 ? (
        <p style={receiptStyles.noReceiptMessage}>Nenhum recibo encontrado. Finalize uma venda para gerar um recibo.</p>
      ) : (
        <div ref={receiptRef} style={receiptStyles.receiptContent}>
          <p style={receiptStyles.date}>**Data/Hora da Venda:** {saleDate}</p>
          <h3 style={receiptStyles.sectionTitle}>Itens Vendidos:</h3>
          <ul style={receiptStyles.itemList}>
            {saleCart.map((item) => (
              <li key={item.id} style={receiptStyles.item}>
                <span style={receiptStyles.itemName}>{item.name}</span>
                <span style={receiptStyles.itemDetails}>
                  {item.quantity} x R$ {item.price.toFixed(2)} = **R$ {(item.price * item.quantity).toFixed(2)}**
                </span>
              </li>
            ))}
          </ul>
          <div style={receiptStyles.totalSection}>
            <h2 style={receiptStyles.totalText}>Total da Venda: **R$ {saleTotal}**</h2>
          </div>
        </div>
      )}
      <div style={receiptStyles.buttonGroup}>
        <button onClick={handleGoBack} style={receiptStyles.backButton}>
          Voltar ao PDV
        </button>
        {saleCart.length > 0 && (
          <button onClick={generatePdf} style={receiptStyles.pdfButton}>
            Gerar PDF do Recibo
          </button>
        )}
      </div>
    </div>
  );
};

const receiptStyles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    padding: '30px',
    maxWidth: '700px',
    margin: '30px auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    color: '#333',
    textAlign: 'center',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '2.2em',
    fontWeight: '600',
  },
  receiptContent: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    marginBottom: '30px',
    backgroundColor: '#f8f9fa',
    textAlign: 'left',
  },
  date: {
    fontSize: '1.1em',
    fontWeight: '500',
    marginBottom: '20px',
    color: '#555',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '1.5em',
    color: '#34495e',
    marginBottom: '15px',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '10px',
  },
  itemList: {
    listStyle: 'none',
    padding: '0',
    marginBottom: '20px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px dashed #ced4da',
    fontSize: '1.1em',
  },
  itemName: {
    flexGrow: 1,
    fontWeight: 'normal',
  },
  itemDetails: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  totalSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '2px solid #e9ecef',
    textAlign: 'right',
  },
  totalText: {
    fontSize: '2em',
    color: '#2c3e50',
    fontWeight: '700',
  },
  noReceiptMessage: {
    fontSize: '1.2em',
    color: '#666',
    marginTop: '50px',
    marginBottom: '50px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  pdfButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
};

export default ReceiptPage;