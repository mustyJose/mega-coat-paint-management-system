import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getDashboard,
  type DashboardResponse,
} from "../services/dashboard.service";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/currency";

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

function DashboardPage() {
  const { settings } = useSettings();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDashboard();

        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={34} />
        <h3>Unable to load dashboard</h3>
        <p>{error || "Dashboard data is unavailable."}</p>
      </div>
    );
  }

  const {
    summary,
    today,
    lowStockProducts,
    outOfStockProducts,
    recentSales,
  } = dashboard;

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <div>
          <p className="section-label">OVERVIEW</p>

          <h3>Dashboard</h3>

          <p>
            Monitor your paint store operations, inventory, and
            sales performance.
          </p>
        </div>

        <Link to="/sales" className="primary-button">
          <ShoppingCart size={16} />
          New Sale
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Active Products</span>
            <strong>{summary.totalProducts}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Boxes size={20} />
          </div>

          <div>
            <span>Active Categories</span>
            <strong>{summary.totalCategories}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ArrowDownToLine size={20} />
          </div>

          <div>
            <span>Total Stock Units</span>
            <strong>{summary.totalStockQuantity}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Low Stock Items</span>
            <strong>{summary.lowStockProducts}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h4>Recent Sales</h4>
              <p>Latest transactions recorded in the system.</p>
            </div>

            <Link to="/sales" className="text-button">
              View all
            </Link>
          </div>

          {recentSales.length > 0 ? (
            <div className="recent-sales-list">
              {recentSales.slice(0, 5).map((sale) => (
                <div className="recent-sale-item" key={sale.id}>
                  <div className="recent-sale-icon">
                    <ShoppingCart size={16} />
                  </div>

                  <div className="recent-sale-details">
                    <strong>{sale.reference}</strong>

                    <span>
                      {sale.user.firstName} {sale.user.lastName} ·{" "}
                      {formatDate(sale.createdAt)}
                    </span>
                  </div>

                  <div className="recent-sale-amount">
                    {formatCurrency(
                      sale.totalAmount,
                      settings.currency
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ShoppingCart size={28} />
              <p>No sales recorded yet.</p>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h4>Inventory Status</h4>
              <p>Current stock alerts.</p>
            </div>

            <Link to="/inventory" className="text-button">
              View inventory
            </Link>
          </div>

          <div className="inventory-summary">
            <div>
              <span>Low Stock</span>
              <strong>{summary.lowStockProducts}</strong>
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{summary.outOfStockProducts}</strong>
            </div>
          </div>

          {outOfStockProducts.length > 0 ||
          lowStockProducts.length > 0 ? (
            <div className="inventory-alert-list">
              <h5>Products requiring attention</h5>

              {[
                ...outOfStockProducts,
                ...lowStockProducts,
              ]
                .slice(0, 5)
                .map((product) => (
                  <div
                    className="inventory-alert-item"
                    key={product.id}
                  >
                    <span>{product.name}</span>

                    <strong>
                      {product.quantity === 0
                        ? "Out of stock"
                        : `${product.quantity} left`}
                    </strong>
                  </div>
                ))}
            </div>
          ) : (
            <div className="inventory-ok">
              <CheckCircle2 size={17} />
              <span>
                All products have healthy stock levels.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-financial-grid">
        <div className="dashboard-card financial-card">
          <CircleDollarSign size={20} />

          <span>Today's Revenue</span>

          <strong>
            {formatCurrency(
              today.revenue,
              settings.currency
            )}
          </strong>
        </div>

        <div className="dashboard-card financial-card">
          <Wallet size={20} />

          <span>Today's Cost</span>

          <strong>
            {formatCurrency(
              today.cost,
              settings.currency
            )}
          </strong>
        </div>

        <div className="dashboard-card financial-card">
          <TrendingUp size={20} />

          <span>Today's Profit</span>

          <strong>
            {formatCurrency(
              today.profit,
              settings.currency
            )}
          </strong>
        </div>

        <div className="dashboard-card financial-card">
          <BarChart3 size={20} />

          <span>Total Inventory Value</span>

          <strong>
            {formatCurrency(
              summary.totalInventoryValue,
              settings.currency
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;