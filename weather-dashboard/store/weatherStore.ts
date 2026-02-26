import { create } from "zustand";
import axios from "axios";
import { WeatherData, AirPollutionData, ForecastData } from "@/types/weather";

interface WeatherStore {
  weather: WeatherData | null;
  airPollution: AirPollutionData | null;
  forecast: ForecastData | null;
  uvIndex: number | null;
  city: string;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  setCity: (city: string) => void;
  fetchAll: (city?: string, lat?: number, lon?: number) => Promise<void>;
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  weather: null,
  airPollution: null,
  forecast: null,
  uvIndex: null,
  city: "London",
  loading: false,
  error: null,
  lastFetched: null,

  setCity: (city: string) => set({ city }),

  fetchAll: async (city?: string, lat?: number, lon?: number) => {
    set({ loading: true, error: null });
    const targetCity = city || get().city;

    try {
      let weatherUrl = `/api/weather?city=${targetCity}`;
      let forecastUrl = `/api/forecast?city=${targetCity}`;
      let airUrl = "";

      if (lat !== undefined && lon !== undefined) {
        weatherUrl = `/api/weather?lat=${lat}&lon=${lon}`;
        forecastUrl = `/api/forecast?lat=${lat}&lon=${lon}`;
        airUrl = `/api/air-pollution?lat=${lat}&lon=${lon}`;
      }

      const weatherRes = await axios.get(weatherUrl);
      const weatherData: WeatherData = weatherRes.data;

      const coords = weatherData.coord;
      if (!airUrl) {
        airUrl = `/api/air-pollution?lat=${coords.lat}&lon=${coords.lon}`;
      }

      const uvUrl = `/api/uv?lat=${coords.lat}&lon=${coords.lon}`;

      const [airRes, forecastRes, uvRes] = await Promise.all([
        axios.get(airUrl),
        axios.get(forecastUrl),
        axios.get(uvUrl).catch(() => ({ data: { uv: null } })),
      ]);

      set({
        weather: weatherData,
        airPollution: airRes.data,
        forecast: forecastRes.data,
        uvIndex: uvRes.data?.uv ?? null,
        city: weatherData.name || targetCity,
        loading: false,
        lastFetched: Date.now(),
      });
    } catch (err: unknown) {
      let message = "Failed to fetch data";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const status = err.response?.status;
        if (status === 401 || data?.error?.includes("Invalid API key")) {
          message = "API_KEY_ACTIVATING";
        } else if (data?.error) {
          message = data.error;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, loading: false });
    }
  },
}));
