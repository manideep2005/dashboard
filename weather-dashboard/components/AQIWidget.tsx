"use client";

import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { AQI_LEVELS, getAQILevelIndex } from "@/types/weather";
import { calculateInternationalAQI } from "@/lib/aqi";

const PollutantBar = ({ label, value, max, unit, color }: {
  label: string; value: number; max: number; unit: string; color: string;
}) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-white/50 text-xs font-medium">{label}</span>
        <span className="text-white/80 text-xs font-semibold">{value.toFixed(1)} <span className="text-white/30">{unit}</span></span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
};

const AQIGauge = ({ aqi, maxAqi = 500 }: { aqi: number; maxAqi?: number }) => {
  const levelIndex = getAQILevelIndex(aqi);
  const level = AQI_LEVELS[levelIndex] || AQI_LEVELS[3];

  const boundedAqi = Math.min(Math.max(aqi, 0), maxAqi);
  const rotation = -135 + (boundedAqi / maxAqi) * 270;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-20 overflow-hidden">
        {/* Semi-circle background */}
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Track segments */}
          {[
            { color: "#10b981", d: "M 10 60 A 50 50 0 0 1 16.7 35" },
            { color: "#eab308", d: "M 16.7 35 A 50 50 0 0 1 35 16.7" },
            { color: "#f97316", d: "M 35 16.7 A 50 50 0 0 1 60 10" },
            { color: "#ef4444", d: "M 60 10 A 50 50 0 0 1 85 16.7" },
            { color: "#8b5cf6", d: "M 85 16.7 A 50 50 0 0 1 103.3 35" },
            { color: "#7f1d1d", d: "M 103.3 35 A 50 50 0 0 1 110 60" },
          ].map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth="8"
              strokeLinecap="round"
              opacity={0.3}
            />
          ))}
          {/* Active segment highlight */}
          <path
            d={[
              "M 10 60 A 50 50 0 0 1 16.7 35",
              "M 16.7 35 A 50 50 0 0 1 35 16.7",
              "M 35 16.7 A 50 50 0 0 1 60 10",
              "M 60 10 A 50 50 0 0 1 85 16.7",
              "M 85 16.7 A 50 50 0 0 1 103.3 35",
              "M 103.3 35 A 50 50 0 0 1 110 60",
            ][levelIndex - 1]}
            fill="none"
            stroke={level.color}
            strokeWidth="8"
            strokeLinecap="round"
            opacity={1}
          />
          {/* Needle */}
          <g transform={`rotate(${rotation}, 60, 60)`}>
            <line x1="60" y1="60" x2="60" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
            <circle cx="60" cy="60" r="4" fill="white" opacity={0.9} />
          </g>
        </svg>
      </div>
      {/* AQI value */}
      <div className="text-center">
        <div className="text-4xl font-thin text-white">{aqi}</div>
        <div
          className="text-sm font-semibold px-3 py-1 rounded-full mt-1"
          style={{ color: level.color, background: level.bg }}
        >
          {level.label}
        </div>
        <p className="text-white/30 text-[11px] mt-1.5 max-w-[200px] leading-tight text-balance mx-auto">{level.description}</p>
      </div>
    </div>
  );
};

export default function AQIWidget() {
  const { airPollution, loading, error } = useWeatherStore();

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6 h-full flex flex-col gap-4 animate-pulse">
        <div className="h-6 bg-white/5 rounded-xl w-1/3" />
        <div className="h-40 bg-white/5 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !airPollution) {
    return (
      <div className="glass rounded-3xl p-6 h-full flex items-center justify-center">
        <p className="text-white/30 text-sm">No air quality data</p>
      </div>
    );
  }

  const data = airPollution.list[0];
  const { co, no2, o3, so2, pm2_5, pm10 } = data.components;

  const { aqi, dominantPollutant } = calculateInternationalAQI({ co, no2, o3, so2, pm2_5, pm10 });
  const levelIndex = getAQILevelIndex(aqi);
  const level = AQI_LEVELS[levelIndex] || AQI_LEVELS[3];

  return (
    <motion.div
      className="glass rounded-3xl p-6 flex flex-col gap-5"
      style={{ boxShadow: `0 0 40px ${level.color}18` }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Air Quality Index</h2>
          <p className="text-white/30 text-xs mt-0.5">Real-time US EPA standard</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className="text-xs font-medium px-3 py-1.5 rounded-xl border whitespace-nowrap"
            style={{ color: level.color, borderColor: `${level.color}40`, background: level.bg }}
          >
            AQI {aqi} / 500
          </div>
          {dominantPollutant && dominantPollutant !== 'Unknown' && (
            <p className="text-white/40 text-[10px] uppercase font-semibold">Primary: {dominantPollutant}</p>
          )}
        </div>
      </div>

      {/* Gauge */}
      <div className="flex justify-center py-2">
        <AQIGauge aqi={aqi} />
      </div>

      {/* Pollutant bars */}
      <div className="space-y-3">
        <p className="text-white/25 text-xs uppercase tracking-widest font-medium">Pollutants</p>
        <PollutantBar label="PM2.5" value={pm2_5} max={150} unit="μg/m³" color="#f97316" />
        <PollutantBar label="PM10" value={pm10} max={300} unit="μg/m³" color="#f59e0b" />
        <PollutantBar label="NO₂" value={no2} max={200} unit="μg/m³" color="#8b5cf6" />
        <PollutantBar label="O₃" value={o3} max={180} unit="μg/m³" color="#06b6d4" />
        <PollutantBar label="SO₂" value={so2} max={350} unit="μg/m³" color="#ec4899" />
        <PollutantBar label="CO" value={co / 1000} max={30} unit="mg/m³" color="#10b981" />
      </div>
    </motion.div>
  );
}
