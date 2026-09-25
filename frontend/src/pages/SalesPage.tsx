import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Eye,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  createSale,
  getSales,
  type Sale,
  type CreateSaleItem,
} from "../services/sales.service";
import {
  getProducts,
  type Product,
} from "../services/product.service";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getItemCount = (sale: Sale): number => {
  return sale.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
};

interface CartItem {
  product: Product;
  quantity: number;
}

function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] =
    useState<Sale | null>(null);

  const [isNewSaleOpen, setIsNewSaleOpen] =
    useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] =
    useState("");
  const [quantity, setQuantity] = useState("1");

  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [saleError, setSaleError] = useState("");

  const loadSales = async (): Promise<void> => {
    const data = await getSales();
    setSales(data);
  };

  const loadProducts = async (): Promise<void> => {
    try {
      setIsProductsLoading(true);

      const data = await getProducts();

      setProducts(data);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");

        await Promise.all([
          loadSales(),
          loadProducts(),
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load sales"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sales;
    }

    return sales.filter((sale) => {
      const seller =
        `${sale.user.firstName} ${sale.user.lastName}`.toLowerCase();

      return (
        sale.reference.toLowerCase().includes(query) ||
        sale.user.username.toLowerCase().includes(query) ||
        seller.includes(query) ||
        sale.items.some(
          (item) =>
            item.product.name
              .toLowerCase()
              .includes(query) ||
            item.product.sku
              .toLowerCase()
              .includes(query)
        )
      );
    });
  }, [sales, search]);

  const totalRevenue = useMemo(() => {
    return sales.reduce(
      (total, sale) => total + sale.totalAmount,
      0
    );
  }, [sales]);

  const totalItemsSold = useMemo(() => {
    return sales.reduce(
      (total, sale) => total + getItemCount(sale),
      0
    );
  }, [sales]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        item.product.sellingPrice * item.quantity,
      0
    );
  }, [cart]);

  const selectedProduct = products.find(
    (product) =>
      product.id === Number(selectedProductId)
  );

  const openNewSale = (): void => {
    setSaleError("");
    setSelectedProductId("");
    setQuantity("1");
    setCart([]);
    setIsNewSaleOpen(true);
  };

  const closeNewSale = (): void => {
    if (isSubmitting) {
      return;
    }

    setIsNewSaleOpen(false);
    setSaleError("");
    setSelectedProductId("");
    setQuantity("1");
    setCart([]);
  };

  const addToCart = (): void => {
    setSaleError("");

    if (!selectedProduct) {
      setSaleError("Please select a product.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setSaleError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    const existingItem = cart.find(
      (item) =>
        item.product.id === selectedProduct.id
    );

    const existingQuantity =
      existingItem?.quantity ?? 0;

    const newQuantity =
      existingQuantity + parsedQuantity;

    if (newQuantity > selectedProduct.quantity) {
      setSaleError(
        `Only ${selectedProduct.quantity} ${selectedProduct.unit.toLowerCase()} available for ${selectedProduct.name}.`
      );
      return;
    }

    if (existingItem) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product.id === selectedProduct.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        )
      );
    } else {
      setCart((currentCart) => [
        ...currentCart,
        {
          product: selectedProduct,
          quantity: parsedQuantity,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity("1");
  };

  const updateCartQuantity = (
    productId: number,
    newQuantity: number
  ): void => {
    const item = cart.find(
      (cartItem) =>
        cartItem.product.id === productId
    );

    if (!item) {
      return;
    }

    if (newQuantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter(
          (cartItem) =>
            cartItem.product.id !== productId
        )
      );
      return;
    }

    if (newQuantity > item.product.quantity) {
      setSaleError(
        `Only ${item.product.quantity} ${item.product.unit.toLowerCase()} available for ${item.product.name}.`
      );
      return;
    }

    setSaleError("");

    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.product.id === productId
          ? {
              ...cartItem,
              quantity: newQuantity,
            }
          : cartItem
      )
    );
  };

  const removeFromCart = (productId: number): void => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );

    setSaleError("");
  };

  const submitSale = async (): Promise<void> => {
    if (cart.length === 0) {
      setSaleError(
        "Add at least one product to the sale."
      );
      return;
    }

    const items: CreateSaleItem[] = cart.map(
      (item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })
    );

    try {
      setIsSubmitting(true);
      setSaleError("");

      const newSale = await createSale({
        items,
      });

      await Promise.all([
        loadSales(),
        loadProducts(),
      ]);

      setIsNewSaleOpen(false);
      setCart([]);
      setSelectedProductId("");
      setQuantity("1");

      setSelectedSale(newSale);
    } catch (err) {
      setSaleError(
        err instanceof Error
          ? err.message
          : "Unable to complete sale"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="module-loading">
        <div className="loading-spinner" />
        <p>Loading sales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-error">
        <AlertTriangle size={20} />

        <div>
          <strong>Unable to load sales</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="module-header">
        <div>
          <p className="section-label">SALES</p>

          <h3>Sales</h3>

          <p>
            View and manage completed sales transactions.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openNewSale}
        >
          <ShoppingCart size={16} />
          New Sale
        </button>
      </div>

      <div className="category-summary-grid">
        <div className="category-summary-card">
          <div className="category-summary-icon">
            <Receipt size={19} />
          </div>

          <div>
            <span>Total Sales</span>
            <strong>{sales.length}</strong>
          </div>
        </div>

        <div className="category-summary-card">
          <div className="category-summary-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Items Sold</span>
            <strong>{totalItemsSold}</strong>
          </div>
        </div>

        <div className="category-summary-card">
          <div className="category-summary-icon">
            <ShoppingCart size={19} />
          </div>

          <div>
            <span>Total Revenue</span>
            <strong>
              {formatCurrency(totalRevenue)}
            </strong>
          </div>
        </div>
      </div>

      <div className="categories-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search sales, products, or cashier..."
          />
        </div>

        <span className="category-count">
          {filteredSales.length}{" "}
          {filteredSales.length === 1
            ? "transaction"
            : "transactions"}
        </span>
      </div>

      {filteredSales.length === 0 ? (
        <div className="module-empty">
          <Receipt size={34} />

          <h4>No sales found</h4>

          <p>
            Try changing your search or record a new sale.
          </p>
        </div>
      ) : (
        <div className="categories-table-card">
          <div className="categories-table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Sold By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <div className="category-name-cell">
                        <div className="category-icon">
                          <Receipt size={16} />
                        </div>

                        <div>
                          <strong>
                            {sale.reference}
                          </strong>

                          <span>
                            Sale #{sale.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {getItemCount(sale)}
                      </strong>{" "}
                      {getItemCount(sale) === 1
                        ? "item"
                        : "items"}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          sale.totalAmount
                        )}
                      </strong>
                    </td>

                    <td>
                      <div className="category-name-cell">
                        <div className="category-icon">
                          <User size={15} />
                        </div>

                        <div>
                          <strong>
                            {sale.user.firstName}{" "}
                            {sale.user.lastName}
                          </strong>

                          <span>
                            {sale.user.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {formatDate(sale.createdAt)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="table-action-button"
                        onClick={() =>
                          setSelectedSale(sale)
                        }
                      >
                        <Eye size={14} />
                        View
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSale && (
        <div className="modal-overlay">
          <div className="category-modal">
            <div className="modal-header">
              <div>
                <p className="section-label">
                  SALE DETAILS
                </p>

                <h3>
                  {selectedSale.reference}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() =>
                  setSelectedSale(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Sale Date</label>

                <strong>
                  {formatDate(
                    selectedSale.createdAt
                  )}
                </strong>
              </div>

              <div className="form-group">
                <label>Sold By</label>

                <strong>
                  {selectedSale.user.firstName}{" "}
                  {selectedSale.user.lastName}
                </strong>
              </div>

              <div className="form-group">
                <label>Total Items</label>

                <strong>
                  {getItemCount(selectedSale)}
                </strong>
              </div>

              <div className="form-group">
                <label>Total Amount</label>

                <strong>
                  {formatCurrency(
                    selectedSale.totalAmount
                  )}
                </strong>
              </div>
            </div>

            <div className="categories-table-card">
              <div className="categories-table-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedSale.items.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="category-name-cell">
                              <div className="category-icon">
                                <ShoppingCart
                                  size={15}
                                />
                              </div>

                              <div>
                                <strong>
                                  {item.product.name}
                                </strong>

                                <span>
                                  {item.product.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>{item.quantity}</td>

                          <td>
                            {formatCurrency(
                              item.unitPrice
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                item.subtotal
                              )}
                            </strong>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              <strong>
                Total:{" "}
                {formatCurrency(
                  selectedSale.totalAmount
                )}
              </strong>
            </div>
          </div>
        </div>
      )}

      {isNewSaleOpen && (
        <div className="modal-overlay">
          <div className="category-modal">
            <div className="modal-header">
              <div>
                <p className="section-label">
                  NEW SALE
                </p>

                <h3>Create Sale</h3>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeNewSale}
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            {saleError && (
              <div className="login-error">
                {saleError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="sale-product">
                  Product
                </label>

                <select
                  id="sale-product"
                  value={selectedProductId}
                  onChange={(event) => {
                    setSelectedProductId(
                      event.target.value
                    );
                    setSaleError("");
                  }}
                  disabled={
                    isProductsLoading || isSubmitting
                  }
                >
                  <option value="">
                    {isProductsLoading
                      ? "Loading products..."
                      : "Select a product"}
                  </option>

                  {products.map((product) => {
                    const cartItem = cart.find(
                      (item) =>
                        item.product.id ===
                        product.id
                    );

                    const remainingStock =
                      product.quantity -
                      (cartItem?.quantity ?? 0);

                    return (
                      <option
                        key={product.id}
                        value={product.id}
                        disabled={
                          remainingStock <= 0
                        }
                      >
                        {product.name} —{" "}
                        {formatCurrency(
                          product.sellingPrice
                        )}{" "}
                        — {remainingStock}{" "}
                        {product.unit}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sale-quantity">
                  Quantity
                </label>

                <input
                  id="sale-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {selectedProduct && (
              <div className="module-empty">
                <Package size={25} />

                <h4>
                  {selectedProduct.name}
                </h4>

                <p>
                  SKU: {selectedProduct.sku} ·{" "}
                  {selectedProduct.quantity}{" "}
                  {selectedProduct.unit} available ·{" "}
                  {formatCurrency(
                    selectedProduct.sellingPrice
                  )}{" "}
                  per {selectedProduct.unit}
                </p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={addToCart}
                disabled={
                  !selectedProduct || isSubmitting
                }
              >
                <Plus size={16} />
                Add to Sale
              </button>
            </div>

            {cart.length > 0 && (
              <div className="categories-table-card">
                <div className="categories-table-wrapper">
                  <table className="categories-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product.id}>
                          <td>
                            <div className="category-name-cell">
                              <div className="category-icon">
                                <ShoppingCart
                                  size={15}
                                />
                              </div>

                              <div>
                                <strong>
                                  {item.product.name}
                                </strong>

                                <span>
                                  {item.product.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <input
                              type="number"
                              min="1"
                              max={
                                item.product.quantity
                              }
                              value={item.quantity}
                              onChange={(event) =>
                                updateCartQuantity(
                                  item.product.id,
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                              disabled={isSubmitting}
                              style={{
                                width: "70px",
                                padding: "7px 8px",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius: "6px",
                                outline: "none",
                              }}
                            />
                          </td>

                          <td>
                            {formatCurrency(
                              item.product
                                .sellingPrice
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                item.product
                                  .sellingPrice *
                                  item.quantity
                              )}
                            </strong>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="table-icon-button"
                              onClick={() =>
                                removeFromCart(
                                  item.product.id
                                )
                              }
                              disabled={isSubmitting}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions">
                  <strong>
                    Total:{" "}
                    {formatCurrency(cartTotal)}
                  </strong>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={submitSale}
                    disabled={isSubmitting}
                  >
                    <ShoppingCart size={16} />
                    {isSubmitting
                      ? "Processing..."
                      : "Complete Sale"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesPage;