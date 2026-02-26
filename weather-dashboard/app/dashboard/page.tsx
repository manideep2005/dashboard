"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore, formatTemp } from "@/store/appStore";
import { getWeatherAlerts } from "@/types/weather";
import Navbar from "@/components/Navbar";
import WeatherWidget from "@/components/WeatherWidget";
import AQIWidget from "@/components/AQIWidget";
import ForecastChart from "@/components/ForecastChart";
import HourlyForecast from "@/components/HourlyForecast";
import LocationSearch from "@/components/LocationSearch";
import FavoritesBar from "@/components/FavoritesBar";
import MapWidget from "@/components/MapWidget";
import AISummary from "@/components/AISummary";
import HistoricalChart from "@/components/HistoricalChart";
import AutoRefresh from "@/components/AutoRefresh";
import WeatherAlerts from "@/components/WeatherAlerts";
import { IoRefreshOutline, IoWarningOutline, IoTimeOutline } from "react-icons/io5";

export default function DashboardPage() {
  const { fetchAll, loading, error, weather, city, airPollution, uvIndex } = useWeatherStore();
  const { unit } = useAppStore();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAll(undefined, pos.coords.latitude, pos.coords.longitude),
        () => fetchAll("London")
      );
    } else {
      fetchAll("London");
    }
  }, [fetchAll]);

  // Register service worker for PWA — force update to replace old broken SW
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.update());
      });
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
      // Clear old caches from the broken v1 SW
      if ("caches" in window) {
        caches.delete("weatherai-v1").catch(() => {});
      }
    }
  }, []);

  const alerts = getWeatherAlerts(weather, airPollution);

  return (
    <div className="min-h-screen bg-animated">
      <Navbar alertCount={alerts.length} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold gradient-text">
              {weather ? `${weather.name}, ${weather.sys.country}` : "Weather Dashboard"}
            </h1>
            <p className="text-white/30 text-sm mt-0.5">
              Live weather & air quality monitoring
            </p>
          </motion.div>

          <div className="flex items-center gap-3 flex-wrap">
            <AutoRefresh />
            <LocationSearch />
            <motion.button
              onClick={() => fetchAll(city)}
              disabled={loading}
              className="glass glass-hover w-11 h-11 rounded-2xl flex items-center justify-center text-white/50 hover:text-white transition-colors disabled:opacity-30"
              title="Refresh"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
            >
              <IoRefreshOutline size={20} />
            </motion.button>
          </div>
        </div>

        {/* Favorites */}
        <FavoritesBar />

        {/* Weather Alerts */}
        <WeatherAlerts alerts={alerts} />

        {/* Error banners */}
        <AnimatePresence>
          {error === "API_KEY_ACTIVATING" && (
            <motion.div
              className="flex items-center gap-3 glass border border-amber-500/30 rounded-2xl px-5 py-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <IoTimeOutline size={22} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-400 font-semibold text-sm">OpenWeatherMap API key is still activating</p>
                <p className="text-amber-400/60 text-xs mt-0.5">
                  New keys take up to 2 hours to activate. Click retry when ready.
                </p>
              </div>
              <button
                onClick={() => fetchAll(city)}
                className="ml-auto glass px-3 py-1.5 rounded-xl text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-colors flex-shrink-0"
              >
                Retry
              </button>
            </motion.div>
          )}
          {error && error !== "API_KEY_ACTIVATING" && (
            <motion.div
              className="flex items-center gap-3 glass border border-red-500/20 rounded-2xl px-5 py-3 text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <IoWarningOutline size={20} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Summary */}
        <AISummary />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="flex flex-col gap-6">
            <WeatherWidget />
            <HourlyForecast />
          </div>

          {/* Center col */}
          <div className="flex flex-col gap-6">
            <ForecastChart />
            <div className="grid grid-cols-2 gap-4">
              {weather && [
                {
                  label: "UV Index",
                  value: uvIndex !== null ? `${uvIndex.toFixed(1)}` : "N/A",
                  sub: uvIndex !== null
                    ? uvIndex <= 2 ? "Low" : uvIndex <= 5 ? "Moderate" : uvIndex <= 7 ? "High" : uvIndex <= 10 ? "Very High" : "Extreme"
                    : "Not available",
                  gradient: "from-amber-500/20 to-orange-500/10",
                  border: "border-amber-500/20",
                },
                {
                  label: "Dew Point",
                  value: formatTemp(weather.main.temp - ((100 - weather.main.humidity) / 5), unit),
                  sub: "Estimated",
                  gradient: "from-blue-500/20 to-cyan-500/10",
                  border: "border-blue-500/20",
                },
                {
                  label: "Heat Index",
                  value: formatTemp(weather.main.feels_like, unit),
                  sub: "Apparent temp",
                  gradient: "from-red-500/20 to-pink-500/10",
                  border: "border-red-500/20",
                },
                {
                  label: "Wind Gust",
                  value: weather.wind.gust ? `${Math.round(weather.wind.gust * 3.6)} km/h` : "No gusts",
                  sub: "Max recorded",
                  gradient: "from-emerald-500/20 to-teal-500/10",
                  border: "border-emerald-500/20",
                },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  className={`glass rounded-2xl p-4 bg-gradient-to-br ${card.gradient} border ${card.border} cursor-default`}
                  whileHover={{ scale: 1.03, translateY: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-white/35 text-xs mb-1">{card.label}</p>
                  <p className="text-white font-bold text-xl">{card.value}</p>
                  <p className="text-white/25 text-xs mt-0.5">{card.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-6">
            <AQIWidget />
          </div>
        </div>

        {/* Second row: Map + Historical */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MapWidget />
          <HistoricalChart />
        </div>

        {/* Footer */}
        <motion.div
          className="text-center text-white/15 text-xs pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Data provided by OpenWeatherMap · Auto-refreshes based on your settings
        </motion.div>
      </main>
    </div>
  );
}
