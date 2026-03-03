"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WiThermometer } from "react-icons/wi";
import { TbShieldCheck, TbChartAreaLine, TbWorldPin, TbCube3dSphere } from "react-icons/tb";
import { IoTimerOutline } from "react-icons/io5";

const options = [
  {
    icon: <WiThermometer size={48} />,
    title: "Environment",
    desc: "Real-time temperature & air quality",
    color: "text-orange-400",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.2)",
    href: "/dashboard"
  },
  {
    icon: <TbShieldCheck size={42} />,
    title: "Surveillance",
    desc: "Campus security & asset monitoring",
    color: "text-emerald-400",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
    href: "/surveillance"
  },
  {
    icon: <TbChartAreaLine size={42} />,
    title: "Energy Dashboard",
    desc: "Power consumption trends",
    color: "text-blue-400",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.2)",
    href: "/energy"
  },
  {
    icon: <IoTimerOutline size={42} />,
    title: "Water Dashboard",
    desc: "Water tracking metrics",
    color: "text-cyan-400",
    bg: "rgba(34,211,238,0.08)",
    border: "rgba(34,211,238,0.2)",
    href: "/water"
  },
  {
    icon: <TbWorldPin size={42} />,
    title: "Sustainability",
    desc: "Carbon footprint & eco-metrics",
    color: "text-purple-400",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
    href: "/sustainable"
  },
  {
    icon: <TbCube3dSphere size={42} />,
    title: "Digital Twin (3D)",
    desc: "Interactive 3D campus map",
    color: "text-rose-400",
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.2)",
    href: "/campus-map"
  },
];

export default function ModuleSelector({ onClose }: { onClose?: () => void }) {
  return (
    <div className="w-full relative">
      <div className="w-full relative z-10">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-3 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-[10px] font-medium tracking-wide">Live campus intelligence</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1 tracking-tight">Select <span className="gradient-text">Module</span></h1>
          <p className="text-white/40 text-[11px]">Choose a dashboard to enter SCAMS</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {options.map((opt, i) => (
            <Link key={opt.title} href={opt.href} onClick={onClose}>
              <motion.div
                className="flex items-center justify-start gap-4 rounded-2xl p-4 h-full glass relative overflow-hidden group hover:border-white/20 transition-all duration-300"
                style={{ background: opt.bg, border: `1px solid ${opt.border}` }}
                whileHover={{ y: -2, scale: 1.01 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.1 }}
              >
                {/* Inner hover glow */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className={`${opt.color} relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md`}>
                  {/* Resize icon slightly for row layout */}
                  <div className="scale-75 origin-left">{opt.icon}</div>
                </span>
                <div className="text-left relative z-10">
                  <h2 className="text-white text-sm font-bold mb-0.5 tracking-tight">{opt.title}</h2>
                  <p className="text-white/50 text-[10px] font-medium leading-snug">{opt.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
