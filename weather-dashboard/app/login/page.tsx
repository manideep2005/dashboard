"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  WiDaySunny, WiRain, WiStrongWind, WiCloudy,
  WiThermometer, WiNightClear, WiSnow,
} from "react-icons/wi";
import { MdAir } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { TbShieldCheck, TbWorldPin, TbChartAreaLine } from "react-icons/tb";
import { IoArrowForward } from "react-icons/io5";
import { useAppStore } from "@/store/appStore";

import Image from "next/image";

const features = [
  {
    icon: <WiThermometer size={28} />,
    title: "Environment",
    desc: "Real-time temperature & air quality",
    color: "text-orange-400",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.2)",
  },
  {
    icon: <TbShieldCheck size={22} />,
    title: "Surveillance",
    desc: "Campus security & asset monitoring",
    color: "text-emerald-400",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
  },
  {
    icon: <TbChartAreaLine size={22} />,
    title: "Energy & Water",
    desc: "Power consumption, solar tracking & water usage",
    color: "text-blue-400",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.2)",
  },
  {
    icon: <TbWorldPin size={22} />,
    title: "Sustainability",
    desc: "Carbon footprint & eco-metrics",
    color: "text-purple-400",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
  },
];

const worldCities = [
  { city: "New York", tz: "America/New_York", temp: "18°C", icon: <WiDaySunny size={20} />, color: "#fb923c" },
  { city: "London", tz: "Europe/London", temp: "12°C", icon: <WiRain size={20} />, color: "#60a5fa" },
  { city: "Tokyo", tz: "Asia/Tokyo", temp: "22°C", icon: <WiCloudy size={20} />, color: "#a78bfa" },
  { city: "Dubai", tz: "Asia/Dubai", temp: "38°C", icon: <WiDaySunny size={20} />, color: "#facc15" },
  { city: "Sydney", tz: "Australia/Sydney", temp: "25°C", icon: <WiDaySunny size={20} />, color: "#34d399" },
  { city: "Paris", tz: "Europe/Paris", temp: "15°C", icon: <WiNightClear size={20} />, color: "#818cf8" },
  { city: "Mumbai", tz: "Asia/Kolkata", temp: "32°C", icon: <WiCloudy size={20} />, color: "#f472b6" },
  { city: "Toronto", tz: "America/Toronto", temp: "9°C", icon: <WiSnow size={20} />, color: "#22d3ee" },
];

function CityTimeCard({ city, tz, temp, icon, color }: {
  city: string; tz: string; temp: string; icon: React.ReactNode; color: string;
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-US", {
        timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: true,
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [tz]);

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 glass"
      style={{ borderColor: `${color}20` }}
    >
      <span style={{ color }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm font-semibold leading-none truncate">{city}</p>
        <p className="text-white/30 text-xs mt-0.5">{time}</p>
      </div>
      <span className="text-white/60 text-sm font-bold" style={{ color }}>{temp}</span>
    </div>
  );
}

