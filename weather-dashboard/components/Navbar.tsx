"use client";

import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoNotificationsOutline, IoSettingsOutline, IoWarningOutline, IoAlertCircleOutline, IoClose } from "react-icons/io5";
import { RiLogoutBoxLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { MdOutlineDeviceThermostat } from "react-icons/md";
import Image from "next/image";
import { useState } from "react";
import { useAppStore, TempUnit } from "@/store/appStore";
import { useWeatherStore } from "@/store/weatherStore";
import { getWeatherAlerts } from "@/types/weather";
import Link from "next/link";
import ModuleSelector from "@/components/ModuleSelector";
import { TbGridDots } from "react-icons/tb";

const UNITS: { label: string; value: TempUnit }[] = [
  { label: "°C", value: "celsius" },
  { label: "°F", value: "fahrenheit" },
  { label: "K", value: "kelvin" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme, unit, setUnit } = useAppStore();
  const { weather, airPollution } = useWeatherStore();

  const [unitOpen, setUnitOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const allAlerts = getWeatherAlerts(weather, airPollution);
  const alerts = allAlerts.filter((a) => !dismissed.includes(a.type));

  return (
    <motion.header
      className="glass border-b border-white/5 sticky top-0 z-50"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Nav Links */}
        <div className="flex flex-col items-start gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
              <Image
                src="/image-copy.png"
                alt="SCAMS Logo"
                width={80}
                height={48}
                className="rounded-lg object-contain transition-all duration-300"
              />
            </div>
            <div className="flex flex-col max-w-[180px] sm:max-w-[280px] md:max-w-[400px]">
              <div className="overflow-hidden whitespace-nowrap relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-default">
                  <span className="font-bold text-lg md:text-xl gradient-text leading-tight pr-8">Smart Campus Assets Monitoring System (SCAMS)</span>
                  <span className="font-bold text-lg md:text-xl gradient-text leading-tight pr-8">Smart Campus Assets Monitoring System (SCAMS)</span>
                </div>
              </div>
              <span className="text-white/40 text-[10px] md:text-xs font-medium tracking-wide ml-2 mt-0.5">
                Dashboard <span className="text-white/20 mx-1">•</span> by VIT AP University
              </span>
            </div>
          </Link>

          {/* Module Selector (Menu) - Under the logo/branding */}
          <div className="relative ml-[68px] lg:hidden">
            <button
              onClick={() => setModulesOpen((prev) => !prev)}
              className="glass glass-hover h-8 px-4 rounded-lg flex items-center gap-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all border border-blue-500/30 shadow-lg shadow-black/10 bg-black/5 dark:bg-white/5"
            >
              <TbGridDots size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold tracking-wider">DASHBOARDS</span>
            </button>
            <AnimatePresence>
              {modulesOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40"
                    onClick={() => setModulesOpen(false)}
                  />
                  <motion.div
                    className="absolute left-0 top-10 w-[85vw] max-w-2xl max-h-[80vh] overflow-y-auto glass p-6 rounded-2xl z-50 border border-white/10 shadow-2xl"
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                  >
                    <button
                      onClick={() => setModulesOpen(false)}
                      className="absolute top-4 right-4 p-1.5 rounded-full glass hover:bg-white/10 transition-colors z-50 text-white/50 hover:text-white"
                    >
                      <IoClose size={20} />
                    </button>
                    <ModuleSelector onClose={() => setModulesOpen(false)} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-amber-400 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <RiSunLine size={17} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <RiMoonLine size={17} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Unit toggle */}
          <div className="relative">
            <button
              onClick={() => setUnitOpen((o) => !o)}
              className="glass glass-hover h-9 px-3 rounded-xl flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
              title="Temperature unit"
            >
              <MdOutlineDeviceThermostat size={16} />
              <span className="text-xs font-semibold">{UNITS.find((u) => u.value === unit)?.label}</span>
            </button>
            <AnimatePresence>
              {unitOpen && (
                <motion.div
                  className="absolute right-0 top-11 glass rounded-xl overflow-hidden z-50 border border-white/10 shadow-xl"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {UNITS.map((u) => (
                    <button
                      key={u.value}
                      onClick={() => { setUnit(u.value); setUnitOpen(false); }}
                      className={`w-full px-4 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/10 ${unit === u.value ? "text-blue-400" : "text-white/60"}`}
                    >
                      {u.label} — {u.value.charAt(0).toUpperCase() + u.value.slice(1)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setAlertsOpen((prev) => !prev)}
              className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors relative"
            >
              <IoNotificationsOutline size={18} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
              {alerts.length === 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {alertsOpen && (
                <motion.div
                  className="absolute right-0 top-11 glass rounded-2xl overflow-hidden z-50 border border-white/10 shadow-2xl w-80 p-3 max-h-[400px] overflow-y-auto"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex justify-between items-center px-1 mb-2">
                    <h4 className="text-white font-semibold text-sm">Notifications</h4>
                    {alerts.length > 0 && (
                      <button onClick={() => setDismissed((prev) => [...prev, ...alerts.map((a) => a.type)])} className="text-[10px] text-white/50 hover:text-white transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>

                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                        <IoNotificationsOutline size={20} className="text-blue-400" />
                      </div>
                      <p className="text-white/80 font-medium text-sm">All Clear</p>
                      <p className="text-white/40 text-xs mt-0.5">No active weather warnings right now</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((alert) => (
                        <div
                          key={alert.type}
                          className="flex items-start gap-3 glass bg-white/5 rounded-xl p-3 border"
                          style={{ borderColor: `${alert.color}30` }}
                        >
                          <span style={{ color: alert.color }} className="mt-0.5 flex-shrink-0">
                            {alert.severity === "danger" ? <IoAlertCircleOutline size={18} /> : <IoWarningOutline size={18} />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-xs font-semibold leading-tight truncate" style={{ color: alert.color }}>
                                {alert.title}
                              </p>
                              <span
                                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{ color: alert.color, background: `${alert.color}15` }}
                              >
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-white/60 text-[11px] mt-1 leading-snug break-words">
                              {alert.message}
                            </p>
                          </div>
                          <button
                            onClick={() => setDismissed((prev) => [...prev, alert.type])}
                            className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
                          >
                            <IoClose size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title="Settings"
          >
            <IoSettingsOutline size={17} />
          </Link>

          {/* User info */}
          {session?.user && (
            <div className="flex items-center gap-3 glass rounded-xl px-3 py-1.5">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-blue-500/30"
                />
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-white/80 leading-none">{session.user.name}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{session.user.email}</p>
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <RiLogoutBoxLine size={16} />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
