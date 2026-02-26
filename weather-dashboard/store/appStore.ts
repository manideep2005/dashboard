import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TempUnit = "celsius" | "fahrenheit" | "kelvin";
export type Theme = "dark" | "light";
export type AlertChannel = "in_app" | "email" | "push";

export interface AlertPreferences {
  severeWeather: boolean;
  highWind: boolean;
  extremeTemp: boolean;
  poorAQI: boolean;
  precipitation: boolean;
}

interface AppStore {
  theme: Theme;
  unit: TempUnit;
  favorites: string[];
  autoRefreshInterval: number; // minutes, 0 = off
  notificationsEnabled: boolean;
  alertChannels: AlertChannel[];
  alertPreferences: AlertPreferences;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setUnit: (unit: TempUnit) => void;
  addFavorite: (city: string) => void;
  removeFavorite: (city: string) => void;
  setAutoRefreshInterval: (minutes: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAlertChannels: (channels: AlertChannel[]) => void;
  setAlertPreference: (key: keyof AlertPreferences, value: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      unit: "celsius",
      favorites: [],
      autoRefreshInterval: 0,
      notificationsEnabled: true,
      alertChannels: ["in_app"],
      alertPreferences: {
        severeWeather: true,
        highWind: true,
        extremeTemp: true,
        poorAQI: true,
        precipitation: false,
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next);
      },

      setUnit: (unit) => set({ unit }),

      addFavorite: (city) => {
        const favs = get().favorites;
        if (!favs.some((f) => f.toLowerCase() === city.toLowerCase())) {
          set({ favorites: [...favs, city] });
        }
      },

      removeFavorite: (city) => {
        set({ favorites: get().favorites.filter((f) => f.toLowerCase() !== city.toLowerCase()) });
      },

      setAutoRefreshInterval: (minutes) => set({ autoRefreshInterval: minutes }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      setAlertChannels: (channels) => set({ alertChannels: channels }),

      setAlertPreference: (key, value) => {
        const prefs = { ...get().alertPreferences, [key]: value };
        set({ alertPreferences: prefs });
      },
    }),
    {
      name: "weatherai-app-store",
    }
  )
);

// Temperature conversion utilities
export const convertTemp = (celsius: number, unit: TempUnit): number => {
  switch (unit) {
    case "fahrenheit":
      return (celsius * 9) / 5 + 32;
    case "kelvin":
      return celsius + 273.15;
    default:
      return celsius;
  }
};

export const formatTemp = (celsius: number, unit: TempUnit, decimals = 0): string => {
  const val = convertTemp(celsius, unit);
  const rounded = decimals === 0 ? Math.round(val) : parseFloat(val.toFixed(decimals));
  switch (unit) {
    case "fahrenheit":
      return `${rounded}°F`;
    case "kelvin":
      return `${rounded}K`;
    default:
      return `${rounded}°C`;
  }
};

export const unitSymbol = (unit: TempUnit): string => {
  switch (unit) {
    case "fahrenheit":
      return "°F";
    case "kelvin":
      return "K";
    default:
      return "°C";
  }
};
