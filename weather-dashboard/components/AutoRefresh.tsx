"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore } from "@/store/appStore";
import { IoRefreshOutline, IoTimerOutline } from "react-icons/io5";

export default function AutoRefresh() {
  const { fetchAll, city, loading } = useWeatherStore();
  const { autoRefreshInterval } = useAppStore();
  const [countdown, setCountdown] = useState(0);

  const refresh = useCallback(() => {
    fetchAll(city);
  }, [fetchAll, city]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) {
      setCountdown(0);
      return;
    }
    const totalSec = autoRefreshInterval * 60;
    setCountdown(totalSec);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refresh();
          return totalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, refresh]);

  if (autoRefreshInterval <= 0) return null;

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <motion.div
      className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 text-xs"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <IoTimerOutline size={14} className="text-blue-400" />
      <span className="text-white/40">
        Next refresh in{" "}
        <span className="text-white/70 font-mono font-semibold">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </span>
      <button
        onClick={refresh}
        disabled={loading}
        className="text-white/30 hover:text-white transition-colors disabled:opacity-30"
        title="Refresh now"
      >
        <IoRefreshOutline size={13} />
      </button>
    </motion.div>
  );
}
