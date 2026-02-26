"use client";

import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore, convertTemp, unitSymbol } from "@/store/appStore";
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiFog } from "react-icons/wi";
import { MdOutlineWaterDrop } from "react-icons/md";
import { format } from "date-fns";
import { ForecastItem } from "@/types/weather";

const getWeatherIcon = (id: number) => {
  if (id >= 200 && id < 300) return <WiThunderstorm size={32} />;
  if (id >= 300 && id < 600) return <WiRain size={32} />;
  if (id >= 600 && id < 700) return <WiSnow size={32} />;
  if (id >= 700 && id < 800) return <WiFog size={32} />;
  if (id === 800) return <WiDaySunny size={32} />;
  return <WiCloudy size={32} />;
};

export default function HourlyForecast() {
  const { forecast, loading } = useWeatherStore();
  const { unit } = useAppStore();
  const sym = unitSymbol(unit);

  if (loading || !forecast) {
    return (
      <div className="glass rounded-3xl p-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded-xl w-1/4 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 w-20 bg-white/5 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const hourly = forecast.list.slice(0, 8);

  return (
    <motion.div
      className="glass rounded-3xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Hourly Forecast</h2>
        <span className="text-white/25 text-xs">Next 24h</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {hourly.map((item: ForecastItem, i) => {
          const isNow = i === 0;
          const rain = item.rain?.["3h"] ?? null;
          const snow = item.snow?.["3h"] ?? null;
          const precip = rain ?? snow;

          return (
            <motion.div
              key={item.dt}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-all cursor-default ${
                isNow
                  ? "bg-gradient-to-b from-blue-600/40 to-blue-800/20 border border-blue-500/30"
                  : "glass glass-hover"
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className={`text-xs font-medium ${isNow ? "text-blue-300" : "text-white/40"}`}>
                {isNow ? "Now" : format(new Date(item.dt * 1000), "ha")}
              </span>
              <span className={isNow ? "text-blue-300" : "text-white/60"}>
                {getWeatherIcon(item.weather[0].id)}
              </span>
              <span className="text-white font-semibold text-sm">
                {Math.round(convertTemp(item.main.temp, unit))}{sym}
              </span>
              <span className="text-white/25 text-xs">
                {item.main.humidity}%
              </span>
              {precip !== null && (
                <span className="flex items-center gap-0.5 text-blue-400 text-xs">
                  <MdOutlineWaterDrop size={11} />
                  {precip.toFixed(1)}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
