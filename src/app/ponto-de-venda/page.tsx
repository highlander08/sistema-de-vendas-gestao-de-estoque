// // // pages/PDVPage.tsx (ou o nome do seu arquivo atual)

// // "use client";

// // import React, { useState, useEffect } from 'react';
// // import Head from 'next/head';
// // import { useRouter } from 'next/navigation'; // Importe useRouter

// // interface Product {
// //   id: string;
// //   name: string;
// //   price: number;
// //   quantity: number;
// // }

// // const PDVPage: React.FC = () => {
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [cart, setCart] = useState<Product[]>([]);
// //   const [searchTerm, setSearchTerm] = useState<string>('');
// //   const [total, setTotal] = useState<number>(0);
// //   const router = useRouter(); // Inicialize o useRouter

// //   // Produtos de exemplo (você pode carregar isso de uma API real)
// //   useEffect(() => {
// //     const exampleProducts: Product[] = [
// //       { id: 'PROD001', name: 'Arroz 5kg', price: 25.00, quantity: 1 },
// //       { id: 'PROD002', name: 'Feijão 1kg', price: 8.50, quantity: 1 },
// //       { id: 'PROD003', name: 'Óleo de Soja', price: 7.20, quantity: 1 },
// //       { id: 'PROD004', name: 'Açúcar 1kg', price: 4.80, quantity: 1 },
// //       { id: 'PROD005', name: 'Café 500g', price: 12.00, quantity: 1 },
// //       { id: 'PROD006', name: 'Leite Integral 1L', price: 5.50, quantity: 1 },
// //       { id: 'PROD007', name: 'Pão de Forma', price: 6.90, quantity: 1 },
// //       { id: 'PROD008', name: 'Manteiga 200g', price: 9.90, quantity: 1 },
// //       { id: 'PROD009', name: 'Refrigerante 2L', price: 7.00, quantity: 1 },
// //       { id: 'PROD010', name: 'Biscoito Recheado', price: 3.50, quantity: 1 },
// //     ];
// //     setProducts(exampleProducts);
// //   }, []);

// //   // Calcula o total do carrinho sempre que o carrinho muda
// //   useEffect(() => {
// //     const newTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
// //     setTotal(newTotal);
// //   }, [cart]);

// //   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     setSearchTerm(event.target.value);
// //   };

// //   const addProductToCart = (productToAdd: Product) => {
// //     setCart((prevCart) => {
// //       const existingProduct = prevCart.find((item) => item.id === productToAdd.id);
// //       if (existingProduct) {
// //         return prevCart.map((item) =>
// //           item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
// //         );
// //       } else {
// //         return [...prevCart, { ...productToAdd, quantity: 1 }];
// //       }
// //     });
// //   };

// //   const removeProductFromCart = (productId: string) => {
// //     setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
// //   };

// //   const updateCartItemQuantity = (productId: string, newQuantity: number) => {
// //     setCart((prevCart) =>
// //       prevCart.map((item) =>
// //         item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
// //       )
// //     );
// //   };

// //   const finalizeSale = () => {
// //     if (cart.length === 0) {
// //       alert('O carrinho está vazio. Adicione produtos antes de finalizar a venda.');
// //       return;
// //     }
// //     const confirmSale = window.confirm(`Confirmar venda no valor total de R$ ${total.toFixed(2)}?`);
// //     if (confirmSale) {
// //       // Salva os dados da venda no localStorage
// //       localStorage.setItem('lastSaleCart', JSON.stringify(cart));
// //       localStorage.setItem('lastSaleTotal', total.toFixed(2));
// //       localStorage.setItem('lastSaleDate', new Date().toLocaleString('pt-BR')); // Opcional: data da venda

// //       alert('Venda finalizada com sucesso! Gerando recibo...');
// //       setCart([]); // Limpa o carrinho após a venda

// //       // Redireciona para a página de recibo
// //       router.push('/recibo-de-pagamento');
// //     }
// //   };

