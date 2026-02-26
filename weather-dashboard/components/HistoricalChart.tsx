"use client";

import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore, convertTemp, unitSymbol } from "@/store/appStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

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

export default function HistoricalChart() {
  const { forecast, loading } = useWeatherStore();
  const { unit } = useAppStore();
  const sym = unitSymbol(unit);

  if (loading || !forecast) {
    return (
      <div className="glass rounded-3xl p-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded-xl w-1/3 mb-4" />
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const data = forecast.list.slice(0, 16).map((item) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      time: `${dayName} ${hours}:00`,
      temp: Math.round(convertTemp(item.main.temp, unit)),
      pressure: item.main.pressure,
    };
  });

  return (
    <motion.div
      className="glass rounded-3xl p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <div>
        <h2 className="text-lg font-bold text-white">Temperature Trend</h2>
        <p className="text-white/30 text-xs mt-0.5">Extended forecast temperature</p>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="histTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} unit={sym} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temp" name="Temperature" stroke="#f97316" strokeWidth={2} fill="url(#histTempGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
