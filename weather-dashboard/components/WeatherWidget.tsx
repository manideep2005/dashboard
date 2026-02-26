"use client";

import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore, formatTemp, convertTemp, unitSymbol } from "@/store/appStore";
import {
  WiHumidity, WiStrongWind, WiBarometer, WiDaySunny, WiNightClear,
  WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog, WiRaindrops,
} from "react-icons/wi";
import { IoEyeOutline } from "react-icons/io5";
import { MdOutlineWaterDrop } from "react-icons/md";
import { format } from "date-fns";

const getWeatherIcon = (id: number, size = 80) => {
  const props = { size, className: "drop-shadow-lg" };
  if (id >= 200 && id < 300) return <WiThunderstorm {...props} />;
  if (id >= 300 && id < 400) return <WiRain {...props} />;
  if (id >= 500 && id < 600) return <WiRain {...props} />;
  if (id >= 600 && id < 700) return <WiSnow {...props} />;
  if (id >= 700 && id < 800) return <WiFog {...props} />;
  if (id === 800) return <WiDaySunny {...props} />;
  if (id > 800) return <WiCloudy {...props} />;
  return <WiDaySunny {...props} />;
};

const getWindDirection = (deg: number) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

export default function WeatherWidget() {
  const { weather, loading, error } = useWeatherStore();
  const { unit } = useAppStore();
  const sym = unitSymbol(unit);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6 h-full flex flex-col gap-4 animate-pulse">
        <div className="h-6 bg-white/5 rounded-xl w-1/3" />
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass rounded-3xl p-6 h-full flex items-center justify-center">
        <p className="text-white/30 text-sm">{error || "No weather data"}</p>
      </div>
    );
  }

  const weatherId = weather.weather[0].id;
  const sunrise = format(new Date(weather.sys.sunrise * 1000), "h:mm a");
  const sunset = format(new Date(weather.sys.sunset * 1000), "h:mm a");
  const rain1h = weather.rain?.["1h"] ?? null;
  const snow1h = weather.snow?.["1h"] ?? null;

  const dewPoint = Math.round(
    convertTemp(weather.main.temp - ((100 - weather.main.humidity) / 5), unit)
  );

  return (
    <motion.div
      className="glass rounded-3xl p-6 glow-blue flex flex-col gap-5"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {weather.name}
            <span className="text-white/40 text-lg font-normal ml-2">{weather.sys.country}</span>
          </h2>
          <p className="text-white/40 text-sm mt-0.5">{format(new Date(), "EEEE, MMM d · h:mm a")}</p>
        </div>
        <div className="text-blue-400 -mt-2">
          {getWeatherIcon(weatherId, 64)}
        </div>
      </div>

      {/* Temperature */}
      <div className="flex items-end gap-4">
        <div>
          <span className="text-7xl font-thin text-white tracking-tight">
            {Math.round(convertTemp(weather.main.temp, unit))}
          </span>
          <span className="text-3xl text-white/50">{sym}</span>
        </div>
        <div className="mb-3">
          <p className="text-white/70 capitalize font-medium">{weather.weather[0].description}</p>
          <p className="text-white/30 text-sm">Feels like {formatTemp(weather.main.feels_like, unit)}</p>
          <p className="text-white/25 text-xs mt-1">
            H:{formatTemp(weather.main.temp_max, unit)} / L:{formatTemp(weather.main.temp_min, unit)}
          </p>
        </div>
      </div>

      {/* Precipitation badge */}
      {(rain1h !== null || snow1h !== null) && (
        <motion.div
          className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5 border border-blue-500/20"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MdOutlineWaterDrop size={18} className="text-blue-400" />
          <span className="text-white/70 text-sm">
            {rain1h !== null ? `Rain: ${rain1h.toFixed(1)} mm/h` : `Snow: ${snow1h!.toFixed(1)} mm/h`}
          </span>
          <span className="ml-auto text-xs text-white/30">Last hour</span>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: <WiHumidity size={28} />,
            label: "Humidity",
            value: `${weather.main.humidity}%`,
            color: "text-blue-400",
          },
          {
            icon: <WiStrongWind size={28} />,
            label: "Wind",
            value: `${Math.round(weather.wind.speed * 3.6)} km/h ${getWindDirection(weather.wind.deg)}`,
            color: "text-cyan-400",
          },
          {
            icon: <WiBarometer size={28} />,
            label: "Pressure",
            value: `${weather.main.pressure} hPa`,
            color: "text-purple-400",
          },
          {
            icon: <IoEyeOutline size={20} />,
            label: "Visibility",
            value: `${(weather.visibility / 1000).toFixed(1)} km`,
            color: "text-emerald-400",
          },
          {
            icon: <WiRaindrops size={28} />,
            label: "Dew Point",
            value: `${dewPoint}${sym}`,
            color: "text-teal-400",
          },
          {
            icon: <WiCloudy size={28} />,
            label: "Cloud Cover",
            value: `${weather.clouds.all}%`,
            color: "text-slate-400",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="glass glass-hover rounded-2xl p-3 flex items-center gap-3 cursor-default"
            whileHover={{ scale: 1.02 }}
          >
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <p className="text-white/35 text-xs">{stat.label}</p>
              <p className="text-white/90 text-sm font-medium">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sunrise/Sunset */}
      <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <WiDaySunny size={28} className="text-amber-400" />
          <div>
            <p className="text-white/30 text-xs">Sunrise</p>
            <p className="text-white/80 text-sm font-medium">{sunrise}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex items-center gap-2">
          <WiNightClear size={28} className="text-indigo-400" />
          <div>
            <p className="text-white/30 text-xs">Sunset</p>
            <p className="text-white/80 text-sm font-medium">{sunset}</p>
          </div>
        </div>
        {weather.wind.gust != null && weather.wind.gust > 0 && (
          <>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-white/30 text-xs">Wind Gust</p>
                <p className="text-white/80 text-sm font-medium">{Math.round(weather.wind.gust * 3.6)} km/h</p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
