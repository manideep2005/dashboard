"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { WiThermometer } from "react-icons/wi";
import { TbShieldCheck, TbChartAreaLine, TbWorldPin, TbCube3dSphere } from "react-icons/tb";
import { IoTimerOutline } from "react-icons/io5";

const navItems = [
    { icon: <WiThermometer size={22} />, title: "Environment", href: "/dashboard", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-500/20" },
    { icon: <TbShieldCheck size={20} />, title: "Surveillance", href: "/surveillance", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
    { icon: <TbChartAreaLine size={20} />, title: "Energy Dashboard", href: "/energy", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
    { icon: <IoTimerOutline size={20} />, title: "Water Dashboard", href: "/water", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10 dark:bg-cyan-500/20" },
    { icon: <TbWorldPin size={20} />, title: "Sustainability", href: "/sustainable", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
    { icon: <TbCube3dSphere size={20} />, title: "Digital Twin (3D)", href: "/campus-map", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 dark:bg-rose-500/20" },
];

export default function Sidebar() {
    const pathname = usePathname();

    if (pathname === "/login") return null;

    return (
        <div className="hidden lg:flex flex-col w-[260px] shrink-0 glass border-r border-black/5 dark:border-white/5 h-screen sticky top-0 bg-white/60 dark:bg-[#0a0f1e]/80 z-50">
            <div className="p-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 dark:text-white/30 mb-5 ml-2">App Modules</h2>
                <div className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isActive
                                            ? "bg-black/5 dark:bg-white/10 shadow-inner border border-black/5 dark:border-white/5"
                                            : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03] border border-transparent"
                                        }`}
                                >
                                    <div
                                        className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${isActive ? "border-black/5 dark:border-white/10 " + item.bg : "border-transparent bg-black/5 dark:bg-white/5"
                                            }`}
                                    >
                                        <span className={isActive ? item.color : "text-black/40 dark:text-white/40"}>{item.icon}</span>
                                    </div>
                                    <span
                                        className={`text-sm font-bold tracking-tight transition-colors ${isActive ? "text-black dark:text-white" : "text-black/60 dark:text-white/60"
                                            }`}
                                    >
                                        {item.title}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="mt-auto p-6">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/30 mb-1.5">System Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tracking-tight uppercase">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