// //   const filteredProducts = searchTerm
// //     ? products.filter((product) =>
// //         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         product.id.toLowerCase().includes(searchTerm.toLowerCase())
// //       )
// //     : [];

// //   return (
// //     <div style={styles.container}>
// //       <Head>
// //         <title>PDV - Ponto de Vendas</title>
// //         <meta name="description" content="Página de Ponto de Vendas" />
// //         <link rel="icon" href="/favicon.ico" />
// //       </Head>

// //       <h1 style={styles.title}>Ponto de Vendas</h1>

// //       <div style={styles.mainContent}>
// //         <div style={styles.productsSection}>
// //           <h2>Produtos Disponíveis</h2>
// //           <input
// //             type="text"
// //             placeholder="Buscar produto por nome ou código..."
// //             value={searchTerm}
// //             onChange={handleSearch}
// //             style={styles.searchInput}
// //           />
// //           <div style={styles.productList}>
// //             {searchTerm && filteredProducts.length === 0 ? (
// //               <p style={{ textAlign: 'center', color: '#666' }}>Nenhum produto encontrado.</p>
// //             ) : searchTerm && filteredProducts.length > 0 ? (
// //               filteredProducts.map((product) => (
// //                 <div key={product.id} style={styles.productItem}>
// //                   <span style={styles.productName}>{product.name}</span>
// //                   <span style={styles.productPrice}>R$ {product.price.toFixed(2)}</span>
// //                   <button onClick={() => addProductToCart(product)} style={styles.addButton}>
// //                     Adicionar
// //                   </button>
// //                 </div>
// //               ))
// //             ) : (
// //               <p style={{ textAlign: 'center', color: '#666' }}>Digite para pesquisar produtos.</p>
// //             )}
// //           </div>
// //         </div>

// //         <div style={styles.cartSection}>
// //           <h2>Carrinho de Compras</h2>
// //           {cart.length === 0 ? (
// //             <p style={{ textAlign: 'center', color: '#666' }}>Nenhum item no carrinho.</p>
// //           ) : (
// //             <ul style={styles.cartList}>
// //               {cart.map((item) => (
// //                 <li key={item.id} style={styles.cartItem}>
// //                   <span style={styles.cartItemName}>{item.name}</span>
// //                   <div style={styles.cartItemControls}>
// //                     <input
// //                       type="number"
// //                       min="1"
// //                       value={item.quantity}
// //                       onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
// //                       style={styles.quantityInput}
// //                     />
// //                     <span style={styles.cartItemPrice}>
// //                       x R$ {item.price.toFixed(2)} = **R$ {(item.price * item.quantity).toFixed(2)}**
// //                     </span>
// //                     <button onClick={() => removeProductFromCart(item.id)} style={styles.removeButton}>
// //                       Remover
// //                     </button>
// //                   </div>
// //                 </li>
// //               ))}
// //             </ul>
// //           )}

