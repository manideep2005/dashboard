"use client";

import dynamic from "next/dynamic";
import { useWeatherStore } from "@/store/weatherStore";
import { motion } from "framer-motion";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export default function MapWidget() {
  const { weather, loading } = useWeatherStore();

  if (loading || !weather) {
    return (
      <div className="glass rounded-3xl p-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded-xl w-1/3 mb-4" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="glass rounded-3xl p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Weather Radar</h2>
          <p className="text-white/30 text-xs mt-0.5">Precipitation & cloud overlay</p>
        </div>
      </div>
      <div className="h-64 rounded-2xl overflow-hidden">
        <MapInner lat={weather.coord.lat} lon={weather.coord.lon} />
      </div>
    </motion.div>
  );
}
