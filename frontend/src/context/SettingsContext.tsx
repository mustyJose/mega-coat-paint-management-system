import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface StoreSettings {
  storeName: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
}

export const SETTINGS_KEY = "mega_coat_store_settings";

export const defaultSettings: StoreSettings = {
  storeName: "Mega Coat",
  subtitle: "Paint & Chemical",
  address: "",
  phone: "",
  email: "",
  currency: "NGN",
};

interface SettingsContextValue {
  settings: StoreSettings;
  updateSettings: (settings: StoreSettings) => void;
  resetSettings: () => void;
}

const SettingsContext =
  createContext<SettingsContextValue | undefined>(
    undefined
  );

function readStoredSettings(): StoreSettings {
  try {
    const storedSettings =
      window.localStorage.getItem(SETTINGS_KEY);

    if (!storedSettings) {
      return defaultSettings;
    }

    const parsedSettings =
      JSON.parse(storedSettings) as Partial<StoreSettings>;

    return {
      ...defaultSettings,
      ...parsedSettings,
    };
  } catch {
    window.localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  }
}

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<StoreSettings>(readStoredSettings);

  useEffect(() => {
    const handleStorageChange = (
      event: StorageEvent
    ): void => {
      if (event.key !== SETTINGS_KEY) {
        return;
      }

      setSettings(readStoredSettings());
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const updateSettings = (
    newSettings: StoreSettings
  ): void => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(newSettings)
    );

    setSettings(newSettings);
  };

  const resetSettings = (): void => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(defaultSettings)
    );

    setSettings(defaultSettings);
  };

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
    }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within a SettingsProvider"
    );
  }

  return context;
}