// //           <div style={styles.totalSection}>
// //             <h3 style={styles.totalText}>Total: **R$ {total.toFixed(2)}**</h3>
// //             <button onClick={finalizeSale} style={styles.checkoutButton}>
// //               Finalizar Venda
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Estilos otimizados para um visual clean e profissional
// // const styles: { [key: string]: React.CSSProperties } = {
// //   container: {
// //     fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
// //     padding: '30px',
// //     maxWidth: '1200px',
// //     margin: '30px auto',
// //     backgroundColor: '#ffffff',
// //     borderRadius: '12px',
// //     boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
// //     color: '#333', // Cor do texto principal
// //   },
// //   title: {
// //     textAlign: 'center',
// //     color: '#2c3e50', // Cor de título mais escura
// //     marginBottom: '40px',
// //     fontSize: '2.5em',
// //     fontWeight: '600',
// //   },
// //   mainContent: {
// //     display: 'flex',
// //     gap: '25px',
// //     flexWrap: 'wrap',
// //     justifyContent: 'center',
// //   },
// //   productsSection: {
// //     flex: '2',
// //     minWidth: '350px',
// //     backgroundColor: '#f8f9fa', // Fundo mais claro para seções
// //     padding: '25px',
// //     borderRadius: '10px',
// //     boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
// //     border: '1px solid #e0e0e0', // Borda sutil
// //   },
// //   cartSection: {
// //     flex: '1',
// //     minWidth: '350px',
// //     backgroundColor: '#f8f9fa',
// //     padding: '25px',
// //     borderRadius: '10px',
// //     boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
// //     border: '1px solid #e0e0e0',
// //   },
// //   searchInput: {
// //     width: '100%',
// //     padding: '12px',
// //     marginBottom: '20px',
// //     border: '1px solid #ced4da', // Borda suave
// //     borderRadius: '6px',
// //     fontSize: '16px',
// //     color: '#495057',
// //     boxSizing: 'border-box', // Garante que padding não aumente a largura
// //   },
// //   productList: {
// //     maxHeight: '450px',
// //     overflowY: 'auto',
// //     border: '1px solid #e9ecef', // Borda mais clara
// //     borderRadius: '6px',
// //     padding: '10px',
// //     backgroundColor: '#ffffff', // Fundo branco para a lista
// //   },
// //   productItem: {
// //     display: 'flex',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: '12px 0',
// //     borderBottom: '1px solid #dee2e6', // Linha divisória suave
// //   },
// //   productName: {
// //     flexGrow: 1,
// //     fontWeight: '500',
// //     color: '#34495e', // Cor para nomes de produtos
// //   },
// //   productPrice: {
// //     marginLeft: '15px',
// //     marginRight: '15px',
// //     fontWeight: 'bold',
// //     color: '#28a745', // Cor verde para preços
// //   },
// //   addButton: {
// //     backgroundColor: '#007bff', // Azul primário
// //     color: 'white',
// //     border: 'none',
// //     padding: '8px 15px',
// //     borderRadius: '5px',
// //     cursor: 'pointer',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     transition: 'background-color 0.3s ease, transform 0.2s ease',
// //   },
// //   cartList: {
// //     listStyle: 'none',
// //     padding: '0',
// //     maxHeight: '350px',
// //     overflowY: 'auto',
// //     border: '1px solid #e9ecef',
// //     borderRadius: '6px',
// //     backgroundColor: '#ffffff',
// //   },
// //   cartItem: {
// //     display: 'flex',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: '12px 0',
// //     borderBottom: '1px solid #dee2e6',
// //   },
// //   cartItemName: {
// //     fontWeight: '500',
// //     color: '#34495e',
// //     flexGrow: 1,
// //   },
// //   cartItemControls: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     gap: '10px',
// //   },
// //   quantityInput: {
// //     width: '60px',
// //     padding: '8px',
// //     textAlign: 'center',
// //     border: '1px solid #ced4da',
// //     borderRadius: '5px',
// //     fontSize: '15px',
// //     color: '#495057',
// //   },
// //   cartItemPrice: {
// //     fontWeight: 'bold',
// //     color: '#28a745',
// //     minWidth: '100px', // Garante alinhamento
// //     textAlign: 'right',
// //   },
// //   removeButton: {
// //     backgroundColor: '#dc3545', // Vermelho para remover
// //     color: 'white',
// //     border: 'none',
// //     padding: '6px 10px',
// //     borderRadius: '5px',
// //     cursor: 'pointer',
// //     fontSize: '13px',
// //     fontWeight: '500',
// //     transition: 'background-color 0.3s ease, transform 0.2s ease',
// //   },
// //   totalSection: {
// //     marginTop: '25px',
// //     paddingTop: '20px',
// //     borderTop: '2px solid #e9ecef', // Borda mais proeminente
// //     textAlign: 'right',
// //   },
// //   totalText: {
// //     fontSize: '1.8em',
// //     color: '#2c3e50',
// //     fontWeight: '700',
// //     marginBottom: '15px',
// //   },
// //   checkoutButton: {
// //     backgroundColor: '#28a745', // Verde para finalizar
// //     color: 'white',
// //     border: 'none',
// //     padding: '15px 30px',
// //     borderRadius: '8px',
// //     cursor: 'pointer',
// //     fontSize: '1.2em',
// //     fontWeight: 'bold',
// //     transition: 'background-color 0.3s ease, transform 0.2s ease',
// //     width: '100%',
// //   },
// // };