function RadarPulse() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center mx-auto mb-8">
      {/* Outer rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-blue-500/20"
          style={{ width: `${(i + 1) * 25}%`, height: `${(i + 1) * 25}%` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* Rotating sweep line */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute top-1/2 left-1/2 origin-left h-px w-1/2"
          style={{
            background: "linear-gradient(90deg, rgba(96,165,250,0.8), transparent)",
            transform: "translateY(-50%)",
          }}
        />
      </motion.div>

      {/* Sweep glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          background: "conic-gradient(from 0deg, transparent 70%, rgba(96,165,250,0.15) 100%)",
        }}
      />

      {/* Dot blips */}
      {[
        { top: "25%", left: "60%", color: "#34d399", size: 6 },
        { top: "55%", left: "30%", color: "#f472b6", size: 4 },
        { top: "70%", left: "65%", color: "#facc15", size: 5 },
        { top: "35%", left: "75%", color: "#60a5fa", size: 4 },
        { top: "60%", left: "50%", color: "#a78bfa", size: 6 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: dot.top, left: dot.left,
            width: dot.size, height: dot.size,
            background: dot.color,
            boxShadow: `0 0 8px ${dot.color}`,
          }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
        />
      ))}

      {/* Center dot */}
      <div className="w-3 h-3 rounded-full bg-blue-400 relative z-10"
        style={{ boxShadow: "0 0 12px #60a5fa" }}
      />

      {/* Center label */}
      <div className="absolute bottom-4 text-center">
        <p className="text-white/25 text-xs tracking-widest uppercase">Live Radar</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { theme } = useAppStore();

  return (
    <div className="min-h-[100dvh] lg:min-h-screen bg-animated flex flex-col lg:flex-row relative overflow-hidden">

      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-purple-500/8 blur-3xl pointer-events-none" />
      <div className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full bg-emerald-500/6 blur-3xl pointer-events-none" />

      {/* ── LEFT SIDE ── */}
      <div className="flex z-10 lg:flex-col flex-col justify-center flex-1 px-6 lg:px-16 pt-8 lg:pt-0 relative overflow-hidden text-center lg:text-left">

        {/* Hero text */}
        <motion.div
          className="relative z-10 mt-8 lg:mt-0 max-w-lg mx-auto lg:mx-0 lg:mb-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 lg:mb-6 border border-blue-500/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-xs font-medium tracking-wide">Live campus intelligence</span>
          </motion.div>

          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-2 lg:mb-4">
            Smart Campus<br />
            <span className="gradient-text">Assets Monitoring System</span><br />
            (SCAMS)
          </h1>

          <p className="text-white/40 text-sm lg:text-lg leading-relaxed">
            Real-time environmental, surveillance & resource monitoring
            for your campus infrastructure.
            <br />
            <span className="text-white/30 text-xs lg:text-sm mt-1 lg:mt-2 block font-medium">by VIT AP University</span>
          </p>
        </motion.div>

        {/* Radar */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <RadarPulse />
        </motion.div>

        {/* World city clocks strip */}
        <motion.div
          className="hidden lg:grid grid-cols-2 gap-3 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="col-span-2 text-white/20 text-xs uppercase tracking-widest mb-1">
            World Cities — Live Time & Weather
          </p>
          {worldCities.map((c) => (
            <CityTimeCard key={c.city} {...c} />
          ))}
        </motion.div>

        {/* Bottom weather icons */}
        <div className="hidden lg:flex absolute bottom-10 left-16 gap-5 opacity-10">
          {[WiDaySunny, WiRain, WiStrongWind, WiNightClear, WiSnow, WiCloudy].map((Icon, i) => (
            <motion.div
              key={i}
              className="text-5xl text-white"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
            >
              <Icon />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── RIGHT SIDE (sign in card) ── */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full lg:w-[460px] lg:flex-shrink-0 px-6 py-8 lg:py-12 relative">
        <div className="absolute inset-0 glass border-l border-white/5 hidden lg:block" />

        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            className="hidden lg:flex items-center justify-center mb-10 -mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Image
              src="/image-copy.png"
              alt="SCAMS Logo"
              width={220}
              height={80}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Headline */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/35 text-sm">Sign in to access your SCAMS dashboard</p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center gap-3 bg-white text-gray-800 font-semibold py-4 px-6 rounded-2xl shadow-xl shadow-black/20 mb-4"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <FcGoogle size={22} />
              <span>Continue with Google</span>
              <IoArrowForward size={16} className="ml-auto text-gray-400" />
            </motion.button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/20 text-xs">New here?</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <motion.button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 glass border border-white/10 text-white/70 font-medium py-4 px-6 rounded-2xl hover:text-white hover:border-white/20 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FcGoogle size={22} />
              <span>Create a free account</span>
            </motion.button>
          </motion.div>

          {/* Features */}
          <motion.div
            className="mt-8 space-y-2.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                className="flex items-center gap-3 rounded-2xl p-3"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}
                whileHover={{ scale: 1.02 }}
              >
                <span className={`${f.color} flex-shrink-0`}>{f.icon}</span>
                <div>
                  <p className="text-white/80 text-sm font-medium leading-none">{f.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">{f.desc}</p>
                </div>
                <TbShieldCheck className="ml-auto text-white/15 flex-shrink-0" size={16} />
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="text-center text-white/15 text-xs mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            By signing in you agree to our Terms & Privacy Policy.
            <br />Powered by OpenWeatherMap API &bull; <span className="text-white/20 font-medium">by VIT AP University</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
