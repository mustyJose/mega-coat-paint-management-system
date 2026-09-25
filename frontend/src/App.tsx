import React from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  X,
} from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  SettingsProvider,
  useSettings,
} from "./context/SettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";

import "./App.css";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      await login({
        username,
        password,
      });

      const state = location.state as
        | { from?: string }
        | null;

      navigate(state?.from || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">
            <Package size={27} />
          </div>

          <div>
            <strong>{settings.storeName}</strong>
            <span>{settings.subtitle}</span>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>
            Sign in to manage your paint store.
          </p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{
    size?: number;
  }>;
  adminOnly?: boolean;
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: Tags,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Boxes,
  },
  {
    label: "Sales",
    path: "/sales",
    icon: ShoppingCart,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function AppLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] =
    React.useState(false);

  const [isProfileOpen, setIsProfileOpen] =
    React.useState(false);

  const visibleNavigationItems =
    navigationItems.filter(
      (item) =>
        !item.adminOnly ||
        user?.role === "ADMIN"
    );

  const handleLogout = (): void => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  };

  const getPageTitle = (): string => {
    const currentItem = navigationItems.find(
      (item) => location.pathname === item.path
    );

    return currentItem?.label || settings.storeName;
  };

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          isSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <Package size={24} />
          </div>

          <div className="sidebar-brand-text">
            <strong>{settings.storeName}</strong>
            <span>{settings.subtitle}</span>
          </div>

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={() =>
              setIsSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <span className="sidebar-section-label">
            MAIN MENU
          </span>

          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path;

            return (
              <button
                type="button"
                key={item.path}
                className={`sidebar-nav-item ${
                  isActive
                    ? "sidebar-nav-item-active"
                    : ""
                }`}
                onClick={() =>
                  handleNavigation(item.path)
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() =>
            setIsSidebarOpen(false)
          }
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setIsSidebarOpen(true)
              }
            >
              <Menu size={22} />
            </button>

            <div className="topbar-page-title">
              {getPageTitle()}
            </div>
          </div>

          <div className="topbar-profile-wrapper">
            <button
              type="button"
              className="topbar-profile"
              onClick={() =>
                setIsProfileOpen(
                  (current) => !current
                )
              }
            >
              <div className="topbar-avatar">
                {user?.firstName
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="topbar-user-info">
                <strong>
                  {user?.firstName}{" "}
                  {user?.lastName}
                </strong>

                <span>{user?.role}</span>
              </div>

              <ChevronDown size={17} />
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <strong>
                    {user?.firstName}{" "}
                    {user?.lastName}
                  </strong>

                  <span>{user?.username}</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/categories"
            element={<CategoriesPage />}
          />

          <Route
            path="/inventory"
            element={<InventoryPage />}
          />

          <Route
            path="/sales"
            element={<SalesPage />}
          />

          <Route element={<AdminRoute />}>
            <Route
              path="/reports"
              element={<ReportsPage />}
            />

            <Route
              path="/users"
              element={<UsersPage />}
            />
          </Route>

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppRoutes />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;