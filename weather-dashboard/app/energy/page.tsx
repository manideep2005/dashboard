"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoFlashOutline, IoTimeOutline, IoTrendingUpOutline, IoBatteryChargingOutline, IoCloudDownloadOutline, IoInformationCircleOutline, IoChevronDownOutline } from "react-icons/io5";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";

interface EnergyData {
    time: string;
    timeOnly: string;
    energy: number;
    current: number;
    voltage: number;
    activePower: number; // calculated kW
    phase1: number;
    phase2: number;
    phase3: number;
}

interface ApiStats {
    totalEnergy: number;
    avgCurrent: number;
    avgVoltage: number;
    peakPower: number;
}

interface ApiResponse {
    data: EnergyData[];
    groupedData: Record<string, EnergyData[]>;
    stats: ApiStats;
    groupedStats: Record<string, ApiStats>;
    availableDays: string[];
}

// Electric-Dash Color Theme
const colors = {
    teal: "#2d9da6",
    tealLight: "#eefdfa",
    darkBg: "#0f172a",
    cardBgLight: "#ffffff",
    cardBgDark: "#1e293b",
};
const chartColors = ["#2d9da6", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const StatCard = ({ label, value, subValue, icon: Icon }: any) => {
    return (
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-xl bg-[#eefdfa] dark:bg-teal-900/30 text-[#2d9da6] border border-[#2d9da6]/20">
                    <Icon className="text-2xl" />
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</h3>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</span>
                    {subValue && <span className="text-sm font-medium text-[#2d9da6]">{subValue}</span>}
                </div>
            </div>
        </div>
    );
};

export default function EnergyDashboard() {
    const [dataPayload, setDataPayload] = useState<ApiResponse | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>("All Data");
    const [showDocumentation, setShowDocumentation] = useState<boolean>(false);

    useEffect(() => {
        fetch("/api/energy-data")
            .then(res => res.json())
            .then((parsed: ApiResponse) => {
                setDataPayload(parsed);
            });
    }, []);

    const handleDownload = () => {
        if (!dataPayload) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataPayload.data))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "energy_consumption_export.json";
        link.click();
    };

    const tabs = useMemo(() => {
        if (!dataPayload) return ["All Data"];
        return ["All Data", ...dataPayload.availableDays, "Comparison"];
    }, [dataPayload]);

    const activeStats = useMemo(() => {
        if (!dataPayload) return { totalEnergy: 0, avgCurrent: 0, avgVoltage: 0, peakPower: 0 };
        if (selectedTab === "All Data" || selectedTab === "Comparison") return dataPayload.stats;
        return dataPayload.groupedStats[selectedTab] || dataPayload.stats;
    }, [dataPayload, selectedTab]);

    const activeData = useMemo(() => {
        if (!dataPayload) return [];
        if (selectedTab === "All Data" || selectedTab === "Comparison") return dataPayload.data;
        return dataPayload.groupedData[selectedTab] || [];
    }, [dataPayload, selectedTab]);

    // Transform data for hourly aggregation (matching reference bar chart)
    const hourlyData = useMemo(() => {
        if (!activeData.length) return [];
        const hourlyMap: Record<string, { hour: string, totalPower: number, count: number }> = {};

        activeData.forEach(entry => {
            const hour = entry.timeOnly.split(":")[0];
            const hourStr = `${hour}:00`;
            if (!hourlyMap[hourStr]) {
                hourlyMap[hourStr] = { hour: hourStr, totalPower: 0, count: 0 };
            }
            hourlyMap[hourStr].totalPower += entry.activePower;
            hourlyMap[hourStr].count += 1;
        });

        return Object.values(hourlyMap).map(d => ({
            hour: d.hour,
            // Simple approximation of energy used in that hour if activePower is kW
            consumption: d.totalPower / d.count
        })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    }, [activeData]);

    // Group comparison data
    const comparisonData = useMemo(() => {
        if (!dataPayload || selectedTab !== "Comparison") return [];
        const timeMap: Record<string, any> = {};
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 5) {
                const timeStr = `${h}:${m.toString().padStart(2, '0')}`;
                timeMap[timeStr] = { timeOnly: timeStr };
            }
        }
        dataPayload.availableDays.forEach((day) => {
            const dayData = dataPayload.groupedData[day] || [];
            dayData.forEach(entry => {
                if (!timeMap[entry.timeOnly]) {
                    timeMap[entry.timeOnly] = { timeOnly: entry.timeOnly };
                }
                timeMap[entry.timeOnly][`${day}`] = entry.activePower;
            });
        });
        return Object.values(timeMap).sort((a, b) => {
            const timeA = a.timeOnly.split(':').map(Number);
            const timeB = b.timeOnly.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
    }, [dataPayload, selectedTab]);

    // Calculate phase load percentage for Donut Chart
    const phaseData = useMemo(() => {
        if (!activeData.length) return [];
        let p1 = 0, p2 = 0, p3 = 0;
        activeData.forEach(d => {
            p1 += d.phase1;
            p2 += d.phase2;
            p3 += d.phase3;
        });
        const total = p1 + p2 + p3;
        if (total === 0) return [];
        return [
            { name: "Phase L1", value: parseFloat(((p1 / total) * 100).toFixed(1)) },
            { name: "Phase L2", value: parseFloat(((p2 / total) * 100).toFixed(1)) },
            { name: "Phase L3", value: parseFloat(((p3 / total) * 100).toFixed(1)) },
        ];
    }, [activeData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium text-sm border-b border-slate-100 dark:border-slate-800 pb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 my-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                                {entry.name}: <span className="text-slate-900 dark:text-white font-bold ml-1">{entry.value.toFixed(2)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white font-sans selection:bg-[#2d9da6]/30 transition-colors pb-20">
            <Navbar />

            <main className="max-w-[1700px] mx-auto px-6 py-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Electricity Analytics</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Insight into facility energy consumption & demand patterns</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                        <IoCloudDownloadOutline className="text-[#2d9da6] text-lg" />
                        <span className="text-sm font-semibold">Export JSON</span>
                    </motion.button>
                </div>

                {/* Dynamic Tabs (Date Selector style) */}
                {dataPayload && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit"
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`relative px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${selectedTab === tab ? "text-[#2d9da6] dark:text-teal-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                            >
                                {selectedTab === tab && (
                                    <motion.div
                                        layoutId="activeTabEnergy"
                                        className="absolute inset-0 bg-[#eefdfa] dark:bg-[#2d9da6]/10 rounded-lg"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{tab === "Comparison" ? "Compare Matrix" : tab}</span>
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Informational Panel */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowDocumentation(!showDocumentation)}
                        className="flex items-center justify-between w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <IoInformationCircleOutline className="text-[#2d9da6] text-2xl" />
                            <span className="font-bold text-slate-800 dark:text-white text-base">Dashboard Analysis Guide</span>
                        </div>
                        <motion.div animate={{ rotate: showDocumentation ? 180 : 0 }}>
                            <IoChevronDownOutline className="text-slate-400 text-xl" />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {showDocumentation && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 p-6 rounded-b-xl grid grid-cols-1 md:grid-cols-2 gap-6 -mt-2 relative z-0">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-[#2d9da6] mb-1">Hourly Aggregated Flow</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Summarizes active power utilization aggregated into hourly chunks showing exact temporal peaks in physical load.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-500 mb-1">Detailed Power Trend</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">The high-resolution temporal distribution of active power (kW). Provides granular insight into machinery spin-up or baseline loads.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-emerald-500 mb-1">Phase Load Contribution</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">The physical percentage breakdown of load drawn on Phase L1 vs L2 vs L3. Highly unbalanced loads can trip main breakers.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-amber-500 mb-1">Comparative Daily Analysis</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Overlays consumption metrics day-by-day directly on top of each other to identify abnormalities in expected usage routines.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Consumption" value={(activeStats.totalEnergy / 1000).toFixed(2)} subValue="MWh" icon={IoFlashOutline} />
                    <StatCard label="Peak Hourly Demand" value={activeStats.peakPower.toFixed(2)} subValue="kW" icon={IoTrendingUpOutline} />
                    <StatCard label="Average Daily Usage" value={`${activeStats.avgCurrent.toFixed(1)}`} subValue="Amps" icon={IoTimeOutline} />
                    <StatCard label="Base Line Voltage" value={activeStats.avgVoltage.toFixed(1)} subValue="Volts" icon={IoBatteryChargingOutline} />
                </div>

                {/* Main Charts Matrix */}
                <AnimatePresence mode="wait">
                    {selectedTab !== "Comparison" ? (
                        <motion.div
                            key="standard-energy"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Hourly Aggregated Bar Chart (Electric Dash Style) */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Hourly Aggregated Flow</h3>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                            <XAxis dataKey="hour" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45, 157, 166, 0.05)' }} />
                                            <Bar dataKey="consumption" name="Avg Power (kW)" fill="#2d9da6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Donut Chart replacing Source Contribution */}
                            <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Phase Load Distribution</h3>
                                <p className="text-xs text-slate-500 mb-4">% Load Balance Split</p>
                                <div className="flex-1 w-full min-h-0 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={phaseData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value" stroke="none">
                                                {phaseData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                        <span className="text-sm font-medium text-slate-400">Phase Match</span>
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{(phaseData.length > 0 ? (phaseData[0].value) : 0).toFixed(0)}%</span>
                                    </div>
                                </div>
                                {/* Legend Below */}
                                <div className="flex justify-center gap-4 mt-4">
                                    {phaseData.map((d, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                                            <span className="text-xs text-slate-600 dark:text-slate-400">{d.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Trend Line (Area) */}
                            <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[450px] flex flex-col mt-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Detailed Power Trend</h3>
                                <p className="text-xs text-slate-500 mb-6">Continuous active power demand tracking (kW)</p>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2d9da6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#2d9da6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="var(--recharts-grid)" vertical={false} />
                                            <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} axisLine={false} tickLine={false} />
                                            <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="activePower" name="Active Power (kW)" stroke="#2d9da6" strokeWidth={2.5} fill="url(#areaGrad)" activeDot={{ r: 5, fill: "#2d9da6", stroke: "#fff", strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </motion.div>
                    ) : (
                        <motion.div
                            key="comparison-energy"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                        >
                            {/* Daily Energy Comparison Line Chart */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[500px] flex flex-col">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Day-by-Day Output Matrix</h3>
                                <p className="text-xs text-slate-500 mb-6">Direct load overlap across multiple day logs to isolate baseline deviations.</p>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={comparisonData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                            <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} tickMargin={12} axisLine={false} tickLine={false} />
                                            <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px" }} iconType="circle" />
                                            {dataPayload?.availableDays.map((day, idx) => (
                                                <Line
                                                    key={`Day_${day}`}
                                                    type="monotone"
                                                    dataKey={`${day}`}
                                                    name={`Date: ${day}`}
                                                    stroke={chartColors[idx % chartColors.length]}
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 5 }}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
