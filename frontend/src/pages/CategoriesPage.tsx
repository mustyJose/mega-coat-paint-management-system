import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
  type Category,
} from "../services/category.service";
import { useAuth } from "../context/AuthContext";

interface CategoryFormState {
  name: string;
}

const initialFormState: CategoryFormState = {
  name: "",
};

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

function CategoriesPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryFormState>(initialFormState);

  const isAdmin = user?.role === "ADMIN";

  const loadCategories = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getCategories();

      setCategories(data);
    } catch (categoryError) {
      setError(
        categoryError instanceof Error
          ? categoryError.message
          : "Unable to load categories."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(search)
    );
  }, [categories, searchTerm]);

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCount = categories.filter(
    (category) => !category.isActive
  ).length;

  const openCreateModal = (): void => {
    setEditingCategory(null);
    setForm(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category): void => {
    setEditingCategory(category);
    setForm({
      name: category.name,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(initialFormState);
    setFormError("");
  };

  const resetAndCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(initialFormState);
    setFormError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setFormError("");

    const name = form.name.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name,
        });
      } else {
        await createCategory({
          name,
        });
      }

      await loadCategories();

      resetAndCloseModal();
    } catch (categoryError) {
      setFormError(
        categoryError instanceof Error
          ? categoryError.message
          : editingCategory
            ? "Unable to update category."
            : "Unable to create category."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (
    category: Category
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deactivateCategory(category.id);

      await loadCategories();
    } catch (categoryError) {
      setError(
        categoryError instanceof Error
          ? categoryError.message
          : "Unable to deactivate category."
      );
    }
  };

  return (
    <section className="categories-page">
      <div className="module-header">
        <div>
          <p className="section-label">CATALOG MANAGEMENT</p>
          <h3>Categories</h3>
          <p>
            Organize paints, tools, building materials, hardware,
            and chemicals.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Add Category
          </button>
        )}
      </div>

      <div className="category-summary-grid">
        <article className="category-summary-card">
          <div className="category-summary-icon">
            <Boxes size={20} />
          </div>

          <div>
            <span>Total Categories</span>
            <strong>{categories.length}</strong>
          </div>
        </article>

        <article className="category-summary-card">
          <div className="category-summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Active Categories</span>
            <strong>{activeCount}</strong>
          </div>
        </article>

        <article className="category-summary-card">
          <div className="category-summary-icon">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Inactive Categories</span>
            <strong>{inactiveCount}</strong>
          </div>
        </article>
      </div>

      <div className="categories-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="category-count">
          {filteredCategories.length}{" "}
          {filteredCategories.length === 1
            ? "category"
            : "categories"}
        </div>
      </div>

      {isLoading && (
        <div className="module-loading">
          <div className="loading-spinner" />
          <p>Loading categories...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="module-error">
          <AlertCircle size={20} />

          <div>
            <strong>Unable to load categories</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!isLoading &&
        !error &&
        filteredCategories.length === 0 && (
          <div className="module-empty">
            <Boxes size={32} />

            <h4>
              {searchTerm
                ? "No categories found"
                : "No categories available"}
            </h4>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Add your first category to get started."}
            </p>
          </div>
        )}

      {!isLoading &&
        !error &&
        filteredCategories.length > 0 && (
          <div className="categories-table-card">
            <div className="categories-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className="category-name-cell">
                          <div className="category-icon">
                            <Boxes size={17} />
                          </div>

                          <div>
                            <strong>{category.name}</strong>
                            <span>
                              Category #{category.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {category.isActive ? (
                          <span className="status-badge status-success">
                            Active
                          </span>
                        ) : (
                          <span className="status-badge status-neutral">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>{formatDate(category.createdAt)}</td>

                      <td>{formatDate(category.updatedAt)}</td>

                      {isAdmin && (
                        <td>
                          <div className="category-actions">
                            <button
                              type="button"
                              className="table-action-button"
                              onClick={() =>
                                openEditModal(category)
                              }
                            >
                              <Edit3 size={15} />
                              Edit
                            </button>

                            {category.isActive && (
                              <button
                                type="button"
                                className="table-action-button danger"
                                onClick={() =>
                                  void handleDeactivate(
                                    category
                                  )
                                }
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="section-label">
                  CATALOG MANAGEMENT
                </p>

                <h3 id="category-modal-title">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="category-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="form-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="category-name">
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Plumbing Materials"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
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
                    ? editingCategory
                      ? "Saving..."
                      : "Creating..."
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CategoriesPage;