// // export default PDVPage;

// // versao 2
// // pages/PDVPage.tsx (ou o nome do seu arquivo atual)

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

// const PDVPage: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [cart, setCart] = useState<Product[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [total, setTotal] = useState<number>(0);
//   const router = useRouter();

//   // Produtos de exemplo (você pode carregar isso de uma API real)
//   useEffect(() => {
//     const exampleProducts: Product[] = [
//       { id: 'PROD001', name: 'Arroz 5kg', price: 25.00, quantity: 1 },
//       { id: 'PROD002', name: 'Feijão 1kg', price: 8.50, quantity: 1 },
//       { id: 'PROD003', name: 'Óleo de Soja', price: 7.20, quantity: 1 },
//       { id: 'PROD004', name: 'Açúcar 1kg', price: 4.80, quantity: 1 },
//       { id: 'PROD005', name: 'Café 500g', price: 12.00, quantity: 1 },
//       { id: 'PROD006', name: 'Leite Integral 1L', price: 5.50, quantity: 1 },
//       { id: 'PROD007', name: 'Pão de Forma', price: 6.90, quantity: 1 },
//       { id: 'PROD008', name: 'Manteiga 200g', price: 9.90, quantity: 1 },
//       { id: 'PROD009', name: 'Refrigerante 2L', price: 7.00, quantity: 1 },
//       { id: 'PROD010', name: 'Biscoito Recheado', price: 3.50, quantity: 1 },
//     ];
//     setProducts(exampleProducts);
//   }, []);

//   // Calcula o total do carrinho sempre que o carrinho muda
//   useEffect(() => {
//     const newTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
//     setTotal(newTotal);
//   }, [cart]);

//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(event.target.value);
//   };

//   const addProductToCart = (productToAdd: Product) => {
//     setCart((prevCart) => {
//       const existingProduct = prevCart.find((item) => item.id === productToAdd.id);
//       if (existingProduct) {
//         return prevCart.map((item) =>
//           item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       } else {
//         return [...prevCart, { ...productToAdd, quantity: 1 }];
//       }
//     });
//   };

//   const removeProductFromCart = (productId: string) => {
//     setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
//   };

//   const updateCartItemQuantity = (productId: string, newQuantity: number) => {
//     setCart((prevCart) =>
//       prevCart.map((item) =>
//         item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
//       )
//     );
//   };

//   const finalizeSale = () => {
//     if (cart.length === 0) {
//       alert('O carrinho está vazio. Adicione produtos antes de finalizar a venda.');
//       return;
//     }
//     const confirmSale = window.confirm(`Confirmar venda no valor total de R$ ${total.toFixed(2)}?`);
//     if (confirmSale) {
//       localStorage.setItem('lastSaleCart', JSON.stringify(cart));
//       localStorage.setItem('lastSaleTotal', total.toFixed(2));
//       localStorage.setItem('lastSaleDate', new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })); // Define o fuso horário de Fortaleza

//       alert('Venda finalizada com sucesso! Gerando recibo...');
//       setCart([]);
//       router.push('/recibo-de-pagamento');
//     }
//   };

//   // --- NOVA FUNÇÃO PARA SIMULAR LEITURA DE CÓDIGO DE BARRAS ---
//   const handleBarcodeScan = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'Enter') {
//       const scannedCode = searchTerm.trim().toUpperCase(); // Pega o valor do input e padroniza
//       const productFound = products.find(
//         (product) => product.id.toUpperCase() === scannedCode || product.name.toUpperCase() === scannedCode
//       );

//       if (productFound) {
//         addProductToCart(productFound);
//         setSearchTerm(''); // Limpa o campo de busca após adicionar o produto
//       } else {
//         alert(`Produto com código ou nome "${scannedCode}" não encontrado.`);
//         setSearchTerm(''); // Limpa o campo de busca mesmo se não encontrar
//       }
//       event.preventDefault(); // Impede o envio do formulário padrão, se houver
//     }
//   };

//   const filteredProducts = searchTerm
//     ? products.filter((product) =>
//         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         product.id.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : [];

//   return (
//     <div style={styles.container}>
//       <Head>
//         <title>PDV - Ponto de Vendas</title>
//         <meta name="description" content="Página de Ponto de Vendas" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <h1 style={styles.title}>Ponto de Vendas</h1>

//       <div style={styles.mainContent}>
//         <div style={styles.productsSection}>
//           <h2>Produtos Disponíveis</h2>
//           <input
//             type="text"
//             placeholder="Buscar produto por nome ou código..."
//             value={searchTerm}
//             onChange={handleSearch}
//             onKeyDown={handleBarcodeScan} 
//             style={styles.searchInput}
//           />
//           <div style={styles.productList}>
//             {searchTerm && filteredProducts.length === 0 ? (
//               <p style={{ textAlign: 'center', color: '#666' }}>Nenhum produto encontrado.</p>
//             ) : searchTerm && filteredProducts.length > 0 ? (
//               filteredProducts.map((product) => (
//                 <div key={product.id} style={styles.productItem}>
//                   <span style={styles.productName}>{product.name}</span>
//                   <span style={styles.productPrice}>R$ {product.price.toFixed(2)}</span>
//                   <button onClick={() => addProductToCart(product)} style={styles.addButton}>
//                     Adicionar
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <p style={{ textAlign: 'center', color: '#666' }}>Digite para pesquisar produtos ou simule um código de barras.</p> 
//             )}
//           </div>
//         </div>

//         <div style={styles.cartSection}>
//           <h2>Carrinho de Compras</h2>
//           {cart.length === 0 ? (
//             <p style={{ textAlign: 'center', color: '#666' }}>Nenhum item no carrinho.</p>
//           ) : (
//             <ul style={styles.cartList}>
//               {cart.map((item) => (
//                 <li key={item.id} style={styles.cartItem}>
//                   <span style={styles.cartItemName}>{item.name}</span>
//                   <div style={styles.cartItemControls}>
//                     <input
//                       type="number"
//                       min="1"
//                       value={item.quantity}
//                       onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
//                       style={styles.quantityInput}
//                     />
//                     <span style={styles.cartItemPrice}>
//                       x R$ {item.price.toFixed(2)} = **R$ {(item.price * item.quantity).toFixed(2)}**
//                     </span>
//                     <button onClick={() => removeProductFromCart(item.id)} style={styles.removeButton}>
//                       Remover
//                     </button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}

//           <div style={styles.totalSection}>
//             <h3 style={styles.totalText}>Total: **R$ {total.toFixed(2)}**</h3>
//             <button onClick={finalizeSale} style={styles.checkoutButton}>
//               Finalizar Venda
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Estilos otimizados para um visual clean e profissional
// const styles: { [key: string]: React.CSSProperties } = {
//   container: {
//     fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
//     padding: '30px',
//     maxWidth: '1200px',
//     margin: '30px auto',
//     backgroundColor: '#ffffff',
//     borderRadius: '12px',
//     boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//     color: '#333',
//   },
//   title: {
//     textAlign: 'center',
//     color: '#2c3e50',
//     marginBottom: '40px',
//     fontSize: '2.5em',
//     fontWeight: '600',
//   },
//   mainContent: {
//     display: 'flex',
//     gap: '25px',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   productsSection: {
//     flex: '2',
//     minWidth: '350px',
//     backgroundColor: '#f8f9fa',
//     padding: '25px',
//     borderRadius: '10px',
//     boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
//     border: '1px solid #e0e0e0',
//   },
//   cartSection: {
//     flex: '1',
//     minWidth: '350px',
//     backgroundColor: '#f8f9fa',
//     padding: '25px',
//     borderRadius: '10px',
//     boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
//     border: '1px solid #e0e0e0',
//   },
//   searchInput: {
//     width: '100%',
//     padding: '12px',
//     marginBottom: '20px',
//     border: '1px solid #ced4da',
//     borderRadius: '6px',
//     fontSize: '16px',
//     color: '#495057',
//     boxSizing: 'border-box',
//   },
//   productList: {
//     maxHeight: '450px',
//     overflowY: 'auto',
//     border: '1px solid #e9ecef',
//     borderRadius: '6px',
//     padding: '10px',
//     backgroundColor: '#ffffff',
//   },
//   productItem: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '12px 0',
//     borderBottom: '1px solid #dee2e6',
//   },
//   productName: {
//     flexGrow: 1,
//     fontWeight: '500',
//     color: '#34495e',
//   },
//   productPrice: {
//     marginLeft: '15px',
//     marginRight: '15px',
//     fontWeight: 'bold',
//     color: '#28a745',
//   },
//   addButton: {
//     backgroundColor: '#007bff',
//     color: 'white',
//     border: 'none',
//     padding: '8px 15px',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     fontWeight: '500',
//     transition: 'background-color 0.3s ease, transform 0.2s ease',
//   },
//   cartList: {
//     listStyle: 'none',
//     padding: '0',
//     maxHeight: '350px',
//     overflowY: 'auto',
//     border: '1px solid #e9ecef',
//     borderRadius: '6px',
//     backgroundColor: '#ffffff',
//   },
//   cartItem: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '12px 0',
//     borderBottom: '1px solid #dee2e6',
//   },
//   cartItemName: {
//     fontWeight: '500',
//     color: '#34495e',
//     flexGrow: 1,
//   },
//   cartItemControls: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '10px',
//   },
//   quantityInput: {
//     width: '60px',
//     padding: '8px',
//     textAlign: 'center',
//     border: '1px solid #ced4da',
//     borderRadius: '5px',
//     fontSize: '15px',
//     color: '#495057',
//   },
//   cartItemPrice: {
//     fontWeight: 'bold',
//     color: '#28a745',
//     minWidth: '100px',
//     textAlign: 'right',
//   },
//   removeButton: {
//     backgroundColor: '#dc3545',
//     color: 'white',
//     border: 'none',
//     padding: '6px 10px',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontSize: '13px',
//     fontWeight: '500',
//     transition: 'background-color 0.3s ease, transform 0.2s ease',
//   },
//   totalSection: {
//     marginTop: '25px',
//     paddingTop: '20px',
//     borderTop: '2px solid #e9ecef',
//     textAlign: 'right',
//   },
//   totalText: {
//     fontSize: '1.8em',
//     color: '#2c3e50',
//     fontWeight: '700',
//     marginBottom: '15px',
//   },
//   checkoutButton: {
//     backgroundColor: '#28a745',
//     color: 'white',
//     border: 'none',
//     padding: '15px 30px',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontSize: '1.2em',
//     fontWeight: 'bold',
//     transition: 'background-color 0.3s ease, transform 0.2s ease',
//     width: '100%',
//   },
// };

// export default PDVPage;

