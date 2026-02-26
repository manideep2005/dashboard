"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/weatherStore";
import { useAppStore, formatTemp } from "@/store/appStore";
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiFog } from "react-icons/wi";
import { IoSparkles } from "react-icons/io5";

const getConditionSummary = (id: number): string => {
  if (id >= 200 && id < 300) return "thunderstorms";
  if (id >= 300 && id < 400) return "drizzle";
  if (id >= 500 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "foggy conditions";
  if (id === 800) return "clear skies";
  return "cloudy skies";
};

const getWeatherIcon = (id: number) => {
  const props = { size: 24 };
  if (id >= 200 && id < 300) return <WiThunderstorm {...props} />;
  if (id >= 300 && id < 600) return <WiRain {...props} />;
  if (id >= 600 && id < 700) return <WiSnow {...props} />;
  if (id >= 700 && id < 800) return <WiFog {...props} />;
  if (id === 800) return <WiDaySunny {...props} />;
  return <WiCloudy {...props} />;
};

export default function AISummary() {
  const { weather, forecast, loading } = useWeatherStore();
  const { unit } = useAppStore();
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!weather || !forecast) return;

    const condition = getConditionSummary(weather.weather[0].id);
    const temp = formatTemp(weather.main.temp, unit);
    const feelsLike = formatTemp(weather.main.feels_like, unit);
    const windKmh = Math.round(weather.wind.speed * 3.6);
    const humidity = weather.main.humidity;

    const nextItems = forecast.list.slice(0, 8);
    const temps = nextItems.map((i) => i.main.temp);
    const maxTemp = formatTemp(Math.max(...temps), unit);
    const minTemp = formatTemp(Math.min(...temps), unit);
    const willRain = nextItems.some((i) => i.weather[0].id >= 300 && i.weather[0].id < 700);

    let windAdvice = "";
    if (windKmh > 40) windAdvice = " Strong winds expected — take caution outdoors.";
    else if (windKmh > 25) windAdvice = " Moderate winds may affect outdoor plans.";

    let humidityNote = "";
    if (humidity > 80) humidityNote = " Humidity is high, making it feel warmer than usual.";
    else if (humidity < 30) humidityNote = " The air is quite dry — stay hydrated.";

    const rainNote = willRain ? " Rain is expected in the coming hours, so keep an umbrella handy." : "";

    const summary = `Currently ${temp} with ${condition} in ${weather.name}. Feels like ${feelsLike}. Wind at ${windKmh} km/h.${windAdvice}${humidityNote}${rainNote} Over the next 24 hours, expect highs of ${maxTemp} and lows of ${minTemp}.`;

    setDisplayText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(summary.slice(0, i + 1));
      i++;
      if (i >= summary.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather?.name, weather?.main.temp, weather?.wind.speed, weather?.main.humidity, forecast?.list?.[0]?.dt, unit]);

  if (loading || !weather || !forecast) {
    return (
      <div className="glass rounded-3xl p-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded-xl w-1/3 mb-3" />
        <div className="h-16 bg-white/5 rounded-xl" />
      </div>
    );
  }

  const weatherId = weather.weather[0].id;

  return (
    <motion.div
      className="glass rounded-3xl p-6 glow-purple flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <div className="flex items-center gap-2">
        <IoSparkles className="text-purple-400" size={18} />
        <h2 className="text-lg font-bold text-white">AI Weather Briefing</h2>
        <span className="text-purple-400 ml-auto">{getWeatherIcon(weatherId)}</span>
      </div>
      <p className="text-white/60 text-sm leading-relaxed">
        {displayText}
        {isTyping && <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <IoSparkles className="text-white/20" size={10} />
        <span className="text-white/20 text-xs">AI-generated summary based on current data</span>
      </div>
    </motion.div>
  );
}
