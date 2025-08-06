"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

// Interface ajustada ao schema do Prisma, mas simplificada para o carrinho e interface
interface Product {
  sku: string; // Usar sku como identificador único
  nome: string;
  preco: number;
  quantidade: number; // Quantidade é usada apenas no carrinho
}

// Interfaces para o sistema de vendas
interface SaleItem {
  produto: string;
  preco: number;
  quantidade: number;
}

interface Sale {
  id: string;
  data: string;
  itens: SaleItem[];
  total: number;
}

const PDVPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // Produtos pesquisados
  const [cart, setCart] = useState<Product[]>([]); // Carrinho
  const [searchTerm, setSearchTerm] = useState<string>(''); // Termo de busca (SKU)
  const [total, setTotal] = useState<number>(0); // Total do carrinho
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null); // Produto destacado
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Carregar carrinho e produtos pesquisados do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedProducts = localStorage.getItem('searchedProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Atualizar localStorage e calcular total sempre que o carrinho ou produtos pesquisados mudarem
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('searchedProducts', JSON.stringify(products));
    const newTotal = cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    setTotal(newTotal);
  }, [cart, products]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const addProductToCart = (productToAdd: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.sku === productToAdd.sku);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.sku === productToAdd.sku ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      } else {
        return [...prevCart, { ...productToAdd, quantidade: 1 }];
      }
    });

    // Adicionar produto à lista de produtos pesquisados, se ainda não estiver
    setProducts((prevProducts) => {
      if (!prevProducts.some((p) => p.sku === productToAdd.sku)) {
        return [...prevProducts, productToAdd];
      }
      return prevProducts;
    });

    // Define o produto a ser destacado
    setHighlightedProductId(productToAdd.sku);
    const timer = setTimeout(() => {
      setHighlightedProductId(null);
    }, 1500);
    return () => clearTimeout(timer);
  };

  const removeProductFromCart = (sku: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  const updateCartItemQuantity = (sku: string, newQuantidade: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.sku === sku ? { ...item, quantidade: Math.max(1, newQuantidade) } : item
      )
    );
  };

  // Função para gerar ID único da venda
  const generateSaleId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `venda${timestamp}${random}`;
  };

  // Função para salvar venda no localStorage
  const saveSaleToStorage = (sale: Sale) => {
    try {
      // Recuperar vendas existentes
      const existingSalesJson = localStorage.getItem('sales');
      const existingSales: Sale[] = existingSalesJson ? JSON.parse(existingSalesJson) : [];
      
      // Adicionar nova venda no início da lista (mais recente primeiro)
      const updatedSales = [sale, ...existingSales];
      
      // Salvar de volta no localStorage
      localStorage.setItem('sales', JSON.stringify(updatedSales));
      
      console.log('Venda salva com sucesso:', sale);
      return true;
    } catch (error) {
      console.error('Erro ao salvar venda no localStorage:', error);
      return false;
    }
  };

 const finalizeSale = async () => {
  if (cart.length === 0) {
    alert('O carrinho está vazio. Adicione produtos antes de finalizar a venda.');
    return;
  }
  
  const confirmSale = window.confirm(`Confirmar venda no valor total de R$ ${total.toFixed(2)}?`);
  if (!confirmSale) return;

  setIsLoading(true);

  try {
    // Preparar dados para decrementar estoque
    const stockItems = cart.map(item => ({
      sku: item.sku,
      quantidade: item.quantidade
    }));

    // Decrementar estoque no banco
    const response = await fetch('/api/decrement-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itens: stockItems }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Erro ao atualizar estoque');
    }

    // Criar objeto da venda para localStorage
    const newSale = {
      id: generateSaleId(),
      data: new Date().toISOString(),
      itens: cart.map(item => ({
        produto: item.nome,
        preco: item.preco,
        quantidade: item.quantidade
      })),
      total: parseFloat(total.toFixed(2))
    };

    // Salvar no localStorage
    saveSaleToStorage(newSale);
    localStorage.setItem('lastSaleCart', JSON.stringify(cart));
    localStorage.setItem('lastSaleTotal', total.toFixed(2));
    localStorage.setItem('lastSaleDate', new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }));
    localStorage.setItem('lastSaleId', newSale.id);
    
    // Limpar carrinho
    setCart([]);
    setProducts([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('searchedProducts');
    
    alert('Venda finalizada com sucesso! Estoque atualizado.');
    router.push('/recibo-de-pagamento');

  } catch (error) {
    console.error('Erro ao finalizar venda:', error);
    alert(`Erro ao finalizar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  } finally {
    setIsLoading(false);
  }
};

const clearCart = () => {
  if (cart.length === 0) return;
  const confirmClear = window.confirm('Deseja limpar todo o carrinho?');
  if (confirmClear) {
    setCart([]);
    setProducts([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('searchedProducts');
  }
};

  // Função para buscar produto por SKU via API
  const fetchProductBySKU = async (sku: string): Promise<Product | null> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sku }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar produto');
      }

      const productData = await response.json();
      return {
        sku: productData.sku,
        nome: productData.nome,
        preco: parseFloat(productData.preco),
        quantidade: 1,
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para simular leitura de código de barras
  const handleBarcodeScan = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const scannedCode = searchTerm.trim()
      if (!scannedCode) {
        alert('Por favor, insira um código SKU para buscar.');
        return;
      }

      // Verifica se o produto já está na lista local de produtos pesquisados
      const productFound = products.find((product) => product.sku.toUpperCase() === scannedCode);
      if (productFound) {
        addProductToCart(productFound);
        setSearchTerm('');
      } else {
        // Tenta buscar o produto na API
        const productFromAPI = await fetchProductBySKU(scannedCode);
        if (productFromAPI) {
          addProductToCart(productFromAPI);
          setSearchTerm('');
        } else {
          alert(`Produto com SKU "${scannedCode}" não encontrado.`);
          setSearchTerm('');
        }
      }
      event.preventDefault();
    }
  };

  return (
    <div style={styles.wrapper}>
      <Head>
        <title>PDV - Ponto de Vendas</title>
        <meta name="description" content="Sistema de Ponto de Vendas Profissional" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>
            <span style={styles.logoIcon}>🏪</span>
            Sistema PDV
          </h1>
          <div style={styles.headerInfo}>
            <span style={styles.datetime}>
              {new Date().toLocaleDateString('pt-BR')} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.mainContent}>
          {/* Seção de Produtos */}
          <section style={styles.productsSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📦</span>
                Buscar Produtos
              </h2>
            </div>
            
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Digite ou escaneie o código SKU e pressione Enter..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleBarcodeScan}
                style={styles.searchInput}
                disabled={isLoading}
              />
              {isLoading && <div style={styles.loadingIndicator}>Buscando...</div>}
            </div>

            <div style={styles.productListContainer}>
              {products.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🔍</span>
                  <p style={styles.emptyText}>
                    Nenhum produto pesquisado ainda
                  </p>
                  <small style={styles.emptySubtext}>
                    Escaneie ou digite um SKU e pressione Enter
                  </small>
                </div>
              ) : (
                <div style={styles.productList}>
                  {products.map((product) => (
                    <div key={product.sku} style={styles.productCard}>
                      <div style={styles.productInfo}>
                        <h3 style={styles.productName}>{product.nome}</h3>
                        <p style={styles.productSku}>SKU: {product.sku}</p>
                      </div>
                      <div style={styles.productActions}>
                        <span style={styles.productPrice}>R$ {product.preco.toFixed(2)}</span>
                        <button 
                          onClick={() => addProductToCart(product)} 
                          style={styles.addButton}
                        >
                          <span style={styles.buttonIcon}>+</span>
                          Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Seção do Carrinho */}
          <section style={styles.cartSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>🛒</span>
                Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
              </h2>
              {cart.length > 0 && (
                <button onClick={clearCart} style={styles.clearButton}>
                  Limpar
                </button>
              )}
            </div>

            <div style={styles.cartContainer}>
              {cart.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🛒</span>
                  <p style={styles.emptyText}>Carrinho vazio</p>
                  <small style={styles.emptySubtext}>
                    Adicione produtos para começar uma venda
                  </small>
                </div>
              ) : (
                <div style={styles.cartList}>
                  {cart.map((item) => (
                    <div
                      key={item.sku}
                      style={{
                        ...styles.cartItem,
                        ...(item.sku === highlightedProductId && styles.highlightedCartItem),
                      }}
                    >
                      <div style={styles.cartItemInfo}>
                        <h4 style={styles.cartItemName}>{item.nome}</h4>
                        <p style={styles.cartItemSku}>SKU: {item.sku}</p>
                        <p style={styles.cartItemUnit}>R$ {item.preco.toFixed(2)} / unidade</p>
                      </div>
                      <div style={styles.cartItemControls}>
                        <div style={styles.quantityControls}>
                          <button 
                            onClick={() => updateCartItemQuantity(item.sku, item.quantidade - 1)}
                            style={styles.quantityButton}
                            disabled={item.quantidade <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => updateCartItemQuantity(item.sku, parseInt(e.target.value) || 1)}
                            style={styles.quantityInput}
                          />
                          <button 
                            onClick={() => updateCartItemQuantity(item.sku, item.quantidade + 1)}
                            style={styles.quantityButton}
                          >
                            +
                          </button>
                        </div>
                        <div style={styles.cartItemPricing}>
                          <span style={styles.cartItemTotal}>
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </span>
                          <button 
                            onClick={() => removeProductFromCart(item.sku)} 
                            style={styles.removeButton}
                            title="Remover item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total e Finalização */}
            {cart.length > 0 && (
              <div style={styles.checkoutSection}>
                <div style={styles.totalContainer}>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Subtotal:</span>
                    <span style={styles.totalValue}>R$ {total.toFixed(2)}</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total:</span>
                    <span style={styles.finalTotal}>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={finalizeSale} style={styles.checkoutButton}>
                  <span style={styles.buttonIcon}>✓</span>
                  Finalizar Venda
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

// Estilos modernos e profissionais
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1rem 0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  logo: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  logoIcon: {
    fontSize: '1.5rem',
  },
  
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  
  datetime: {
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },

  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start',
  },

  productsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },

  cartSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    position: 'sticky' as const,
    top: '100px',
    maxHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column' as const,
  },

  sectionHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  sectionIcon: {
    fontSize: '1.125rem',
  },

  clearButton: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    color: '#64748b',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  },

  searchContainer: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },

  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    color: '#374151',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
  },

  loadingIndicator: {
    marginTop: '0.5rem',
    color: '#6366f1',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  productListContainer: {
    flex: 1,
    minHeight: '400px',
  },

  productList: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },

  productCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    margin: '0 0 0.25rem 0',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
  },

  productSku: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#64748b',
  },

  productActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },

  productPrice: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#059669',
  },

  addButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  buttonIcon: {
    fontSize: '0.875rem',
  },

  cartContainer: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },

  cartList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },

  cartItem: {
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    transition: 'all 0.3s ease',
  },

  highlightedCartItem: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    transform: 'scale(1.02)',
  },

  cartItemInfo: {
    marginBottom: '1rem',
  },

  cartItemName: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
  },

  cartItemSku: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.75rem',
    color: '#64748b',
  },

  cartItemUnit: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#64748b',
  },

  cartItemControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  quantityButton: {
    width: '2rem',
    height: '2rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  quantityInput: {
    width: '3rem',
    height: '2rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: '#ffffff',
  },

  cartItemPricing: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  cartItemTotal: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#059669',
  },

  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },

  checkoutSection: {
    borderTop: '1px solid #e2e8f0',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
  },

  totalContainer: {
    marginBottom: '1.5rem',
  },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },

  totalLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
  },

  totalValue: {
    fontSize: '0.875rem',
    color: '#374151',
    fontWeight: '600',
  },

  finalTotal: {
    fontSize: '1.25rem',
    color: '#1e293b',
    fontWeight: '700',
  },

  checkoutButton: {
    width: '100%',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },

  emptyState: {
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    color: '#64748b',
  },

  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },

  emptyText: {
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
  },

  emptySubtext: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
};

export default PDVPage;