// pages/PDVPage.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const PDVPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  // Novo estado para controlar o produto recém-adicionado ao carrinho para destaque visual
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const router = useRouter();

  // Produtos de exemplo (você pode carregar isso de uma API real)
  useEffect(() => {
    const exampleProducts: Product[] = [
      { id: 'PROD001', name: 'Arroz 5kg', price: 25.00, quantity: 1 },
      { id: 'PROD002', name: 'Feijão 1kg', price: 8.50, quantity: 1 },
      { id: 'PROD003', name: 'Óleo de Soja', price: 7.20, quantity: 1 },
      { id: 'PROD004', name: 'Açúcar 1kg', price: 4.80, quantity: 1 },
      { id: 'PROD005', name: 'Café 500g', price: 12.00, quantity: 1 },
      { id: 'PROD006', name: 'Leite Integral 1L', price: 5.50, quantity: 1 },
      { id: 'PROD007', name: 'Pão de Forma', price: 6.90, quantity: 1 },
      { id: 'PROD008', name: 'Manteiga 200g', price: 9.90, quantity: 1 },
      { id: 'PROD009', name: 'Refrigerante 2L', price: 7.00, quantity: 1 },
      { id: 'PROD010', name: 'Biscoito Recheado', price: 3.50, quantity: 1 },
    ];
    setProducts(exampleProducts);
  }, []);

  // Calcula o total do carrinho sempre que o carrinho muda
  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [cart]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const addProductToCart = (productToAdd: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === productToAdd.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...productToAdd, quantity: 1 }];
      }
    });

    // Define o produto a ser destacado e remove o destaque após um tempo
    setHighlightedProductId(productToAdd.id);
    const timer = setTimeout(() => {
      setHighlightedProductId(null);
    }, 1000); // Remove o destaque após 1 segundo

    // Limpeza do timer se o componente for desmontado antes do timeout
    return () => clearTimeout(timer);
  };

  const removeProductFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const finalizeSale = () => {
    if (cart.length === 0) {
      alert('O carrinho está vazio. Adicione produtos antes de finalizar a venda.');
      return;
    }
    const confirmSale = window.confirm(`Confirmar venda no valor total de R$ ${total.toFixed(2)}?`);
    if (confirmSale) {
      localStorage.setItem('lastSaleCart', JSON.stringify(cart));
      // Garante que o total seja salvo como string formatada para o recibo
      localStorage.setItem('lastSaleTotal', total.toFixed(2));
      localStorage.setItem('lastSaleDate', new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }));

      alert('Venda finalizada com sucesso! Gerando recibo...');
      setCart([]);
      router.push('/recibo-de-pagamento');
    }
  };

  // Função para simular a leitura de código de barras
  const handleBarcodeScan = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const scannedCode = searchTerm.trim().toUpperCase(); // Pega o valor do input e padroniza
      const productFound = products.find(
        (product) => product.id.toUpperCase() === scannedCode || product.name.toUpperCase() === scannedCode
      );

      if (productFound) {
        addProductToCart(productFound);
        setSearchTerm(''); // Limpa o campo de busca após adicionar o produto
      } else {
        alert(`Produto com código ou nome "${scannedCode}" não encontrado.`);
        setSearchTerm(''); // Limpa o campo de busca mesmo se não encontrar
      }
      event.preventDefault(); // Impede o envio do formulário padrão, se houver
    }
  };

  const filteredProducts = searchTerm
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div style={styles.container}>
      <Head>
        <title>PDV - Ponto de Vendas</title>
        <meta name="description" content="Página de Ponto de Vendas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 style={styles.title}>Ponto de Vendas</h1>

      <div style={styles.mainContent}>
        <div style={styles.productsSection}>
          <h2>Produtos Disponíveis</h2>
          <input
            type="text"
            // Placeholder atualizado para melhor clareza da funcionalidade de busca/leitura de código
            placeholder="Buscar produto (digite ou escaneie o código de barras)..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleBarcodeScan} // Adicionado o handler para simular leitura de código de barras
            style={styles.searchInput}
          />
          <div style={styles.productList}>
            {searchTerm && filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhum produto encontrado.</p>
            ) : searchTerm && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} style={styles.productItem}>
                  <span style={styles.productName}>{product.name}</span>
                  <span style={styles.productPrice}>R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addProductToCart(product)} style={styles.addButton}>
                    Adicionar
                  </button>
                </div>
              ))
            ) : (
              // Mensagem para quando não há termo de busca, orientando o usuário
              <p style={{ textAlign: 'center', color: '#666' }}>
                Comece a digitar para pesquisar produtos ou simule um código de barras pressionando Enter.
              </p>
            )}
          </div>
        </div>

        <div style={styles.cartSection}>
          <h2>Carrinho de Compras</h2>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Nenhum item no carrinho.</p>
          ) : (
            <ul style={styles.cartList}>
              {cart.map((item) => (
                <li
                  key={item.id}
                  style={{
                    ...styles.cartItem,
                    // Aplica estilo de destaque se o item for o que acabou de ser adicionado
                    ...(item.id === highlightedProductId && styles.highlightedCartItem),
                  }}
                >
                  <span style={styles.cartItemName}>{item.name}</span>
                  <div style={styles.cartItemControls}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
                      style={styles.quantityInput}
                    />
                    <span style={styles.cartItemPrice}>
                      x R$ {item.price.toFixed(2)} = **R$ {(item.price * item.quantity).toFixed(2)}**
                    </span>
                    <button onClick={() => removeProductFromCart(item.id)} style={styles.removeButton}>
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div style={styles.totalSection}>
            <h3 style={styles.totalText}>Total: **R$ {total.toFixed(2)}**</h3>
            <button onClick={finalizeSale} style={styles.checkoutButton}>
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos otimizados para um visual clean e profissional
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    padding: '30px',
    maxWidth: '1200px',
    margin: '30px auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    color: '#333',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '40px',
    fontSize: '2.5em',
    fontWeight: '600',
  },
  mainContent: {
    display: 'flex',
    gap: '25px',
    flexWrap: 'wrap', // Permite que as colunas se empilhem em telas menores
    justifyContent: 'center',
  },
  productsSection: {
    flex: '2', // Ocupa mais espaço em telas grandes
    minWidth: '350px', // Garante um tamanho mínimo
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
  },
  cartSection: {
    flex: '1', // Ocupa menos espaço em telas grandes
    minWidth: '350px', // Garante um tamanho mínimo
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '16px',
    color: '#495057',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Transição para foco
  },
  // Efeito de foco para o input de busca
  'searchInput:focus': {
    borderColor: '#007bff',
    boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
    outline: 'none',
  },
  productList: {
    maxHeight: '450px',
    overflowY: 'auto',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '10px',
    backgroundColor: '#ffffff',
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #dee2e6',
  },
  productName: {
    flexGrow: 1,
    fontWeight: '500',
    color: '#34495e',
  },
  productPrice: {
    marginLeft: '15px',
    marginRight: '15px',
    fontWeight: 'bold',
    color: '#28a745',
  },
  addButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  // Efeito hover para o botão Adicionar
  'addButton:hover': {
    backgroundColor: '#0056b3',
    transform: 'scale(1.02)',
  },
  cartList: {
    listStyle: 'none',
    padding: '0',
    maxHeight: '350px',
    overflowY: 'auto',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #dee2e6',
  },
  // Estilo para o item do carrinho que acabou de ser adicionado, com transição
  highlightedCartItem: {
    backgroundColor: '#e6ffe6', // Um verde claro sutil para o destaque
    transition: 'background-color 0.5s ease-out', // Animação de saída suave do fundo
  },
  cartItemName: {
    fontWeight: '500',
    color: '#34495e',
    flexGrow: 1,
  },
  cartItemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quantityInput: {
    width: '60px',
    padding: '8px',
    textAlign: 'center',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    fontSize: '15px',
    color: '#495057',
    transition: 'border-color 0.2s ease-in-out', // Transição para foco
  },
  // Efeito de foco para o input de quantidade
  'quantityInput:focus': {
    borderColor: '#007bff',
    outline: 'none',
  },
  cartItemPrice: {
    fontWeight: 'bold',
    color: '#28a745',
    minWidth: '100px',
    textAlign: 'right',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  // Efeito hover para o botão Remover
  'removeButton:hover': {
    backgroundColor: '#c82333',
    transform: 'scale(1.02)',
  },
  totalSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '2px solid #e9ecef',
    textAlign: 'right',
  },
  totalText: {
    fontSize: '1.8em',
    color: '#2c3e50',
    fontWeight: '700',
    marginBottom: '15px',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    width: '100%', // Botão de finalizar venda ocupa 100% da largura da seção
  },
  // Efeito hover para o botão Finalizar Venda
  'checkoutButton:hover': {
    backgroundColor: '#218838',
    transform: 'scale(1.01)',
  },
};

export default PDVPage;