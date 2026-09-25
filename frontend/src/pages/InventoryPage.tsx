import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardList,
  Package,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  createStockAdjustment,
  getStockMovements,
  type StockMovement,
  type StockMovementType,
} from "../services/inventory.service";
import {
  getProducts,
  type Product,
} from "../services/product.service";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/currency";

type InventoryAction =
  | "receive"
  | "adjustment"
  | "damage"
  | "return";

type AdjustmentDirection = "IN" | "OUT";

interface FormState {
  productId: string;
  quantity: string;
  reference: string;
  note: string;
  adjustmentDirection: AdjustmentDirection;
}

const initialFormState: FormState = {
  productId: "",
  quantity: "",
  reference: "",
  note: "",
  adjustmentDirection: "IN",
};

const movementLabels: Record<StockMovementType, string> = {
  PURCHASE: "Purchase",
  SALE: "Sale",
  ADJUSTMENT_IN: "Adjustment In",
  ADJUSTMENT_OUT: "Adjustment Out",
  DAMAGE: "Damage",
  RETURN: "Return",
};

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getMovementClass = (
  type: StockMovementType
): string => {
  switch (type) {
    case "PURCHASE":
      return "movement-badge movement-purchase";

    case "SALE":
      return "movement-badge movement-sale";

    case "ADJUSTMENT_IN":
      return "movement-badge movement-adjustment-in";

    case "ADJUSTMENT_OUT":
      return "movement-badge movement-adjustment-out";

    case "DAMAGE":
      return "movement-badge movement-damage";

    case "RETURN":
      return "movement-badge movement-return";

    default:
      return "movement-badge";
  }
};

const getHistoryIconClass = (
  type: StockMovementType
): string => {
  switch (type) {
    case "SALE":
      return "history-icon-sale";

    case "DAMAGE":
    case "ADJUSTMENT_OUT":
      return "history-icon-out";

    case "PURCHASE":
    case "RETURN":
    case "ADJUSTMENT_IN":
      return "history-icon-in";

    default:
      return "history-icon-out";
  }
};

const isStockInMovement = (
  type: StockMovementType
): boolean => {
  return (
    type === "PURCHASE" ||
    type === "RETURN" ||
    type === "ADJUSTMENT_IN"
  );
};

const getStockStatus = (
  product: Product
): {
  label: string;
  className: string;
} => {
  if (product.quantity === 0) {
    return {
      label: "Out of stock",
      className: "stock-status stock-status-out",
    };
  }

  if (product.quantity <= product.reorderLevel) {
    return {
      label: "Low stock",
      className: "stock-status stock-status-low",
    };
  }

  return {
    label: "In stock",
    className: "stock-status stock-status-good",
  };
};

function InventoryPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<
    StockMovement[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [movementFilter, setMovementFilter] =
    useState<"ALL" | StockMovementType>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [action, setAction] =
    useState<InventoryAction>("receive");

  const [form, setForm] =
    useState<FormState>(initialFormState);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [
    selectedProductMovements,
    setSelectedProductMovements,
  ] = useState<StockMovement[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] =
    useState(false);

  const [isHistoryLoading, setIsHistoryLoading] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  const isAdmin = user?.role === "ADMIN";

  const loadInventory = async (): Promise<void> => {
    try {
      setError("");

      const [productData, movementData] =
        await Promise.all([
          getProducts(),
          getStockMovements(),
        ]);

      setProducts(productData);
      setMovements(movementData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load inventory"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.isActive
      ),
    [products]
  );

  const totalStockQuantity = useMemo(
    () =>
      activeProducts.reduce(
        (total, product) =>
          total + product.quantity,
        0
      ),
    [activeProducts]
  );

  const lowStockCount = useMemo(
    () =>
      activeProducts.filter(
        (product) =>
          product.quantity > 0 &&
          product.quantity <=
            product.reorderLevel
      ).length,
    [activeProducts]
  );

  const outOfStockCount = useMemo(
    () =>
      activeProducts.filter(
        (product) => product.quantity === 0
      ).length,
    [activeProducts]
  );

  const filteredProducts = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return activeProducts;
    }

    return activeProducts.filter((product) => {
      return (
        product.name
          .toLowerCase()
          .includes(search) ||
        product.sku
          .toLowerCase()
          .includes(search) ||
        (product.brand ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [activeProducts, searchTerm]);

  const filteredMovements = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return movements.filter((movement) => {
      const matchesType =
        movementFilter === "ALL" ||
        movement.type === movementFilter;

      if (!matchesType) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        movement.product.name
          .toLowerCase()
          .includes(search) ||
        movement.product.sku
          .toLowerCase()
          .includes(search) ||
        movement.reference
          ?.toLowerCase()
          .includes(search) ||
        movement.note
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [
    movements,
    movementFilter,
    searchTerm,
  ]);

  const openActionModal = (
    selectedAction: InventoryAction
  ): void => {
    setAction(selectedAction);
    setForm(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  const closeActionModal = (): void => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setForm(initialFormState);
    setFormError("");
  };

  const updateForm = (
    field: keyof FormState,
    value: string
  ): void => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const getModalTitle = (): string => {
    switch (action) {
      case "receive":
        return "Receive Stock";

      case "adjustment":
        return "Stock Adjustment";

      case "damage":
        return "Record Damage";

      case "return":
        return "Record Return";

      default:
        return "Inventory Action";
    }
  };

  const getMovementTypeForAction =
    (): Exclude<StockMovementType, "SALE"> => {
      switch (action) {
        case "receive":
          return "PURCHASE";

        case "adjustment":
          return form.adjustmentDirection === "IN"
            ? "ADJUSTMENT_IN"
            : "ADJUSTMENT_OUT";

        case "damage":
          return "DAMAGE";

        case "return":
          return "RETURN";

        default:
          return "ADJUSTMENT_IN";
      }
    };

  const selectedFormProduct = useMemo(() => {
    const productId = Number(form.productId);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return null;
    }

    return (
      activeProducts.find(
        (product) => product.id === productId
      ) ?? null
    );
  }, [activeProducts, form.productId]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const productId = Number(form.productId);
    const quantity = Number(form.quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      setFormError("Please select a product.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setFormError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    const product = activeProducts.find(
      (item) => item.id === productId
    );

    if (!product) {
      setFormError(
        "Selected product was not found."
      );
      return;
    }

    const movementType =
      getMovementTypeForAction();

    const removesStock =
      movementType === "ADJUSTMENT_OUT" ||
      movementType === "DAMAGE";

    if (
      removesStock &&
      quantity > product.quantity
    ) {
      setFormError(
        `Insufficient stock. Current stock is ${product.quantity} ${product.unit}.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      await createStockAdjustment({
        productId,
        quantity,
        type: movementType,
        reference:
          form.reference.trim() || undefined,
        note: form.note.trim() || undefined,
      });

      await loadInventory();

      setIsModalOpen(false);
      setForm(initialFormState);
      setFormError("");
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to update inventory"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHistory = (
    product: Product
  ): void => {
    setSelectedProduct(product);
    setSelectedProductMovements([]);
    setHistoryError("");
    setIsHistoryLoading(true);
    setIsHistoryOpen(true);

    const productMovements =
      movements
        .filter(
          (movement) =>
            movement.productId === product.id
        )
        .sort(
          (first, second) =>
            new Date(
              second.createdAt
            ).getTime() -
            new Date(
              first.createdAt
            ).getTime()
        );

    setSelectedProductMovements(
      productMovements
    );

    setIsHistoryLoading(false);
  };

  const closeHistory = (): void => {
    setIsHistoryOpen(false);
    setSelectedProduct(null);
    setSelectedProductMovements([]);
    setHistoryError("");
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>
            Monitor stock levels and track every
            inventory movement.
          </p>
        </div>

        {isAdmin && (
          <div className="inventory-header-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                openActionModal("damage")
              }
            >
              <AlertTriangle size={17} />
              Record Damage
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                openActionModal("return")
              }
            >
              <RotateCcw size={17} />
              Record Return
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                openActionModal("adjustment")
              }
            >
              <ClipboardList size={17} />
              Adjustment
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                openActionModal("receive")
              }
            >
              <Plus size={17} />
              Receive Stock
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="page-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="inventory-summary-grid">
        <div className="inventory-summary-card">
          <div className="inventory-summary-icon inventory-icon-products">
            <Package size={21} />
          </div>

          <div>
            <span>Total Products</span>
            <strong>
              {activeProducts.length}
            </strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon inventory-icon-stock">
            <Boxes size={21} />
          </div>

          <div>
            <span>Total Units</span>
            <strong>
              {totalStockQuantity}
            </strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon inventory-icon-low">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStockCount}</strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon inventory-icon-out">
            <ArrowDownToLine size={21} />
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{outOfStockCount}</strong>
          </div>
        </div>
      </div>

      <section className="inventory-section">
        <div className="section-header">
          <div>
            <h2>Stock Overview</h2>
            <p>
              Current quantities across active
              products.
            </p>
          </div>

          <div className="inventory-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="inventory-table-card">
          <div className="table-scroll">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="table-empty"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(
                    (product) => {
                      const status =
                        getStockStatus(product);

                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="inventory-product-cell">
                              <div className="inventory-product-icon">
                                <Package
                                  size={17}
                                />
                              </div>

                              <div>
                                <strong>
                                  {product.name}
                                </strong>

                                {product.brand && (
                                  <span>
                                    {
                                      product.brand
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            {product.sku}
                          </td>

                          <td>
                            {product.unit}
                          </td>

                          <td>
                            {formatCurrency(
                              product.costPrice,
                              settings.currency
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              product.sellingPrice,
                              settings.currency
                            )}
                          </td>

                          <td>
                            <strong>
                              {product.quantity}
                            </strong>
                          </td>

                          <td>
                            {
                              product.reorderLevel
                            }
                          </td>

                          <td>
                            <span
                              className={
                                status.className
                              }
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="table-action-button"
                              onClick={() =>
                                handleViewHistory(
                                  product
                                )
                              }
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="inventory-section">
        <div className="section-header">
          <div>
            <h2>
              Stock Movement Ledger
            </h2>

            <p>
              Complete history of inventory
              movements.
            </p>
          </div>

          <div className="inventory-filter-group">
            <select
              value={movementFilter}
              onChange={(event) =>
                setMovementFilter(
                  event.target.value as
                    | "ALL"
                    | StockMovementType
                )
              }
            >
              <option value="ALL">
                All Movements
              </option>

              <option value="PURCHASE">
                Purchases
              </option>

              <option value="SALE">
                Sales
              </option>

              <option value="ADJUSTMENT_IN">
                Adjustment In
              </option>

              <option value="ADJUSTMENT_OUT">
                Adjustment Out
              </option>

              <option value="DAMAGE">
                Damage
              </option>

              <option value="RETURN">
                Returns
              </option>
            </select>
          </div>
        </div>

        <div className="inventory-table-card">
          <div className="table-scroll">
            <table className="inventory-table movement-ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Note</th>
                  <th>User</th>
                </tr>
              </thead>

              <tbody>
                {filteredMovements.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="table-empty"
                    >
                      No stock movements
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(
                    (movement) => (
                      <tr key={movement.id}>
                        <td>
                          {formatDate(
                            movement.createdAt
                          )}
                        </td>

                        <td>
                          <div className="movement-product-cell">
                            <strong>
                              {
                                movement
                                  .product.name
                              }
                            </strong>

                            <span>
                              {
                                movement
                                  .product.sku
                              }
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={getMovementClass(
                              movement.type
                            )}
                          >
                            {
                              movementLabels[
                                movement.type
                              ]
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              isStockInMovement(
                                movement.type
                              )
                                ? "movement-quantity movement-quantity-in"
                                : "movement-quantity movement-quantity-out"
                            }
                          >
                            {isStockInMovement(
                              movement.type
                            )
                              ? "+"
                              : "-"}
                            {
                              movement.quantity
                            }
                          </span>
                        </td>

                        <td>
                          {movement.reference ||
                            "—"}
                        </td>

                        <td>
                          <span className="movement-note">
                            {movement.note ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <div className="movement-user-cell">
                            <strong>
                              {
                                movement.user
                                  .firstName
                              }{" "}
                              {
                                movement.user
                                  .lastName
                              }
                            </strong>

                            <span>
                              {
                                movement.user
                                  .role
                              }
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeActionModal();
            }
          }}
        >
          <div className="inventory-modal">
            <div className="modal-header">
              <div>
                <h2>{getModalTitle()}</h2>

                <p>
                  Update inventory for an
                  existing product.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeActionModal}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="inventory-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="form-error">
                  <AlertTriangle
                    size={17}
                  />

                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="inventory-product">
                  Product
                </label>

                <select
                  id="inventory-product"
                  value={form.productId}
                  onChange={(event) =>
                    updateForm(
                      "productId",
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  required
                >
                  <option value="">
                    Select a product
                  </option>

                  {activeProducts.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} —{" "}
                        {product.sku} —{" "}
                        {product.quantity}{" "}
                        {product.unit}{" "}
                        available
                      </option>
                    )
                  )}
                </select>
              </div>

              {selectedFormProduct && (
                <div className="inventory-summary">
                  <div>
                    <span>
                      Current Stock
                    </span>

                    <strong>
                      {
                        selectedFormProduct.quantity
                      }{" "}
                      {
                        selectedFormProduct.unit
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Reorder Level
                    </span>

                    <strong>
                      {
                        selectedFormProduct.reorderLevel
                      }
                    </strong>
                  </div>
                </div>
              )}

              {action === "adjustment" && (
                <div className="form-group">
                  <label htmlFor="adjustment-direction">
                    Adjustment Type
                  </label>

                  <select
                    id="adjustment-direction"
                    value={
                      form.adjustmentDirection
                    }
                    onChange={(event) =>
                      updateForm(
                        "adjustmentDirection",
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <option value="IN">
                      Add Stock
                    </option>

                    <option value="OUT">
                      Reduce Stock
                    </option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="inventory-quantity">
                  Quantity
                </label>

                <input
                  id="inventory-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    updateForm(
                      "quantity",
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-reference">
                  Reference
                </label>

                <input
                  id="inventory-reference"
                  type="text"
                  value={form.reference}
                  onChange={(event) =>
                    updateForm(
                      "reference",
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="e.g. PO-004"
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-note">
                  Note
                </label>

                <textarea
                  id="inventory-note"
                  rows={3}
                  value={form.note}
                  onChange={(event) =>
                    updateForm(
                      "note",
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="Add an optional note"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-secondary-button"
                  onClick={closeActionModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isHistoryOpen &&
        selectedProduct && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeHistory();
              }
            }}
          >
            <div className="inventory-history-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    Product Movement
                    History
                  </h2>

                  <p>
                    {selectedProduct.name} ·{" "}
                    {selectedProduct.sku}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closeHistory}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="history-product-summary">
                <div className="history-summary-item">
                  <span>Current Stock</span>

                  <strong>
                    {selectedProduct.quantity}{" "}
                    {selectedProduct.unit}
                  </strong>
                </div>

                <div className="history-summary-item">
                  <span>Reorder Level</span>

                  <strong>
                    {selectedProduct.reorderLevel}
                  </strong>
                </div>

                <div className="history-summary-item">
                  <span>Selling Price</span>

                  <strong>
                    {formatCurrency(
                      selectedProduct.sellingPrice,
                      settings.currency
                    )}
                  </strong>
                </div>
              </div>

              {historyError && (
                <div className="form-error">
                  <AlertTriangle size={17} />

                  <span>{historyError}</span>
                </div>
              )}

              {isHistoryLoading ? (
                <div className="history-loading">
                  <div className="page-loading-spinner" />

                  <p>
                    Loading history...
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {selectedProductMovements.length ===
                  0 ? (
                    <div className="history-empty">
                      <ClipboardList
                        size={30}
                      />

                      <p>
                        No inventory movements
                        found for this
                        product.
                      </p>
                    </div>
                  ) : (
                    selectedProductMovements.map(
                      (movement) => {
                        const stockIn =
                          isStockInMovement(
                            movement.type
                          );

                        const iconClass =
                          getHistoryIconClass(
                            movement.type
                          );

                        return (
                          <div
                            className="history-item"
                            key={movement.id}
                          >
                            <div className="history-timeline">
                              <div
                                className={`history-item-icon ${iconClass}`}
                              >
                                {stockIn ? (
                                  <ArrowDownToLine
                                    size={18}
                                  />
                                ) : (
                                  <ArrowUpFromLine
                                    size={18}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="history-item-content">
                              <div className="history-item-main">
                                <div className="history-item-title">
                                  <strong>
                                    {
                                      movementLabels[
                                        movement
                                          .type
                                      ]
                                    }
                                  </strong>

                                  <span
                                    className={
                                      stockIn
                                        ? "history-quantity history-quantity-in"
                                        : "history-quantity history-quantity-out"
                                    }
                                  >
                                    {stockIn
                                      ? "+"
                                      : "-"}
                                    {
                                      movement.quantity
                                    }{" "}
                                    units
                                  </span>
                                </div>

                                <div className="history-item-meta">
                                  <span>
                                    {formatDate(
                                      movement.createdAt
                                    )}
                                  </span>

                                  <span>
                                    ·
                                  </span>

                                  <span>
                                    {
                                      movement
                                        .user
                                        .firstName
                                    }{" "}
                                    {
                                      movement
                                        .user
                                        .lastName
                                    }
                                  </span>
                                </div>
                              </div>

                              <p>
                                {movement.note ||
                                  "No note provided"}
                              </p>

                              <span className="history-reference">
                                {movement.reference ||
                                  "No reference"}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default InventoryPage;