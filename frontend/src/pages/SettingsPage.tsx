import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  defaultSettings,
  useSettings,
  type StoreSettings,
} from "../context/SettingsContext";
import "./SettingsPage.css";

function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } =
    useSettings();

  const [formSettings, setFormSettings] =
    useState<StoreSettings>(settings);

  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleChange = (
    field: keyof StoreSettings,
    value: string
  ): void => {
    setFormSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setIsSaved(false);
    setSaveError("");
  };

  const handleSave = (): void => {
    try {
      const settingsToSave: StoreSettings = {
        ...formSettings,
        storeName: formSettings.storeName.trim(),
        subtitle: formSettings.subtitle.trim(),
        address: formSettings.address.trim(),
        phone: formSettings.phone.trim(),
        email: formSettings.email.trim(),
      };

      if (!settingsToSave.storeName) {
        setSaveError("Store name is required.");
        setIsSaved(false);
        return;
      }

      updateSettings(settingsToSave);
      setFormSettings(settingsToSave);
      setIsSaved(true);
      setSaveError("");
    } catch {
      setIsSaved(false);
      setSaveError(
        "Unable to save settings on this device."
      );
    }
  };

  const handleReset = (): void => {
    const confirmed = window.confirm(
      "Reset store settings to the default values?"
    );

    if (!confirmed) {
      return;
    }

    try {
      resetSettings();
      setFormSettings(defaultSettings);
      setIsSaved(true);
      setSaveError("");
    } catch {
      setIsSaved(false);
      setSaveError(
        "Unable to reset settings on this device."
      );
    }
  };

  return (
    <div className="settings-page">
      <div className="module-header">
        <div>
          <p className="section-label">SYSTEM</p>

          <h3>Settings</h3>

          <p>
            Configure store information and view your account
            details.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="settings-success">
          <CheckCircle2 size={18} />

          <div>
            <strong>Settings saved successfully</strong>

            <p>
              Your store settings have been saved on this
              device.
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="module-error">
          <div>
            <strong>Unable to save settings</strong>
            <p>{saveError}</p>
          </div>
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <Store size={19} />
            </div>

            <div>
              <h4>Store Information</h4>

              <p>
                Information displayed throughout the application.
              </p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="store-name">
                  Store Name
                </label>

                <input
                  id="store-name"
                  type="text"
                  value={formSettings.storeName}
                  onChange={(event) =>
                    handleChange(
                      "storeName",
                      event.target.value
                    )
                  }
                  placeholder="Enter store name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="store-subtitle">
                  Business Type
                </label>

                <input
                  id="store-subtitle"
                  type="text"
                  value={formSettings.subtitle}
                  onChange={(event) =>
                    handleChange(
                      "subtitle",
                      event.target.value
                    )
                  }
                  placeholder="Enter business type"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="store-address">
                Address
              </label>

              <div className="settings-input-with-icon">
                <MapPin size={16} />

                <input
                  id="store-address"
                  type="text"
                  value={formSettings.address}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter store address"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="store-phone">
                  Phone Number
                </label>

                <div className="settings-input-with-icon">
                  <Phone size={16} />

                  <input
                    id="store-phone"
                    type="tel"
                    value={formSettings.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="store-email">
                  Email Address
                </label>

                <div className="settings-input-with-icon">
                  <Mail size={16} />

                  <input
                    id="store-email"
                    type="email"
                    value={formSettings.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="store-currency">
                Currency
              </label>

              <select
                id="store-currency"
                value={formSettings.currency}
                onChange={(event) =>
                  handleChange(
                    "currency",
                    event.target.value
                  )
                }
              >
                <option value="NGN">
                  Nigerian Naira (NGN)
                </option>

                <option value="USD">
                  US Dollar (USD)
                </option>

                <option value="GBP">
                  British Pound (GBP)
                </option>

                <option value="EUR">
                  Euro (EUR)
                </option>
              </select>

              <span className="settings-help-text">
                Currency selection is stored for this local
                application.
              </span>
            </div>

            <div className="settings-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleReset}
              >
                <RefreshCcw size={15} />
                Reset
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleSave}
              >
                <Save size={15} />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="settings-side-column">
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <h4>Current Account</h4>

                <p>
                  Your authenticated application account.
                </p>
              </div>
            </div>

            <div className="account-details">
              <div className="account-avatar">
                {user?.firstName
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="account-name">
                <strong>
                  {user?.firstName} {user?.lastName}
                </strong>

                <span>{user?.username}</span>
              </div>

              <div className="account-detail-row">
                <span>Role</span>

                <strong>
                  {user?.role === "ADMIN"
                    ? "Administrator"
                    : "Cashier"}
                </strong>
              </div>

              <div className="account-detail-row">
                <span>Access</span>

                <span className="settings-status">
                  <CheckCircle2 size={14} />
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Building2 size={19} />
              </div>

              <div>
                <h4>Application</h4>

                <p>System information.</p>
              </div>
            </div>

            <div className="application-details">
              <div>
                <span>Application</span>
                <strong>{formSettings.storeName}</strong>
              </div>

              <div>
                <span>System</span>
                <strong>{formSettings.subtitle}</strong>
              </div>

              <div>
                <span>Environment</span>
                <strong>Local / Offline</strong>
              </div>

              <div>
                <span>Currency</span>
                <strong>{formSettings.currency}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;