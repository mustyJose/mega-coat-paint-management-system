import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Package,
  Receipt,
  TrendingUp,
  User,
} from "lucide-react";
import {
  getSalesReport,
  type SalesReportResponse,
} from "../services/report.service";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/currency";

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

function ReportsPage() {
  const { settings } = useSettings();

  const [report, setReport] =
    useState<SalesReportResponse | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async (
    filters: {
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getSalesReport(filters);

      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load sales report"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const handleFilter = async (): Promise<void> => {
    if (startDate && endDate && startDate > endDate) {
      setError(
        "Start date cannot be after end date."
      );
      return;
    }

    await loadReport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClearFilters = async (): Promise<void> => {
    setStartDate("");
    setEndDate("");

    await loadReport();
  };

  const productRevenue = useMemo(() => {
    if (!report) {
      return [];
    }

    return [...report.products].sort(
      (a, b) => b.revenue - a.revenue
    );
  }, [report]);

  if (isLoading && !report) {
    return (
      <div className="module-loading">
        <div className="loading-spinner" />
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="module-error">
        <AlertTriangle size={20} />

        <div>
          <strong>Unable to load reports</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="categories-page">
      <div className="module-header">
        <div>
          <p className="section-label">REPORTS</p>

          <h3>Sales Reports</h3>

          <p>
            Analyze sales, revenue, costs, profit, products,
            and cashier performance.
          </p>
        </div>
      </div>

      <div className="report-filters">
        <div className="report-filter-field">
          <label htmlFor="report-start-date">
            <CalendarDays size={15} />
            Start Date
          </label>

          <input
            id="report-start-date"
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
          />
        </div>

        <div className="report-filter-field">
          <label htmlFor="report-end-date">
            <CalendarDays size={15} />
            End Date
          </label>

          <input
            id="report-end-date"
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => void handleFilter()}
          disabled={isLoading}
        >
          <BarChart3 size={16} />
          {isLoading ? "Loading..." : "Apply Filter"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => void handleClearFilters()}
          disabled={isLoading}
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="module-error">
          <AlertTriangle size={18} />

          <div>
            <strong>Report error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Receipt size={19} />
          </div>

          <div>
            <span>Total Sales</span>

            <strong>
              {report.summary.totalSales}
            </strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <CircleDollarSign size={19} />
          </div>

          <div>
            <span>Total Revenue</span>

            <strong>
              {formatCurrency(
                report.summary.totalRevenue,
                settings.currency
              )}
            </strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Package size={19} />
          </div>

          <div>
            <span>Total Cost</span>

            <strong>
              {formatCurrency(
                report.summary.totalCost,
                settings.currency
              )}
            </strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Total Profit</span>

            <strong>
              {formatCurrency(
                report.summary.totalProfit,
                settings.currency
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="categories-table-card">
          <div className="card-header">
            <div>
              <h4>Product Performance</h4>

              <p>
                Products sold during the selected period.
              </p>
            </div>

            <span className="category-count">
              {productRevenue.length}{" "}
              {productRevenue.length === 1
                ? "product"
                : "products"}
            </span>
          </div>

          {productRevenue.length === 0 ? (
            <div className="module-empty">
              <Package size={28} />

              <h4>No product sales</h4>

              <p>
                There are no product sales for this period.
              </p>
            </div>
          ) : (
            <div className="categories-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                    <th>Cost</th>
                    <th>Profit</th>
                  </tr>
                </thead>

                <tbody>
                  {productRevenue.map((product) => (
                    <tr key={product.productId}>
                      <td>
                        <div className="category-name-cell">
                          <div className="category-icon">
                            <Package size={15} />
                          </div>

                          <div>
                            <strong>
                              {product.productName}
                            </strong>

                            <span>
                              {product.sku} ·{" "}
                              {product.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {product.quantitySold}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            product.revenue,
                            settings.currency
                          )}
                        </strong>
                      </td>

                      <td>
                        {formatCurrency(
                          product.cost,
                          settings.currency
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            product.profit,
                            settings.currency
                          )}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="categories-table-card">
          <div className="card-header">
            <div>
              <h4>Cashier Performance</h4>

              <p>
                Sales activity by staff member.
              </p>
            </div>
          </div>

          {report.cashiers.length === 0 ? (
            <div className="module-empty">
              <User size={28} />

              <h4>No cashier activity</h4>

              <p>
                There are no sales recorded for this period.
              </p>
            </div>
          ) : (
            <div className="categories-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {report.cashiers.map((cashier) => (
                    <tr key={cashier.userId}>
                      <td>
                        <div className="category-name-cell">
                          <div className="category-icon">
                            <User size={15} />
                          </div>

                          <div>
                            <strong>
                              {cashier.firstName}{" "}
                              {cashier.lastName}
                            </strong>

                            <span>
                              {cashier.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {cashier.salesCount}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            cashier.revenue,
                            settings.currency
                          )}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="categories-table-card">
        <div className="card-header">
          <div>
            <h4>Transaction History</h4>

            <p>
              Sales included in the selected reporting period.
            </p>
          </div>

          <span className="category-count">
            {report.sales.length}{" "}
            {report.sales.length === 1
              ? "transaction"
              : "transactions"}
          </span>
        </div>

        {report.sales.length === 0 ? (
          <div className="module-empty">
            <Receipt size={28} />

            <h4>No transactions</h4>

            <p>
              No sales were recorded during this period.
            </p>
          </div>
        ) : (
          <div className="categories-table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Recorded By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {report.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <div className="category-name-cell">
                        <div className="category-icon">
                          <Receipt size={15} />
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
                      {sale.items.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          sale.totalAmount,
                          settings.currency
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;