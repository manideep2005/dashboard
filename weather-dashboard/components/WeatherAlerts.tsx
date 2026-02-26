"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WeatherAlert } from "@/types/weather";
import { useState } from "react";
import { IoWarningOutline, IoClose, IoAlertCircleOutline } from "react-icons/io5";

export default function WeatherAlerts({ alerts }: { alerts: WeatherAlert[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = alerts.filter((a) => !dismissed.includes(a.type));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {visible.map((alert) => (
          <motion.div
            key={alert.type}
            className="flex items-center gap-3 glass rounded-2xl px-5 py-3 border"
            style={{ borderColor: `${alert.color}30` }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <span style={{ color: alert.color }}>
              {alert.severity === "danger" ? <IoAlertCircleOutline size={20} /> : <IoWarningOutline size={20} />}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: alert.color }}>
                {alert.title}
              </p>
              <p className="text-white/40 text-xs mt-0.5">{alert.message}</p>
            </div>
            <span
              className="text-xs font-bold uppercase px-2 py-0.5 rounded-lg"
              style={{ color: alert.color, background: `${alert.color}15` }}
            >
              {alert.severity}
            </span>
            <button
              onClick={() => setDismissed((prev) => [...prev, alert.type])}
              className="text-white/20 hover:text-white/60 transition-colors ml-1"
            >
              <IoClose size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
