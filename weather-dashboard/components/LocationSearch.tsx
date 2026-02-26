"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSearchOutline, IoLocationOutline } from "react-icons/io5";
import { useWeatherStore } from "@/store/weatherStore";

export default function LocationSearch() {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const { fetchAll, loading } = useWeatherStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    fetchAll(input.trim());
    setInput("");
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchAll(undefined, pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.error(err)
    );
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className={`relative flex items-center glass rounded-2xl transition-all duration-300 ${focused ? "ring-1 ring-blue-500/50 glow-blue" : ""}`}>
        <IoSearchOutline className="absolute left-4 text-white/30" size={18} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search city..."
          className="bg-transparent text-white placeholder-white/25 text-sm pl-10 pr-4 py-3 w-52 focus:outline-none"
        />
        <AnimatePresence>
          {input && (
            <motion.button
              type="submit"
              disabled={loading}
              className="mr-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              Go
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={handleGeolocate}
        className="glass glass-hover w-11 h-11 rounded-2xl flex items-center justify-center text-white/50 hover:text-blue-400 transition-colors"
        title="Use my location"
      >
        <IoLocationOutline size={20} />
      </button>
    </motion.form>
  );
}
