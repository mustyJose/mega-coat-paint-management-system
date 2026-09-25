import {
  AlertCircle,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createProduct,
  getProductById,
  getProducts,
  type CreateProductData,
  type Product,
} from "../services/product.service";
import {
  getCategories,
  type Category,
} from "../services/category.service";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ProductFormState {
  name: string;
  sku: string;
  brand: string;
  unit: string;
  categoryId: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
  reorderLevel: string;
}

const initialFormState: ProductFormState = {
  name: "",
  sku: "",
  brand: "",
  unit: "",
  categoryId: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "0",
  reorderLevel: "5",
};

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [viewError, setViewError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductFormState>(initialFormState);

  const loadProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (productError) {
      setError(
        productError instanceof Error
          ? productError.message
          : "Unable to load products."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async (): Promise<void> => {
    try {
      const data = await getCategories();

      setCategories(data.filter((category) => category.isActive));
    } catch (categoryError) {
      setError(
        categoryError instanceof Error
          ? categoryError.message
          : "Unable to load categories."
      );
    }
  };

  useEffect(() => {
    void Promise.all([loadProducts(), loadCategories()]);
  }, []);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        (product.brand ?? "").toLowerCase().includes(search) ||
        product.category.name.toLowerCase().includes(search)
      );
    });
  }, [products, searchTerm]);

  const openAddModal = (): void => {
    setForm(initialFormState);
    setFormError("");
    setIsAddModalOpen(true);
  };

  const closeAddModal = (): void => {
    if (isSubmitting) {
      return;
    }

    setIsAddModalOpen(false);
    setFormError("");
  };

  const openViewModal = async (productId: number): Promise<void> => {
    try {
      setIsViewing(true);
      setViewError("");
      setSelectedProduct(null);
      setIsViewModalOpen(true);

      const product = await getProductById(productId);

      setSelectedProduct(product);
    } catch (viewProductError) {
      setViewError(
        viewProductError instanceof Error
          ? viewProductError.message
          : "Unable to load product details."
      );
    } finally {
      setIsViewing(false);
    }
  };

  const closeViewModal = (): void => {
    if (isViewing) {
      return;
    }

    setIsViewModalOpen(false);
    setSelectedProduct(null);
    setViewError("");
  };

  const handleFormChange = (
    field: keyof ProductFormState,
    value: string
  ): void => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreateProduct = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setFormError("");

    const name = form.name.trim();
    const sku = form.sku.trim();
    const brand = form.brand.trim();
    const unit = form.unit.trim();

    const categoryId = Number(form.categoryId);
    const costPrice = Number(form.costPrice);
    const sellingPrice = Number(form.sellingPrice);
    const quantity = Number(form.quantity);
    const reorderLevel = Number(form.reorderLevel);

    if (!name) {
      setFormError("Product name is required.");
      return;
    }

    if (!sku) {
      setFormError("SKU is required.");
      return;
    }

    if (!unit) {
      setFormError("Unit is required.");
      return;
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      setFormError("Please select a valid category.");
      return;
    }

    if (!Number.isFinite(costPrice) || costPrice <= 0) {
      setFormError("Cost price must be greater than 0.");
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      setFormError("Selling price must be greater than 0.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      setFormError(
        "Opening quantity must be a whole number of 0 or greater."
      );
      return;
    }

    if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
      setFormError(
        "Reorder level must be a whole number of 0 or greater."
      );
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === categoryId
    );

    if (!selectedCategory) {
      setFormError("Please select an active category.");
      return;
    }

    const productData: CreateProductData = {
      name,
      sku,
      unit,
      costPrice,
      sellingPrice,
      quantity,
      reorderLevel,
      categoryId,
    };

    if (brand) {
      productData.brand = brand;
    }

    try {
      setIsSubmitting(true);

      await createProduct(productData);

      await loadProducts();

      setIsAddModalOpen(false);
      setForm(initialFormState);
      setFormError("");
    } catch (createError) {
      setFormError(
        createError instanceof Error
          ? createError.message
          : "Unable to create product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="products-page">
      <div className="module-header">
        <div>
          <p className="section-label">PRODUCT MANAGEMENT</p>
          <h3>Products</h3>
          <p>Manage your paint and chemical products.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search products, SKU, brand..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="product-count">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </div>
      </div>

      {isLoading && (
        <div className="module-loading">
          <div className="loading-spinner" />
          <p>Loading products...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="module-error">
          <AlertCircle size={20} />

          <div>
            <strong>Unable to load products</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!isLoading &&
        !error &&
        filteredProducts.length === 0 && (
          <div className="module-empty">
            <Package size={32} />

            <h4>
              {searchTerm
                ? "No products found"
                : "No products available"}
            </h4>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Add your first product to get started."}
            </p>
          </div>
        )}

      {!isLoading &&
        !error &&
        filteredProducts.length > 0 && (
          <div className="products-table-card">
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Cost Price</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const isLowStock =
                      product.quantity > 0 &&
                      product.quantity <= product.reorderLevel;

                    const isOutOfStock =
                      product.quantity === 0;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="product-name-cell">
                            <div className="product-icon">
                              <Package size={17} />
                            </div>

                            <div>
                              <strong>{product.name}</strong>

                              {product.brand && (
                                <span>{product.brand}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="sku-text">
                            {product.sku}
                          </span>
                        </td>

                        <td>{product.category.name}</td>

                        <td>{product.unit}</td>

                        <td>
                          {formatCurrency(product.costPrice)}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(product.sellingPrice)}
                          </strong>
                        </td>

                        <td>
                          <div className="stock-cell">
                            <strong
                              className={
                                isOutOfStock
                                  ? "stock-danger"
                                  : isLowStock
                                    ? "stock-warning"
                                    : ""
                              }
                            >
                              {product.quantity}
                            </strong>

                            <span>
                              Reorder: {product.reorderLevel}
                            </span>
                          </div>
                        </td>

                        <td>
                          {isOutOfStock ? (
                            <span className="status-badge status-danger">
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span className="status-badge status-warning">
                              Low stock
                            </span>
                          ) : product.isActive ? (
                            <span className="status-badge status-success">
                              Active
                            </span>
                          ) : (
                            <span className="status-badge status-neutral">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() =>
                              void openViewModal(product.id)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
          >
            <div className="modal-header">
              <div>
                <p className="section-label">PRODUCT MANAGEMENT</p>
                <h3 id="add-product-title">Add Product</h3>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleCreateProduct}
            >
              {formError && (
                <div className="form-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="product-name">
                    Product Name
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleFormChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Weathershield"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-sku">SKU</label>

                  <input
                    id="product-sku"
                    type="text"
                    value={form.sku}
                    onChange={(event) =>
                      handleFormChange(
                        "sku",
                        event.target.value
                      )
                    }
                    placeholder="e.g. DUL-WEA-20L"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-brand">
                    Brand
                  </label>

                  <input
                    id="product-brand"
                    type="text"
                    value={form.brand}
                    onChange={(event) =>
                      handleFormChange(
                        "brand",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Dulux"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-unit">Unit</label>

                  <input
                    id="product-unit"
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      handleFormChange(
                        "unit",
                        event.target.value
                      )
                    }
                    placeholder="e.g. 20L"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-category">
                    Category
                  </label>

                  <select
                    id="product-category"
                    value={form.categoryId}
                    onChange={(event) =>
                      handleFormChange(
                        "categoryId",
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="product-cost-price">
                    Cost Price
                  </label>

                  <input
                    id="product-cost-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(event) =>
                      handleFormChange(
                        "costPrice",
                        event.target.value
                      )
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-selling-price">
                    Selling Price
                  </label>

                  <input
                    id="product-selling-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(event) =>
                      handleFormChange(
                        "sellingPrice",
                        event.target.value
                      )
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-quantity">
                    Opening Quantity
                  </label>

                  <input
                    id="product-quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      handleFormChange(
                        "quantity",
                        event.target.value
                      )
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-reorder-level">
                    Reorder Level
                  </label>

                  <input
                    id="product-reorder-level"
                    type="number"
                    min="0"
                    step="1"
                    value={form.reorderLevel}
                    onChange={(event) =>
                      handleFormChange(
                        "reorderLevel",
                        event.target.value
                      )
                    }
                    placeholder="5"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating..."
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewModal();
            }
          }}
        >
          <div
            className="product-modal product-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-product-title"
          >
            <div className="modal-header">
              <div>
                <p className="section-label">PRODUCT DETAILS</p>
                <h3 id="view-product-title">
                  {selectedProduct?.name ?? "Product Details"}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeViewModal}
                disabled={isViewing}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {isViewing && (
              <div className="module-loading">
                <div className="loading-spinner" />
                <p>Loading product details...</p>
              </div>
            )}

            {!isViewing && viewError && (
              <div className="module-error">
                <AlertCircle size={20} />

                <div>
                  <strong>Unable to load product</strong>
                  <p>{viewError}</p>
                </div>
              </div>
            )}

            {!isViewing &&
              !viewError &&
              selectedProduct && (
                <div className="product-details">
                  <div className="product-details-header">
                    <div className="product-details-icon">
                      <Package size={24} />
                    </div>

                    <div>
                      <h4>{selectedProduct.name}</h4>

                      {selectedProduct.brand && (
                        <p>{selectedProduct.brand}</p>
                      )}
                    </div>
                  </div>

                  <div className="product-details-grid">
                    <div className="product-detail-item">
                      <span>SKU</span>
                      <strong>{selectedProduct.sku}</strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Category</span>
                      <strong>
                        {selectedProduct.category.name}
                      </strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Unit</span>
                      <strong>{selectedProduct.unit}</strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Current Stock</span>
                      <strong>
                        {selectedProduct.quantity}
                      </strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Reorder Level</span>
                      <strong>
                        {selectedProduct.reorderLevel}
                      </strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Cost Price</span>
                      <strong>
                        {formatCurrency(
                          selectedProduct.costPrice
                        )}
                      </strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Selling Price</span>
                      <strong>
                        {formatCurrency(
                          selectedProduct.sellingPrice
                        )}
                      </strong>
                    </div>

                    <div className="product-detail-item">
                      <span>Status</span>
                      <strong>
                        {selectedProduct.isActive
                          ? "Active"
                          : "Inactive"}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={closeViewModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductsPage;