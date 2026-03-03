"use client";

import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, TempUnit, AlertChannel } from "@/store/appStore";
import { requestNotificationPermission, triggerPushNotification } from "@/lib/notifications";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import {
  IoArrowBack,
  IoPersonCircleOutline,
  IoMailOutline,
  IoNotificationsOutline,
  IoPhonePortraitOutline,
} from "react-icons/io5";
import { RiSunLine, RiMoonLine } from "react-icons/ri";
import {
  MdOutlineWarningAmber,
  MdOutlineAir,
  MdOutlineThermostat,
  MdOutlineWaterDrop,
  MdOutlineCloudQueue,
} from "react-icons/md";

const UNITS: { label: string; value: TempUnit; desc: string }[] = [
  { label: "\u00B0C", value: "celsius", desc: "Celsius" },
  { label: "\u00B0F", value: "fahrenheit", desc: "Fahrenheit" },
  { label: "K", value: "kelvin", desc: "Kelvin" },
];

const INTERVALS = [
  { label: "Off", value: 0 },
  { label: "1 min", value: 1 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
];

const CHANNELS: { label: string; value: AlertChannel; icon: React.ReactNode; desc: string }[] = [
  { label: "In-App", value: "in_app", icon: <IoNotificationsOutline size={18} />, desc: "Banner alerts inside the dashboard" },
  { label: "Email", value: "email", icon: <IoMailOutline size={18} />, desc: "Send alerts to your email address" },
  { label: "Push", value: "push", icon: <IoPhonePortraitOutline size={18} />, desc: "Browser push notifications" },
];

const ALERT_TYPES = [
  { key: "severeWeather" as const, label: "Severe Weather", desc: "Thunderstorms, heavy rain, snow", icon: <MdOutlineWarningAmber size={20} /> },
  { key: "highWind" as const, label: "High Wind", desc: "Wind speed above 40 km/h", icon: <MdOutlineAir size={20} /> },
  { key: "extremeTemp" as const, label: "Extreme Temperature", desc: "Below -10\u00B0C or above 40\u00B0C", icon: <MdOutlineThermostat size={20} /> },
  { key: "poorAQI" as const, label: "Poor Air Quality", desc: "AQI level 4 or above", icon: <MdOutlineCloudQueue size={20} /> },
  { key: "precipitation" as const, label: "Precipitation", desc: "Any rain or snow expected", icon: <MdOutlineWaterDrop size={20} /> },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-emerald-500" : "bg-white/10"
        }`}
    >
      <motion.div
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
        animate={{ left: enabled ? 30 : 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const {
    theme, toggleTheme,
    unit, setUnit,
    autoRefreshInterval, setAutoRefreshInterval,
    notificationsEnabled, setNotificationsEnabled,
    alertChannels, setAlertChannels,
    alertPreferences, setAlertPreference,
    favorites, removeFavorite,
  } = useAppStore();

  const toggleChannel = async (ch: AlertChannel) => {
    if (alertChannels.includes(ch)) {
      setAlertChannels(alertChannels.filter((c) => c !== ch));
    } else {
      if (ch === "push") {
        const permission = await requestNotificationPermission();
        if (permission !== "granted") {
          alert("Push notifications denied by the browser.");
          return;
        }
      }
      setAlertChannels([...alertChannels, ch]);
    }
  };

  const testPushNotification = async () => {
    // Generate a unique fake alert so it bypasses the daily debounce cache
    const randomId = Math.random().toString(36).substring(7);
    await triggerPushNotification({
      type: `test_${randomId}`,
      severity: "danger",
      title: "Test Push Notification",
      message: "This is a test notification to verify your device can receive alerts.",
      color: "#ef4444"
    });
  };

  return (
    <div className="min-h-screen bg-animated">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
          <IoArrowBack size={16} /> Back to Dashboard
        </Link>

        <motion.h1
          className="text-3xl font-bold gradient-text"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Settings
        </motion.h1>

        {/* Profile Section */}
        <motion.section
          className="glass rounded-3xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="text-white/80 font-semibold flex items-center gap-2">
            <IoPersonCircleOutline size={20} />
            Profile
          </h2>
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={56}
                height={56}
                className="rounded-2xl ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-lg truncate">
                {session?.user?.name || "Guest User"}
              </p>
              <p className="text-white/40 text-sm truncate">
                {session?.user?.email || "Not signed in"}
              </p>
            </div>
          </div>
          {session?.user && (
            <div className="glass rounded-xl px-4 py-3 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-xs">Name</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{session.user.name}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs">Email</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5 truncate">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs">Provider</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">Google</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs">Status</p>
                  <p className="text-emerald-400 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* Appearance */}
        <motion.section
          className="glass rounded-3xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-white/80 font-semibold flex items-center gap-2">
            {theme === "dark" ? <RiMoonLine size={18} /> : <RiSunLine size={18} />}
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Theme</p>
              <p className="text-white/30 text-xs mt-0.5">Switch between dark and light mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors ${theme === "dark" ? "bg-blue-600" : "bg-amber-400"
                }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center"
                animate={{ left: theme === "dark" ? 4 : 30 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {theme === "dark" ? <RiMoonLine size={12} className="text-blue-600" /> : <RiSunLine size={12} className="text-amber-500" />}
              </motion.div>
            </button>
          </div>
        </motion.section>

        {/* Temperature Unit */}
        <motion.section
          className="glass rounded-3xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-white/80 font-semibold">Temperature Unit</h2>
          <div className="flex gap-3">
            {UNITS.map((u) => (
              <button
                key={u.value}
                onClick={() => setUnit(u.value)}
                className={`flex-1 glass rounded-2xl p-4 text-center transition-all border ${unit === u.value
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
                  }`}
              >
                <p className="text-2xl font-bold">{u.label}</p>
                <p className="text-xs mt-1 opacity-60">{u.desc}</p>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Auto Refresh */}
        <motion.section
          className="glass rounded-3xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white/80 font-semibold">Auto Refresh</h2>
          <p className="text-white/30 text-xs">Automatically refresh weather data at a set interval</p>
          <div className="flex flex-wrap gap-2">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                onClick={() => setAutoRefreshInterval(iv.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${autoRefreshInterval === iv.value
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "glass border-transparent text-white/50 hover:text-white"
                  }`}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Notification Alerts */}
        <motion.section
          className="glass rounded-3xl p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-white/80 font-semibold flex items-center gap-2">
              <IoNotificationsOutline size={20} />
              Notification Alerts
            </h2>
            <Toggle
              enabled={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          </div>

          {notificationsEnabled && (
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {/* Delivery Channels */}
              <div className="space-y-3">
                <p className="text-white/50 text-sm font-medium">How should alerts be sent?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CHANNELS.map((ch) => {
                    const active = alertChannels.includes(ch.value);
                    return (
                      <button
                        key={ch.value}
                        onClick={() => toggleChannel(ch.value)}
                        className={`glass rounded-2xl p-4 text-left transition-all border ${active
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-transparent hover:bg-white/5"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={active ? "text-blue-400" : "text-white/40"}>
                              {ch.icon}
                            </span>
                            <span className={`text-sm font-semibold ${active ? "text-blue-400" : "text-white/60"}`}>
                              {ch.label}
                            </span>
                          </div>
                          {ch.value === "push" && active && (
                            <button
                              onClick={(e) => { e.stopPropagation(); testPushNotification(); }}
                              className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/40 transition-colors"
                            >
                              Test
                            </button>
                          )}
                        </div>
                        <p className="text-white/30 text-xs leading-relaxed">{ch.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Types */}
              <div className="space-y-3">
                <p className="text-white/50 text-sm font-medium">What should trigger an alert?</p>
                <div className="space-y-2">
                  {ALERT_TYPES.map((alert) => (
                    <div
                      key={alert.key}
                      className="flex items-center justify-between glass rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={alertPreferences[alert.key] ? "text-blue-400" : "text-white/30"}>
                          {alert.icon}
                        </span>
                        <div>
                          <p className="text-white/70 text-sm font-medium">{alert.label}</p>
                          <p className="text-white/30 text-xs mt-0.5">{alert.desc}</p>
                        </div>
                      </div>
                      <Toggle
                        enabled={alertPreferences[alert.key]}
                        onChange={() => setAlertPreference(alert.key, !alertPreferences[alert.key])}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Email notification note */}
              {alertChannels.includes("email") && session?.user?.email && (
                <div className="glass rounded-xl px-4 py-3 border border-blue-500/20">
                  <p className="text-white/50 text-xs">
                    <IoMailOutline size={14} className="inline mr-1.5 -mt-0.5" />
                    Email alerts will be sent to <span className="text-blue-400 font-medium">{session.user.email}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.section>

        {/* Saved Locations */}
        <motion.section
          className="glass rounded-3xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white/80 font-semibold">Saved Locations</h2>
          {favorites.length === 0 ? (
            <p className="text-white/30 text-sm">No saved locations yet. Star a city on the dashboard to save it.</p>
          ) : (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <div key={fav} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                  <span className="text-white/70 text-sm font-medium">{fav}</span>
                  <button
                    onClick={() => removeFavorite(fav)}
                    className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.p
          className="text-center text-white/15 text-xs pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          WeatherAI Dashboard v2.0 <span className="mx-1">&bull;</span> <span className="text-white/20 font-medium">by VIT AP University</span>
        </motion.p>
      </main>
    </div>
  );
}
