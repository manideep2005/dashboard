"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/appStore";
import { useWeatherStore } from "@/store/weatherStore";
import { IoClose, IoStar, IoStarOutline } from "react-icons/io5";

export default function FavoritesBar() {
  const { favorites, removeFavorite, addFavorite } = useAppStore();
  const { fetchAll, city, weather } = useWeatherStore();

  const currentCity = weather?.name || city;
  const isFav = favorites.some((f) => f.toLowerCase() === currentCity.toLowerCase());

  return (
    <motion.div
      className="flex items-center gap-2 flex-wrap"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <button
        onClick={() =>
          isFav ? removeFavorite(currentCity) : addFavorite(currentCity)
        }
        className="glass glass-hover h-9 px-3 rounded-xl flex items-center gap-1.5 text-white/50 hover:text-amber-400 transition-colors text-xs font-medium"
        title={isFav ? "Remove from favorites" : "Save to favorites"}
      >
        {isFav ? (
          <IoStar size={14} className="text-amber-400" />
        ) : (
          <IoStarOutline size={14} />
        )}
        <span className="hidden sm:inline">{isFav ? "Saved" : "Save"}</span>
      </button>

      <AnimatePresence>
        {favorites.map((fav) => (
          <motion.button
            key={fav}
            className={`glass glass-hover h-8 px-3 rounded-xl flex items-center gap-2 text-xs font-medium transition-colors ${
              fav.toLowerCase() === currentCity.toLowerCase()
                ? "text-blue-400 border-blue-500/30"
                : "text-white/50 hover:text-white"
            }`}
            onClick={() => fetchAll(fav)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
          >
            <IoStar size={10} className="text-amber-400" />
            {fav}
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeFavorite(fav);
              }}
              className="text-white/20 hover:text-red-400 transition-colors ml-0.5"
            >
              <IoClose size={12} />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
