"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

// Interfaces remain unchanged
interface Product {
  sku: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface SaleItem {
  produto: string;
  preco: number;
  quantidade: number;
}

interface Sale {
  id: string;
  createdAt?: string; // Tornando opcional se necessário
  data: string; // Mantendo compatibilidade com seu código atual
  itens: SaleItem[];
  total: number;
  paymentMethod: string;
}

const PDVPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [highlightedProductId, setHighlightedProductId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Existing useEffect hooks remain unchanged for localStorage and total calculation
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedProducts = localStorage.getItem("searchedProducts");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    const savedPaymentMethod = localStorage.getItem("paymentMethod");
    if (savedPaymentMethod) setPaymentMethod(savedPaymentMethod);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("searchedProducts", JSON.stringify(products));
    localStorage.setItem("paymentMethod", JSON.stringify(paymentMethod));
    const newTotal = cart.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );
    setTotal(newTotal);
  }, [cart, products, paymentMethod]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setErrorMessage(null);
  };

  const addProductToCart = (productToAdd: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => item.sku === productToAdd.sku
      );
      if (existingProduct) {
        return prevCart.map((item) =>
          item.sku === productToAdd.sku
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prevCart, { ...productToAdd, quantidade: 1 }];
    });
    setProducts((prevProducts) => {
      if (!prevProducts.some((p) => p.sku === productToAdd.sku)) {
        return [...prevProducts, productToAdd];
      }
      return prevProducts;
    });
    setHighlightedProductId(productToAdd.sku);
    setTimeout(() => setHighlightedProductId(null), 1500);
  };

  const removeProductFromCart = (sku: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  const updateCartItemQuantity = (sku: string, newQuantidade: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.sku === sku
          ? { ...item, quantidade: Math.max(1, newQuantidade) }
          : item
      )
    );
  };

  const generateSaleId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `venda${timestamp}${random}`;
  };

  const saveSaleToStorage = (sale: Sale) => {
    try {
      const existingSalesJson = localStorage.getItem("sales");
      const existingSales: Sale[] = existingSalesJson
        ? JSON.parse(existingSalesJson)
        : [];
      const updatedSales = [sale, ...existingSales];
      localStorage.setItem("sales", JSON.stringify(updatedSales));
      return true;
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      return false;
    }
  };

  const finalizeSale = async () => {
    if (cart.length === 0) {
      setErrorMessage(
        "O carrinho está vazio. Adicione produtos antes de finalizar."
      );
      return;
    }

    const confirmSale = window.confirm(
      `Confirmar venda no valor de R$ ${total.toFixed(2)} com ${paymentMethod}?`
    );
    if (!confirmSale) return;

    setIsLoading(true);
    try {
      // 1. Primeiro decrementa o estoque
      const stockItems = cart.map((item) => ({
        sku: item.sku,
        quantidade: item.quantidade,
      }));
      const stockResponse = await fetch("/api/decrement-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: stockItems }),
      });

      const stockResult = await stockResponse.json();
      if (!stockResponse.ok || !stockResult.success) {
        throw new Error(stockResult.message || "Erro ao atualizar estoque");
      }

      // 2. Cria a venda no banco de dados
      const saleItems = cart.map((item) => ({
        produto: { sku: item.sku, nome: item.nome }, // Inclui SKU e nome
        preco: item.preco,
        quantidade: item.quantidade,
      }));

      const saleResponse = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: saleItems,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
        }),
      });

      const saleResult = await saleResponse.json();
      if (!saleResponse.ok || !saleResult.success) {
        throw new Error(saleResult.message || "Erro ao registrar venda");
      }

      // 3. Salva localmente para histórico
      const newSale = {
        id: saleResult.sale.id,
        createdAt: new Date().toISOString(), // Adicionando createdAt
        data: new Date().toISOString(), // Mantendo data para compatibilidade
        itens: cart.map((item) => ({
          produto: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
        })),
        total: parseFloat(total.toFixed(2)),
        paymentMethod,
      };

      saveSaleToStorage(newSale);

      // 4. Limpa o carrinho e redireciona
      setCart([]);
      setProducts([]);
      localStorage.removeItem("cart");
      localStorage.removeItem("searchedProducts");

      alert("Venda finalizada com sucesso!");
      router.push(`/recibo-de-pagamento?id=${saleResult.sale.id}`);
    } catch (error) {
      setErrorMessage(
        `Erro ao finalizar venda: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Deseja limpar o carrinho?")) {
      setCart([]);
      setProducts([]);
      localStorage.removeItem("cart");
      localStorage.removeItem("searchedProducts");
      localStorage.removeItem("paymentMethod");
      setPaymentMethod("PIX");
    }
  };

  const fetchProductBySKU = async (sku: string): Promise<Product | null> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar produto");
      }
      const productData = await response.json();
      return {
        sku: productData.sku,
        nome: productData.nome,
        preco: parseFloat(productData.preco),
        quantidade: 1,
      };
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      setErrorMessage(`Produto com SKU "${sku}" não encontrado.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      const scannedCode = searchTerm.trim();
      if (!scannedCode) {
        setErrorMessage("Digite um SKU para buscar.");
        return;
      }
      const productFound = products.find(
        (product) => product.sku.toUpperCase() === scannedCode
      );
      if (productFound) {
        addProductToCart(productFound);
        setSearchTerm("");
      } else {
        const productFromAPI = await fetchProductBySKU(scannedCode);
        if (productFromAPI) {
          addProductToCart(productFromAPI);
          setSearchTerm("");
        }
      }
      event.preventDefault();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "/") {
        (document.getElementById("searchInput") as HTMLInputElement)?.focus();
      }
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        finalizeSale();
      }
      if (event.ctrlKey && event.shiftKey && event.key === "C") {
        clearCart();
      }
      if (event.altKey && ["1", "2", "3", "4"].includes(event.key)) {
        const methods = ["PIX", "Dinheiro", "Débito", "Crédito"];
        setPaymentMethod(methods[parseInt(event.key) - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, paymentMethod]);

  return (
    <div style={styles.wrapper}>
      <Head>
        <title>PDV - Ponto de Vendas</title>
        <meta name="description" content="Sistema de Ponto de Vendas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Sistema PDV</h1>
          <span style={styles.datetime}>
            {new Date().toLocaleDateString("pt-BR")} •{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.mainContent}>
          <section style={styles.productsSection}>
            <div style={styles.searchContainer}>
              <input
                id="searchInput"
                type="text"
                placeholder="Escaneie ou digite o SKU..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleBarcodeScan}
                style={styles.searchInput}
                disabled={isLoading}
                aria-label="Buscar produto por SKU"
              />
              {isLoading && <div style={styles.loadingIndicator}>🔄</div>}
              {errorMessage && (
                <div style={styles.errorMessage}>{errorMessage}</div>
              )}
            </div>
            <div style={styles.productListContainer}>
              {products.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🔍</span>
                  <p style={styles.emptyText}>Nenhum produto pesquisado</p>
                  <small style={styles.emptySubtext}>
                    Escaneie ou digite um SKU e pressione Enter
                  </small>
                </div>
              ) : (
                <div style={styles.productList}>
                  {products.map((product) => (
                    <div
                      key={product.sku}
                      style={styles.productCard}
                      onDoubleClick={() => addProductToCart(product)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addProductToCart(product)
                      }
                    >
                      <div style={styles.productInfo}>
                        <h3 style={styles.productName}>{product.nome}</h3>
                        <p style={styles.productSku}>SKU: {product.sku}</p>
                      </div>
                      <div style={styles.productActions}>
                        <span style={styles.productPrice}>
                          R$ {product.preco.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addProductToCart(product)}
                          style={styles.addButton}
                          aria-label="Adicionar produto ao carrinho"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section style={styles.cartSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Carrinho ({cart.length} {cart.length === 1 ? "item" : "itens"})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  style={styles.clearButton}
                  aria-label="Limpar carrinho"
                >
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
                    Adicione produtos para começar
                  </small>
                </div>
              ) : (
                <div style={styles.cartList}>
                  {cart.map((item) => (
                    <div
                      key={item.sku}
                      style={{
                        ...styles.cartItem,
                        ...(item.sku === highlightedProductId &&
                          styles.highlightedCartItem),
                      }}
                    >
                      <div style={styles.cartItemInfo}>
                        <h4 style={styles.cartItemName}>{item.nome}</h4>
                        <p style={styles.cartItemUnit}>
                          R$ {item.preco.toFixed(2)} / unidade
                        </p>
                      </div>
                      <div style={styles.cartItemControls}>
                        <div style={styles.quantityControls}>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(
                                item.sku,
                                item.quantidade - 1
                              )
                            }
                            style={styles.quantityButton}
                            disabled={item.quantidade <= 1}
                            aria-label="Diminuir quantidade"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) =>
                              updateCartItemQuantity(
                                item.sku,
                                parseInt(e.target.value) || 1
                              )
                            }
                            style={styles.quantityInput}
                            aria-label="Quantidade"
                          />
                          <button
                            onClick={() =>
                              updateCartItemQuantity(
                                item.sku,
                                item.quantidade + 1
                              )
                            }
                            style={styles.quantityButton}
                            aria-label="Aumentar quantidade"
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
                            aria-label="Remover item do carrinho"
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
            {cart.length > 0 && (
              <div style={styles.checkoutSection}>
                <div style={styles.totalContainer}>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total:</span>
                    <span style={styles.finalTotal}>R$ {total.toFixed(2)}</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Pagamento:</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.paymentSelect}
                      aria-label="Selecionar forma de pagamento"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Débito">Débito</option>
                      <option value="Crédito">Crédito</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={finalizeSale}
                  style={styles.checkoutButton}
                  disabled={isLoading}
                  aria-label="Finalizar venda"
                >
                  {isLoading ? "🔄 Processando..." : "✓ Finalizar Venda"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#F5F7FA",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    fontSize: "16px",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E5E7EB",
    padding: "0.75rem 0",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 100,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1F2A44",
    margin: 0,
  },
  datetime: {
    color: "#6B7280",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "4.5rem 1.5rem 1.5rem",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "65% 35%",
    gap: "1.5rem",
    alignItems: "start",
  },
  productsSection: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  cartSection: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    position: "fixed",
    right: "1.5rem",
    width: "calc(35% - 3rem)",
    maxHeight: "calc(100vh - 6rem)",
    display: "flex",
    flexDirection: "column",
  },
  searchContainer: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #E5E7EB",
    position: "relative",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    fontSize: "1rem",
    color: "#1F2A44",
    backgroundColor: "#ffffff",
    outline: "none",
    height: "48px",
  },
  loadingIndicator: {
    position: "absolute",
    right: "2rem",
    top: "1.75rem",
    color: "#22C55E",
    fontSize: "1.25rem",
  },
  errorMessage: {
    marginTop: "0.5rem",
    color: "#EF4444",
    fontSize: "0.875rem",
    backgroundColor: "#FEE2E2",
    padding: "0.5rem",
    borderRadius: "4px",
  },
  productListContainer: {
    minHeight: "400px",
    padding: "1rem 1.5rem",
  },
  productList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
  },
  productCard: {
    padding: "1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "6px",
    backgroundColor: "#F9FAFB",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  productInfo: {
    marginBottom: "0.5rem",
  },
  productName: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1F2A44",
  },
  productSku: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#6B7280",
  },
  productActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  productPrice: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#22C55E",
  },
  addButton: {
    backgroundColor: "#22C55E",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    height: "48px",
    width: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #E5E7EB",
    backgroundColor: "#F9FAFB",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1F2A44",
  },
  clearButton: {
    background: "none",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    color: "#EF4444",
    cursor: "pointer",
    fontWeight: 500,
  },
  cartContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem 1.5rem",
  },
  cartList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cartItem: {
    padding: "1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "6px",
    backgroundColor: "#F9FAFB",
  },
  highlightedCartItem: {
    border: "2px solid #22C55E",
    backgroundColor: "#D1FAE5",
  },
  cartItemInfo: {
    marginBottom: "0.5rem",
  },
  cartItemName: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1F2A44",
  },
  cartItemUnit: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#6B7280",
  },
  cartItemControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  quantityButton: {
    width: "48px",
    height: "48px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#1F2A44",
    cursor: "pointer",
    fontSize: "1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityInput: {
    width: "60px",
    height: "48px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "1rem",
    color: "#1F2A44",
    backgroundColor: "#ffffff",
  },
  cartItemPricing: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  cartItemTotal: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#22C55E",
  },
  removeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.25rem",
    color: "#EF4444",
  },
  checkoutSection: {
    borderTop: "1px solid #E5E7EB",
    padding: "1rem 1.5rem",
    backgroundColor: "#F9FAFB",
    position: "sticky",
    bottom: 0,
  },
  totalContainer: {
    marginBottom: "1rem",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  totalLabel: {
    fontSize: "0.875rem",
    color: "#6B7280",
    fontWeight: 500,
  },
  finalTotal: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1F2A44",
  },
  paymentSelect: {
    padding: "0.5rem",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    fontSize: "1rem",
    color: "#1F2A44",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    height: "40px",
  },
  checkoutButton: {
    width: "100%",
    backgroundColor: "#22C55E",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "1rem",
    fontSize: "1.125rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  emptyState: {
    padding: "2rem",
    textAlign: "center",
    color: "#6B7280",
  },
  emptyIcon: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "0.5rem",
  },
  emptyText: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 500,
    color: "#1F2A44",
  },
  emptySubtext: {
    fontSize: "0.875rem",
    color: "#6B7280",
  },
};

export default PDVPage;
