"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BuildingData, CAMPUS_DATA } from "@/components/map/CampusGoogleMap";
import { motion, AnimatePresence } from "framer-motion";
import { WiThermometer } from "react-icons/wi";
import { IoWaterOutline } from "react-icons/io5";
import { TbPlugConnected, TbActivityHeartbeat, TbUsers, TbBuildingCommunity, TbChevronRight, TbX, TbSearch } from "react-icons/tb";

const CampusMapDynamic = dynamic(() => import("@/components/map/CampusGoogleMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-[#0a0e1a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/40 text-sm tracking-wider">Loading Google Maps Digital Twin...</span>
            </div>
        </div>
    ),
});

function StatusBadge({ status }: { status: string }) {
    const config = {
        normal: { bg: "dark:bg-emerald-500/10 bg-emerald-500/20", text: "dark:text-emerald-400 text-emerald-600", border: "dark:border-emerald-500/20 border-emerald-500/40", label: "Live / Operational" },
        warning: { bg: "dark:bg-amber-500/10 bg-amber-500/20", text: "dark:text-amber-400 text-amber-600", border: "dark:border-amber-500/20 border-amber-500/40", label: "System Warning" },
        critical: { bg: "dark:bg-red-500/10 bg-red-500/20", text: "dark:text-red-400 text-red-600", border: "dark:border-red-500/20 border-red-500/40", label: "Critical Failure" },
    }[status] || { bg: "dark:bg-gray-500/10 bg-gray-500/20", text: "dark:text-gray-400 text-gray-600", border: "dark:border-gray-500/20 border-gray-500/40", label: "Offline" };
    return (
        <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border-l-2 ${config.bg} ${config.text} ${config.border}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse" />
            {config.label}
        </span>
    );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className="group relative dark:bg-gradient-to-br dark:from-[#111827]/80 dark:to-[#0d121f]/90 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl hover:shadow-[0_8px_30px_-12px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] rounded-xl p-5 border border-black/5 dark:border-white/[0.05] hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            {/* HUD Corner Accents */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black/20 dark:border-white/20 group-hover:border-cyan-400/80 transition-colors" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black/20 dark:border-white/20 group-hover:border-cyan-400/80 transition-colors" />

            {/* Glowing Icon Pad */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/5 blur-[30px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl dark:bg-white/[0.04] bg-black/[0.04] backdrop-blur-md border border-black/5 dark:border-white/5 shadow-inner ${color} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-4 dark:bg-white/[0.08] bg-black/[0.15] rounded-full group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee] transition-all" />
                    <div className="w-1.5 h-4 dark:bg-white/[0.08] bg-black/[0.15] rounded-full group-hover:bg-cyan-500/60 transition-all delay-75" />
                    <div className="w-1.5 h-4 dark:bg-white/[0.08] bg-black/[0.15] rounded-full group-hover:bg-cyan-600/40 transition-all delay-150" />
                </div>
            </div>

            <div className="relative z-10">
                <span className="dark:text-white/40 text-black/50 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-light dark:text-white text-black tracking-tighter group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors drop-shadow-sm">{value.split(' ')[0]}</span>
                    {value.split(' ')[1] && <span className="text-xs font-bold dark:text-white/30 text-black/40 uppercase tracking-widest">{value.split(' ')[1]}</span>}
                </div>
            </div>

            {/* Premium Thick Scanning Line Effect on Hover */}
            <motion.div
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                animate={{ top: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

function BuildingListItem({ building, isSelected, onClick }: { building: BuildingData; isSelected: boolean; onClick: () => void }) {
    const statusColor = building.metrics.status === "critical" ? "text-red-500 dark:text-red-400" : building.metrics.status === "warning" ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400";
    const statusBg = building.metrics.status === "critical" ? "bg-red-400/20" : building.metrics.status === "warning" ? "bg-amber-400/20" : "bg-emerald-400/20";
    const glowColor = building.metrics.status === "critical" ? "rgba(239,68,68,0.3)" : building.metrics.status === "warning" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)";

    return (
        <button onClick={onClick} className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-400 border overflow-hidden ${isSelected ? "bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/40 shadow-[0_0_20px_-5px_rgba(6,182,212,0.2)]" : "hover:bg-gradient-to-r hover:from-black/[0.04] hover:to-transparent dark:hover:from-white/[0.04] border-transparent"}`}>
            {/* Status Glow behind item */}
            {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-50" />}
            <div className={`absolute top-0 right-0 w-32 h-full opacity-0 transition-opacity duration-500 pointer-events-none blur-2xl rounded-full ${isSelected || "group-hover:opacity-100"}`} style={{ background: `linear-gradient(90deg, transparent, ${glowColor})` }} />

            {isSelected && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#22d3ee] transition-all duration-300" />
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300 z-10 ${isSelected ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-600 dark:text-cyan-300 shadow-inner" : "bg-black/[0.04] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 text-black/50 dark:text-white/40 group-hover:border-black/10 dark:group-hover:border-white/10 group-hover:text-black/80 dark:group-hover:text-white/70"}`}>
                {building.id.split('-')[0].substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0 z-10 transition-transform duration-300 group-hover:translate-x-1">
                <div className={`text-xs font-bold tracking-tight transition-colors ${isSelected ? "text-cyan-700 dark:text-cyan-100" : "text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white"}`}>{building.name}</div>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusBg} ${building.metrics.status === "critical" ? "bg-red-500 dark:bg-red-400 animate-ping" : building.metrics.status === "warning" ? "bg-amber-500 dark:bg-amber-400" : "bg-emerald-500 dark:bg-emerald-400"}`} />
                    <span className="text-[10px] text-black/50 dark:text-white/40 font-semibold uppercase tracking-widest">{building.metrics.energy}</span>
                </div>
            </div>

            <div className={`shrink-0 z-10 transition-all duration-300 ${isSelected ? "translate-x-0 opacity-100 scale-110" : "-translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"}`}>
                <TbChevronRight size={16} className={isSelected ? "text-cyan-500" : "text-black/50 dark:text-white/50"} />
            </div>
        </button>
    );
}

export default function CampusMapPage() {
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const filteredBuildings = CAMPUS_DATA.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const groupedBuildings = {
        academic: filteredBuildings.filter((b) => b.type === "academic"),
        admin: filteredBuildings.filter((b) => b.type === "admin"),
        services: filteredBuildings.filter((b) => b.type === "services"),
        hostel: filteredBuildings.filter((b) => b.type === "hostel"),
    };

    const totalEnergy = CAMPUS_DATA.reduce((sum, b) => sum + parseInt(b.metrics.energy.replace(/,/g, "")), 0);
    const criticalCount = CAMPUS_DATA.filter((b) => b.metrics.status === "critical").length;
    const warningCount = CAMPUS_DATA.filter((b) => b.metrics.status === "warning").length;

    return (
        <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-[#0a0e1a] relative">
            <div className="absolute inset-0 z-0">
                <CampusMapDynamic onSelectBuilding={setSelectedBuilding} selectedId={selectedBuilding?.id || null} />
            </div>

            {/* Top-left stats */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none">
                <div className="dark:bg-[#0d121f]/60 bg-white/70 backdrop-blur-[40px] px-6 py-5 rounded-xl border border-black/10 dark:border-white/[0.08] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_-12px_rgba(34,211,238,0.15)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_15px_#22d3ee]" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full dark:bg-cyan-500/20 bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                                <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]" />
                            </div>
                            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping absolute opacity-60" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="dark:text-white text-black font-black tracking-[0.15em] text-xs uppercase drop-shadow-sm">Campus Digital Twin</h2>
                                <span className="text-[9px] bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-0.5 rounded shadow-[0_0_10px_rgba(6,182,212,0.5)] font-black uppercase tracking-widest">v2.0</span>
                            </div>
                            <p className="dark:text-white/40 text-black/50 text-[10px] font-bold uppercase tracking-[0.2em]">VIT-AP University &bull; Live Grid Monitor</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="bg-[#0d121f]/60 backdrop-blur-xl px-4 py-3 rounded-lg border border-white/[0.05] min-w-[100px]">
                        <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Nodes Online</div>
                        <div className="text-lg font-light text-white leading-none">{CAMPUS_DATA.length} <span className="text-[10px] text-white/10 font-bold">/ 120</span></div>
                    </div>
                    <div className="bg-[#0d121f]/60 backdrop-blur-xl px-4 py-3 rounded-lg border border-white/[0.05] min-w-[120px]">
                        <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Campus Load</div>
                        <div className="text-lg font-light text-amber-400 leading-none">{totalEnergy.toLocaleString()} <span className="text-[10px] text-amber-500/30 font-bold uppercase tracking-widest">kWh</span></div>
                    </div>
                    {criticalCount > 0 && (
                        <div className="bg-red-500/5 backdrop-blur-xl px-4 py-3 rounded-lg border border-red-500/20 border-l-4">
                            <div className="text-[8px] text-red-400/40 font-black uppercase tracking-[0.2em] mb-1">Critical</div>
                            <div className="text-lg font-light text-red-500 leading-none">{criticalCount}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom controls hint */}
            <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/[0.06] text-[10px] text-white/30">
                    Drag: Pan &bull; Ctrl+Drag: Rotate &bull; Scroll: Zoom &bull; Click building: Details
                </div>
            </div>

            {/* Left sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="absolute left-5 top-[140px] bottom-5 w-72 z-10 dark:bg-[#0d121f]/70 bg-white/70 backdrop-blur-3xl rounded-lg border border-black/10 dark:border-white/[0.08] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                            <div className="relative group">
                                <TbSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                                <input type="text" placeholder="QUERY DATABASE..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-[#151c2e]/50 border border-black/10 dark:border-white/[0.06] rounded-md pl-9 pr-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/10 focus:outline-none focus:border-cyan-500/40 focus:bg-white/50 dark:focus:bg-[#1a233a] transition-all" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-3">
                            {Object.entries(groupedBuildings).map(([type, buildings]) => {
                                if (buildings.length === 0) return null;
                                const typeLabel = type === "academic" ? "Academic" : type === "admin" ? "Administration" : type === "services" ? "Facilities" : "Hostels";
                                return (
                                    <div key={type} className="mb-4">
                                        <div className="flex items-center gap-2 px-3 mb-2">
                                            <div className="w-1 h-3 bg-cyan-500/30 rounded-full" />
                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/30">{typeLabel}</div>
                                        </div>
                                        <div className="space-y-1 px-1">
                                            {buildings.map((b) => (
                                                <BuildingListItem key={b.id} building={b} isSelected={selectedBuilding?.id === b.id} onClick={() => setSelectedBuilding(selectedBuilding?.id === b.id ? null : b)} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle sidebar */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute left-5 top-[108px] z-20 dark:bg-[#0d121f]/80 bg-white/80 backdrop-blur-xl p-2.5 rounded-lg border border-black/10 dark:border-white/[0.1] text-black/40 dark:text-white/30 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-xl group">
                <TbBuildingCommunity size={16} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Right detail panel */}
            <AnimatePresence>
                {selectedBuilding && (
                    <motion.div key={selectedBuilding.id} initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="absolute right-6 top-6 bottom-6 w-[440px] z-20 dark:bg-gradient-to-br dark:from-[#0d121f]/90 dark:to-[#111827]/95 bg-white/80 backdrop-blur-[40px] rounded-2xl border border-black/10 dark:border-white/[0.08] shadow-[0_15px_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_-20px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col">

                        {/* Ambient Glows */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-80" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 hover:bg-cyan-500/20 blur-[60px] rounded-full transition-colors duration-1000 pointer-events-none" />

                        <div className="relative w-full shrink-0 px-7 pt-9 pb-7 border-b border-black/5 dark:border-white/[0.05] z-10">
                            <button onClick={() => setSelectedBuilding(null)} className="absolute top-7 right-7 text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/10 p-2.5 rounded-lg transition-all z-30 border border-black/5 dark:border-white/5 hover:scale-110 active:scale-95">
                                <TbX size={18} />
                            </button>
                            <StatusBadge status={selectedBuilding.metrics.status} />
                            <h3 className="text-3xl font-light text-black dark:text-white leading-tight mt-5 tracking-tighter uppercase drop-shadow-sm">{selectedBuilding.name}</h3>
                            <div className="flex items-center gap-4 mt-4 bg-black/5 dark:bg-white/5 p-3 rounded-lg w-fit border border-black/5 dark:border-white/5">
                                <p className="text-cyan-700 dark:text-cyan-400 text-[9px] flex items-center gap-2 uppercase tracking-[0.25em] font-black">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]" />
                                    Telemetry Stream Online
                                </p>
                                <div className="w-[1px] h-3 bg-black/10 dark:bg-white/10" />
                                <span className="text-black/40 dark:text-white/30 text-[9px] font-black uppercase tracking-[0.25em]">{selectedBuilding.center.lat.toFixed(4)} N / {selectedBuilding.center.lng.toFixed(4)} E</span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-4 z-10 scrollbar-hide">
                            <div className="flex items-center gap-2.5 mb-2 ml-1">
                                <div className="p-1.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                    <TbBuildingCommunity size={16} className="text-black/50 dark:text-white/50" />
                                </div>
                                <span className="text-[11px] text-black/60 dark:text-white/40 font-black uppercase tracking-[0.2em]">{selectedBuilding.type} Block</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <MetricCard icon={<TbPlugConnected size={18} />} label="Power Load" value={selectedBuilding.metrics.energy} color="text-amber-600 dark:text-amber-400" />
                                <MetricCard icon={<IoWaterOutline size={18} />} label="Water Demand" value={selectedBuilding.metrics.water} color="text-cyan-600 dark:text-cyan-400" />
                                <MetricCard icon={<TbUsers size={18} />} label="Active Occupancy" value={selectedBuilding.metrics.occupancy} color="text-violet-600 dark:text-violet-400" />
                                <MetricCard icon={<WiThermometer size={20} />} label="Thermal Index" value={selectedBuilding.metrics.temperature} color="text-rose-600 dark:text-rose-400" />
                            </div>

                            <div className="dark:bg-gradient-to-br dark:from-white/[0.03] dark:to-transparent bg-gradient-to-br from-black/[0.03] to-transparent backdrop-blur-md rounded-xl p-6 border border-black/5 dark:border-white/[0.05] relative overflow-hidden group mt-2">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div>
                                        <div className="text-[9px] text-black/50 dark:text-white/30 font-black uppercase tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Environmental Control
                                        </div>
                                        <div className="text-sm font-bold text-black dark:text-white uppercase tracking-tight drop-shadow-sm">HVAC System Matrix</div>
                                    </div>
                                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-[0.2em]">Live</span>
                                    </div>
                                </div>

                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <div className="flex justify-between text-[10px] text-black/60 dark:text-white/40 font-black uppercase tracking-[0.2em] mb-2">
                                            <span>Cooling Efficiency</span>
                                            <span className="text-cyan-600 dark:text-cyan-400 font-bold drop-shadow-sm">87.4%</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/10 dark:bg-[#151c2e] rounded-full overflow-hidden border border-black/5 dark:border-white/5 relative">
                                            <motion.div
                                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600 to-cyan-300 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: "87.4%" }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                            <motion.div
                                                className="absolute top-0 bottom-0 right-0 w-4 bg-white/50 blur-[2px] rounded-full"
                                                initial={{ left: 0, opacity: 0 }}
                                                animate={{ left: "87.4%", opacity: [0, 1, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-black/60 dark:text-white/40 font-black uppercase tracking-[0.2em] mb-2">
                                            <span>Atmospheric Balance</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold drop-shadow-sm">72.1%</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/10 dark:bg-[#151c2e] rounded-full overflow-hidden border border-black/5 dark:border-white/5 relative">
                                            <motion.div
                                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600 to-emerald-300 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: "72.1%" }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="absolute top-0 bottom-0 right-0 w-4 bg-white/50 blur-[2px] rounded-full"
                                                initial={{ left: 0, opacity: 0 }}
                                                animate={{ left: "72.1%", opacity: [0, 1, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-3 text-[9px] text-black/30 dark:text-white/20 font-black uppercase tracking-[0.4em] pt-6 pb-2">
                                <span className="w-12 h-[1px] bg-black/10 dark:bg-white/10" />
                                EOT Stream / {new Date().toLocaleTimeString()}

                                <span className="w-8 h-[1px] bg-black/10 dark:bg-white/5" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="text-center text-white/40 text-xs pb-4 absolute bottom-4 right-4 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                Developed by Manideep.G<br />Centre of Excellence, Artificial Intelligence and Robotics (AIR)
            </motion.div>

        </div>
    );
}
