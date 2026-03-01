"use client";

import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoNotificationsOutline, IoSettingsOutline } from "react-icons/io5";
import { RiLogoutBoxLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { MdOutlineDeviceThermostat } from "react-icons/md";
import Image from "next/image";
import { useState } from "react";
import { useAppStore, TempUnit } from "@/store/appStore";
import Link from "next/link";

const UNITS: { label: string; value: TempUnit }[] = [
  { label: "°C", value: "celsius" },
  { label: "°F", value: "fahrenheit" },
  { label: "K", value: "kelvin" },
];

export default function Navbar({ alertCount = 0 }: { alertCount?: number }) {
  const { data: session } = useSession();
  const { theme, toggleTheme, unit, setUnit } = useAppStore();
  const [unitOpen, setUnitOpen] = useState(false);

  return (
    <motion.header
      className="glass border-b border-white/5 sticky top-0 z-50"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ${theme === "dark" ? "bg-white/10" : "bg-white"}`}>
              <Image
                src="/logo.png"
                alt="WeatherAI Logo"
                width={48}
                height={48}
                className={`rounded-lg object-contain transition-all duration-300 ${theme === "dark" ? "brightness-0 invert opacity-90" : ""}`}
              />
            </div>
            <div>
              <span className="font-bold text-2xl gradient-text">WeatherAI</span>
              <span className="text-white/30 text-base block -mt-1">
                Dashboard <span className="text-white/20 text-xs ml-1 font-medium">by VIT AP University</span>
              </span>
            </div>
          </Link>

          {/* New Dashboard Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/solar" className="glass px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white transition-colors">
              Solar Analytics
            </Link>
            <Link href="/energy" className="glass px-4 py-2 rounded-lg text-sm font-semibold text-[#2d9da6] hover:text-teal-300 transition-colors">
              Electric Dash
            </Link>
          </nav>
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
          <button className="glass glass-hover w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors relative">
            <IoNotificationsOutline size={18} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {alertCount}
              </span>
            )}
            {alertCount === 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </button>

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
