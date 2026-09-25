import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  ShieldCheck,
  User,
  Users,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  createUser,
  getUsers,
  updateUserStatus,
  type SystemUser,
  type UserRole,
} from "../services/user.service";
import "./UsersPage.css";

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CASHIER");
  const [formError, setFormError] = useState("");

  const loadUsers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.firstName,
        user.lastName,
        user.username,
        user.role,
      ].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [users, search]);

  const activeUsers = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users]
  );

  const inactiveUsers = useMemo(
    () => users.filter((user) => !user.isActive).length,
    [users]
  );

  const adminUsers = useMemo(
    () => users.filter((user) => user.role === "ADMIN").length,
    [users]
  );

  const resetForm = (): void => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setPassword("");
    setRole("CASHIER");
    setFormError("");
    setShowPassword(false);
  };

  const handleOpenModal = (): void => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    if (isSubmitting) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  const handleCreateUser = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (password.length < 6) {
      setFormError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const newUser = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        password,
        role,
      });

      setUsers((current) => [newUser, ...current]);
      setShowModal(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to create user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    user: SystemUser
  ): Promise<void> => {
    const action = user.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setError("");

      const updatedUser = await updateUserStatus(
        user.id,
        !user.isActive
      );

      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.id === updatedUser.id
            ? {
                ...currentUser,
                isActive: updatedUser.isActive,
                updatedAt: updatedUser.updatedAt,
              }
            : currentUser
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user status"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="module-loading">
        <div className="loading-spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="module-header">
        <div>
          <p className="section-label">ADMINISTRATION</p>

          <h3>User Management</h3>

          <p>
            Manage administrators, cashiers, and account access.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleOpenModal}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {error && (
        <div className="module-error users-error">
          <AlertTriangle size={18} />

          <div>
            <strong>User management error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="user-summary-grid">
        <div className="user-summary-card">
          <div className="user-summary-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="user-summary-icon">
            <UserRoundCheck size={19} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="user-summary-icon">
            <UserRoundX size={19} />
          </div>

          <div>
            <span>Inactive Users</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="user-summary-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <span>Administrators</span>
            <strong>{adminUsers}</strong>
          </div>
        </div>
      </div>

      <div className="users-table-card">
        <div className="users-table-toolbar">
          <div>
            <h4>System Users</h4>
            <p>
              Manage user accounts and access status.
            </p>
          </div>

          <div className="users-toolbar-right">
            <div className="users-search">
              <User size={16} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search users..."
              />
            </div>

            <span className="users-count">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "user"
                : "users"}
            </span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="module-empty">
            <Users size={28} />

            <h4>
              {search
                ? "No users found"
                : "No users available"}
            </h4>

            <p>
              {search
                ? "Try a different search term."
                : "Create a user account to get started."}
            </p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {user.firstName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.firstName}{" "}
                            {user.lastName}
                          </strong>

                          <span>
                            User ID #{user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="username-text">
                        {user.username}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "ADMIN"
                            ? "role-admin"
                            : "role-cashier"
                        }`}
                      >
                        {user.role === "ADMIN"
                          ? "Administrator"
                          : "Cashier"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive
                            ? "status-success"
                            : "status-neutral"
                        }`}
                      >
                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {formatDate(user.createdAt)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`user-status-button ${
                          user.isActive
                            ? "user-deactivate-button"
                            : "user-activate-button"
                        }`}
                        disabled={
                          updatingUserId === user.id
                        }
                        onClick={() =>
                          void handleStatusChange(user)
                        }
                      >
                        {updatingUserId === user.id ? (
                          "Updating..."
                        ) : user.isActive ? (
                          <>
                            <UserRoundX size={14} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
          >
            <div className="modal-header">
              <div>
                <h3 id="create-user-title">
                  Add New User
                </h3>

                <p>
                  Create an account for an administrator or
                  cashier.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form
              className="user-form"
              onSubmit={handleCreateUser}
            >
              {formError && (
                <div className="form-error">
                  <AlertTriangle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="user-first-name">
                    First Name
                  </label>

                  <input
                    id="user-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    placeholder="Enter first name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-last-name">
                    Last Name
                  </label>

                  <input
                    id="user-last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    placeholder="Enter last name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="user-username">
                  Username
                </label>

                <input
                  id="user-username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Enter username"
                  autoComplete="off"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-password">
                  Password
                </label>

                <div className="password-input">
                  <input
                    id="user-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="user-role">
                  Role
                </label>

                <select
                  id="user-role"
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value as UserRole
                    )
                  }
                  disabled={isSubmitting}
                >
                  <option value="CASHIER">
                    Cashier
                  </option>

                  <option value="ADMIN">
                    Administrator
                  </option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  <Plus size={16} />

                  {isSubmitting
                    ? "Creating..."
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;