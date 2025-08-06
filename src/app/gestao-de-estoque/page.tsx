"use client";

import type { Product, ProductFormData, StockAdjustment } from "@/types";
import { categories } from "@/utils/category";
import axios from "axios";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [stockOperation, setStockOperation] = useState<"add" | "remove">("add");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
      showNotification("success", "Produtos carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setProducts([]);
      setFilteredProducts([]);
      showNotification("error", "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let currentFilteredProducts = products.filter(
      (product) =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (product.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    if (filterCategory) {
      currentFilteredProducts = currentFilteredProducts.filter(
        (product) => product.categoria === filterCategory
      );
    }

    setFilteredProducts(currentFilteredProducts);
  }, [searchTerm, filterCategory, products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setValue("nome", product.nome);
    setValue("preco", product.preco.toFixed(2));
    setValue("categoria", product.categoria);
    setValue("marca", product.marca ?? "");
    setValue("sku", product.sku);
    setValue("validade", product.validade ? product.validade.split("T")[0] : "");
    setValue("estoque", product.estoque?.toString() ?? "0");
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    reset();
    setValue("sku", uuidv4());
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreateModalOpen(false);
    setEditingProduct(null);
    setStockModalProduct(null);
    setStockQuantity(0);
    reset();
  };

  const onCreateSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      const newProduct = {
        nome: data.nome,
        preco: parseFloat(data.preco),
        categoria: data.categoria,
        marca: data.marca || null,
        sku: data.sku,
        validade: data.validade ? new Date(data.validade).toISOString() : null,
        estoque: parseInt(data.estoque) || 0,
      };

      const response = await axios.post("/api/products", newProduct);
      setProducts((prev) => [...prev, response.data.product]);
      showNotification("success", "Produto criado com sucesso!");
      closeModal();
    } catch (error) {
      showNotification("error", "Erro ao criar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      const updatedProductData = {
        ...editingProduct,
        nome: data.nome,
        preco: parseFloat(data.preco),
        categoria: data.categoria,
        marca: data.marca || null,
        sku: data.sku,
        estoque: parseInt(data.estoque),
        validade: data.validade ? new Date(data.validade).toISOString() : null,
        updatedAt: new Date().toISOString(),
      };

      await axios.put("/api/products", updatedProductData);
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.sku === editingProduct.sku ? updatedProductData : p
        )
      );
      showNotification("success", "Produto atualizado com sucesso!");
      closeModal();
    } catch (error) {
      showNotification("error", "Erro ao atualizar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto? Esta ação é irreversível.")) {
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.delete("/api/products", {
        data: { id: productId },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );
      showNotification("success", "Produto deletado com sucesso!");
    } catch (error) {
      showNotification("error", "Erro ao deletar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustStock = async () => {
    if (!stockModalProduct || stockQuantity <= 0) {
      showNotification("error", "Quantidade inválida para ajuste de estoque.");
      return;
    }

    try {
      setIsSubmitting(true);
      const stockAdjustment: StockAdjustment = {
        productId: stockModalProduct.id,
        quantity: stockQuantity,
        type: stockOperation,
      };

      await axios.patch("/api/products", stockAdjustment);

      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id === stockModalProduct.id) {
            let newStock = p.estoque ?? 0;
            if (stockOperation === "add") {
              newStock += stockQuantity;
            } else {
              newStock = Math.max(0, newStock - stockQuantity);
            }
            return {
              ...p,
              estoque: newStock,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );

      showNotification("success", `Estoque ${stockOperation === "add" ? "adicionado" : "removido"} com sucesso!`);
      closeModal();
    } catch (error) {
      showNotification("error", "Erro ao ajustar estoque. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (value: string) => {
    return categories.find((cat) => cat.value === value)?.label || value;
  };

  const ProductForm = ({ isEditing = false }: { isEditing?: boolean }) => (
    <form onSubmit={handleSubmit(isEditing ? onUpdateSubmit : onCreateSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-2">
            Nome do Produto *
          </label>
          <input
            id="nome"
            type="text"
            {...register("nome", {
              required: "Nome é obrigatório",
              minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" },
            })}
            className={`w-full px-4 py-3 rounded-md border text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
              errors.nome ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="Digite o nome do produto"
          />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-900 mb-2">
            Preço (R$) *
          </label>
          <input
            id="preco"
            type="number"
            step="0.01"
            min="0"
            {...register("preco", {
              required: "Preço é obrigatório",
              min: { value: 0.01, message: "Preço deve ser maior que zero" },
            })}
            className={`w-full px-4 py-3 rounded-md border text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
              errors.preco ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="0.00"
          />
          {errors.preco && (
            <p className="mt-1 text-sm text-red-600">{errors.preco.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="estoque" className="block text-sm font-medium text-gray-900 mb-2">
            Estoque *
          </label>
          <input
            id="estoque"
            type="number"
            min="0"
            {...register("estoque", { required: "Estoque é obrigatório" })}
            className={`w-full px-4 py-3 rounded-md border text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
              errors.estoque ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="0"
          />
          {errors.estoque && (
            <p className="mt-1 text-sm text-red-600">{errors.estoque.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-900 mb-2">
            Categoria *
          </label>
          <select
            id="categoria"
            {...register("categoria", { required: "Categoria é obrigatória" })}
            className={`w-full px-4 py-3 rounded-md border text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
              errors.categoria ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            }`}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.categoria && (
            <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="marca" className="block text-sm font-medium text-gray-900 mb-2">
            Marca
          </label>
          <input
            id="marca"
            type="text"
            {...register("marca")}
            className="w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            placeholder="Digite a marca"
          />
        </div>

        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-900 mb-2">
            SKU *
          </label>
          <input
            id="sku"
            type="text"
            {...register("sku", { required: "SKU é obrigatório" })}
             readOnly // Adiciona o atributo readOnly
            className={`w-full px-4 py-3 rounded-md border text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
              errors.sku ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="Digite o SKU"
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="validade" className="block text-sm font-medium text-gray-900 mb-2">
            Data de Validade
          </label>
          <input
            id="validade"
            type="date"
            {...register("validade", {
              validate: (value) =>
                !value ||
                value >= new Date().toISOString().split("T")[0] ||
                "Data de validade deve ser futura ou igual a hoje",
            })}
            className={`w-full px-4 py-3 rounded-md border text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
              errors.validade ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            }`}
          />
          {errors.validade && (
            <p className="mt-1 text-sm text-red-600">{errors.validade.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={closeModal}
          className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processando...
            </span>
          ) : isEditing ? "Atualizar Produto" : "Criar Produto"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Produtos</h1>
          <p className="mt-2 text-gray-600">Gerencie seus produtos, estoque e informações</p>
        </div>

        {/* Notificações */}
        {notification && (
          <div
            className={`mb-8 p-4 rounded-lg flex items-center space-x-3 ${
              notification.type === "success"
                ? "bg-green-100 border border-green-300 text-green-900"
                : "bg-red-100 border border-red-300 text-red-900"
            }`}
            role="alert"
          >
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Total de Produtos",
              value: products.length,
              icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>,
              bg: "bg-blue-100",
            },
            {
              title: "Em Estoque",
              value: products.filter((p) => (p.estoque ?? 0) > 0).length,
              icon: <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              bg: "bg-green-100",
            },
            {
              title: "Sem Estoque",
              value: products.filter((p) => (p.estoque ?? 0) === 0).length,
              icon: <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>,
              bg: "bg-red-100",
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-900 mb-2">
                Buscar produtos
              </label>
              <input
                id="searchTerm"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                placeholder="Digite o nome, SKU ou marca..."
              />
            </div>

            <div>
              <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-900 mb-2">
                Categoria
              </label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-3">
              <button
                onClick={fetchProducts}
                className="flex-1 px-4 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Atualizando...
                  </span>
                ) : (
                  "Atualizar"
                )}
              </button>
              <button
                onClick={openCreateModal}
                className="flex-1 px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                Novo Produto
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Produto", "Marca", "Categoria", "Preço", "Estoque", "SKU", "Validade", "Ações"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="ml-3 text-gray-600">Carregando produtos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.nome}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.marca || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-900 rounded-full">
                          {getCategoryName(product.categoria)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        R$ {product.preco.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            (product.estoque ?? 0) === 0
                              ? "bg-red-100 text-red-900"
                              : (product.estoque ?? 0) < 10
                              ? "bg-yellow-100 text-yellow-900"
                              : "bg-green-100 text-green-900"
                          }`}
                        >
                          {product.estoque ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.validade
                          ? new Date(product.validade).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar produto"
                            aria-label={`Editar produto ${product.nome}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setStockModalProduct(product)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Ajustar estoque"
                            aria-label={`Ajustar estoque do produto ${product.nome}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => product.id && deleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Deletar produto"
                            aria-label={`Deletar produto ${product.nome}`}
                            disabled={isSubmitting}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Edição */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-modal-title"
          >
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="edit-product-modal-title" className="text-xl font-bold text-gray-900">
                    Editar Produto
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
                    aria-label="Fechar modal de edição"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ProductForm isEditing={true} />
              </div>
            </div>
          </div>
        )}

        {/* Modal de Criação */}
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-modal-title"
          >
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="create-product-modal-title" className="text-xl font-bold text-gray-900">
                    Criar Novo Produto
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
                    aria-label="Fechar modal de criação"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ProductForm isEditing={false} />
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ajuste de Estoque */}
        {stockModalProduct && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
          >
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 id="stock-modal-title" className="text-xl font-bold text-gray-900">
                  Ajustar Estoque: {stockModalProduct.nome}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
                  aria-label="Fechar modal de ajuste de estoque"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="stock-quantity" className="block text-sm font-medium text-gray-900 mb-2">
                    Quantidade
                  </label>
                  <input
                    id="stock-quantity"
                    type="number"
                    min="1"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    aria-label="Quantidade para ajuste de estoque"
                  />
                </div>
                <div>
                  <label htmlFor="stock-operation" className="block text-sm font-medium text-gray-900 mb-2">
                    Operação
                  </label>
                  <select
                    id="stock-operation"
                    value={stockOperation}
                    onChange={(e) => setStockOperation(e.target.value as "add" | "remove")}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    aria-label="Tipo de operação de estoque"
                  >
                    <option value="add">Adicionar</option>
                    <option value="remove">Remover</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={adjustStock}
                    className="flex-1 px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processando...
                      </span>
                    ) : (
                      "Ajustar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}