"use client";

import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore, convertTemp, unitSymbol } from "@/store/appStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-white/10">
        <p className="text-white/50 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastChart() {
  const { forecast, loading } = useWeatherStore();
  const { unit } = useAppStore();
  const sym = unitSymbol(unit);

  if (loading || !forecast) {
    return (
      <div className="glass rounded-3xl p-6 animate-pulse">
        <div className="h-6 bg-white/5 rounded-xl w-1/3 mb-6" />
        <div className="h-52 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const chartData = forecast.list
    .filter((_: unknown, i: number) => i % 3 === 0)
    .slice(0, 8)
    .map((item) => ({
      time: format(new Date(item.dt * 1000), "EEE ha"),
      temp: Math.round(convertTemp(item.main.temp, unit)),
      feels: Math.round(convertTemp(item.main.feels_like, unit)),
      humidity: item.main.humidity,
      wind: Math.round(item.wind.speed * 3.6),
    }));

  return (
    <motion.div
      className="glass rounded-3xl p-6 flex flex-col gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div>
        <h2 className="text-lg font-bold text-white">5-Day Forecast</h2>
        <p className="text-white/30 text-xs mt-0.5">Temperature & feels like trend</p>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} unit={sym} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temp" name={`Temp (${sym})`} stroke="#3b82f6" strokeWidth={2} fill="url(#tempGrad)" dot={false} />
            <Area type="monotone" dataKey="feels" name={`Feels (${sym})`} stroke="#8b5cf6" strokeWidth={2} fill="url(#feelsGrad)" dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-white/25 text-xs uppercase tracking-widest font-medium mb-3">Humidity & Wind</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }} />
              <Bar dataKey="humidity" name="Humidity %" fill="#06b6d4" radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="wind" name="Wind km/h" fill="#10b981" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
