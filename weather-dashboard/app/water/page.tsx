"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoWaterOutline, IoWarningOutline, IoTrendingDownOutline, IoLeafOutline, IoAnalyticsOutline, IoChevronDownOutline, IoCloudDownloadOutline, IoInformationCircleOutline } from "react-icons/io5";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";

const waterColors = {
    primary: "#0ea5e9",
    primaryLight: "#e0f2fe",
    secondary: "#06b6d4",
    danger: "#ef4444",
    warning: "#f59e0b",
    success: "#10b981",
    purple: "#8b5cf6",
};

const chartColors = ["#0ea5e9", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

interface WaterData {
    time: string;
    timeOnly: string;
    consumption: number;
    tankLevel: number;
    pressure: number;
    flowRate: number;
    quality: number;
}

interface DailyStats {
    totalConsumption: number;
    avgPressure: number;
    avgQuality: number;
    leakCount: number;
    maxTankLevel: number;
    minTankLevel: number;
}

const generateDummyData = (): WaterData[] => {
    const data: WaterData[] = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    
    for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 15) {
            const time = new Date(baseDate);
            time.setHours(hour, min);
            
            const hourFactor = hour >= 6 && hour <= 22 ? 1.5 : 0.4;
            const consumption = Math.max(10, (30 + Math.random() * 40) * hourFactor);
            const tankLevel = Math.max(20, Math.min(95, 70 + Math.sin(hour / 24 * Math.PI * 2) * 25 + Math.random() * 5));
            const pressure = 2.5 + Math.sin(hour / 24 * Math.PI * 2) * 0.5 + Math.random() * 0.3;
            const flowRate = consumption / 100 * 3 + Math.random() * 0.5;
            const quality = 85 + Math.random() * 12;
            
            data.push({
                time: time.toISOString(),
                timeOnly: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                consumption: parseFloat(consumption.toFixed(2)),
                tankLevel: parseFloat(tankLevel.toFixed(1)),
                pressure: parseFloat(pressure.toFixed(2)),
                flowRate: parseFloat(flowRate.toFixed(2)),
                quality: parseFloat(quality.toFixed(1)),
            });
        }
    }
    return data;
};

const dummyData = generateDummyData();

const stats: DailyStats = {
    totalConsumption: dummyData.reduce((acc, d) => acc + d.consumption, 0),
    avgPressure: dummyData.reduce((acc, d) => acc + d.pressure, 0) / dummyData.length,
    avgQuality: dummyData.reduce((acc, d) => acc + d.quality, 0) / dummyData.length,
    leakCount: Math.floor(Math.random() * 3) + 1,
    maxTankLevel: Math.max(...dummyData.map(d => d.tankLevel)),
    minTankLevel: Math.min(...dummyData.map(d => d.tankLevel)),
};

const tankDistribution = [
    { name: "Main Tank", value: 78, fill: waterColors.primary },
    { name: "Reserve Tank", value: 45, fill: waterColors.secondary },
    { name: "Roof Tank", value: 62, fill: waterColors.success },
];

const leakAlerts = [
    { id: 1, location: "Building A - Floor 2", severity: "high", status: "Active", time: "2 hrs ago" },
    { id: 2, location: "Building C - Lab Area", severity: "medium", status: "Investigating", time: "5 hrs ago" },
    { id: 3, location: "Building B - Restroom", severity: "low", status: "Resolved", time: "1 day ago" },
];

const usageByZone = [
    { zone: "Academic Block", usage: 45 },
    { zone: "Hostels", usage: 28 },
    { zone: "Cafeteria", usage: 15 },
    { zone: "Labs", usage: 8 },
    { zone: "Maintenance", usage: 4 },
];

const StatCard = ({ label, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${color}/10 border border-${color}/20`}>
                <Icon className={`text-2xl text-${color}`} />
            </div>
            {label.includes("Leak") && stats.leakCount > 0 && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg animate-pulse">
                    {stats.leakCount} Active
                </span>
            )}
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</h3>
            <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</span>
                {subValue && <span className={`text-sm font-medium text-${color}`}>{subValue}</span>}
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium text-sm border-b border-slate-100 dark:border-slate-800 pb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 my-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                            {entry.name}: <span className="text-slate-900 dark:text-white font-bold ml-1">{entry.value?.toFixed(2)}{entry.name.includes('Level') || entry.name.includes('Quality') ? '%' : entry.name.includes('Pressure') ? ' bar' : ' L/min'}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function WaterDashboard() {
    const [selectedTab, setSelectedTab] = useState<string>("Today");
    const [showDocumentation, setShowDocumentation] = useState<boolean>(false);

    const tabs = ["Today", "Yesterday", "This Week", "This Month"];

    const hourlyData = useMemo(() => {
        const hourlyMap: Record<string, { hour: string, consumption: number, count: number }> = {};
        
        dummyData.forEach(entry => {
            const hour = entry.timeOnly.split(":")[0];
            const hourStr = `${hour}:00`;
            if (!hourlyMap[hourStr]) {
                hourlyMap[hourStr] = { hour: hourStr, consumption: 0, count: 0 };
            }
            hourlyMap[hourStr].consumption += entry.consumption;
            hourlyMap[hourStr].count += 1;
        });

        return Object.values(hourlyMap).map(d => ({
            hour: d.hour,
            consumption: parseFloat((d.consumption / d.count).toFixed(2)),
        })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    }, []);

    const handleDownload = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dummyData))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "water_consumption_export.json";
        link.click();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 transition-colors pb-20">
            <Navbar />

            <main className="max-w-[1700px] mx-auto px-6 py-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                            <IoWaterOutline className="text-cyan-500" />
                            Water Resources
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Real-time water usage, tank levels & leak detection analytics</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                        <IoCloudDownloadOutline className="text-cyan-500 text-lg" />
                        <span className="text-sm font-semibold">Export JSON</span>
                    </motion.button>
                </div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`relative px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${selectedTab === tab ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                        >
                            {selectedTab === tab && (
                                <motion.div
                                    layoutId="activeTabWater"
                                    className="absolute inset-0 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Informational Panel */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowDocumentation(!showDocumentation)}
                        className="flex items-center justify-between w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <IoInformationCircleOutline className="text-cyan-500 text-2xl" />
                            <span className="font-bold text-slate-800 dark:text-white text-base">Water Analytics Guide</span>
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
                                <div className="bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 p-6 rounded-b-xl grid grid-cols-1 md:grid-cols-3 gap-6 -mt-2 relative z-0">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-cyan-500 mb-1">Water Consumption Trend</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Track hourly water consumption patterns to identify peak usage times and optimize distribution.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-cyan-500 mb-1">Tank Level Monitoring</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Real-time monitoring of water levels in main, reserve, and roof tanks to prevent shortage.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-amber-500 mb-1">Leak Detection System</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered leak detection across the campus pipeline network with instant alerts.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-500 mb-1">Water Quality Index</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Continuous monitoring of water quality parameters including pH, turbidity, and chlorine levels.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-purple-500 mb-1">Zone-based Analytics</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Breakdown of water consumption by campus zones for targeted conservation efforts.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-cyan-500 mb-1">Pressure Monitoring</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Track water pressure across the network to ensure optimal flow and early issue detection.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Consumption" value={(stats.totalConsumption / 1000).toFixed(1)} subValue="kL" icon={IoWaterOutline} color="cyan" />
                    <StatCard label="Avg Tank Level" value={stats.maxTankLevel.toFixed(0)} subValue="%" icon={IoAnalyticsOutline} color="blue" />
                    <StatCard label="Active Leaks" value={stats.leakCount} subValue="detected" icon={IoWarningOutline} color="red" />
                    <StatCard label="Water Quality" value={stats.avgQuality.toFixed(0)} subValue="/ 100" icon={IoLeafOutline} color="green" />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Water Consumption Bar Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Hourly Water Consumption</h3>
                        <p className="text-xs text-slate-500 mb-6">Water usage pattern by hour (L/min)</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="hour" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} />
                                    <Bar dataKey="consumption" name="Usage (L/min)" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tank Distribution Pie */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tank Distribution</h3>
                        <p className="text-xs text-slate-500 mb-4">Current water reserves</p>
                        <div className="flex-1 w-full min-h-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={tankDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                                        {tankDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                <span className="text-sm font-medium text-slate-400">Total</span>
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {tankDistribution.reduce((a, b) => a + b.value, 0)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {tankDistribution.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tank Levels Over Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[380px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tank Level Trends</h3>
                        <p className="text-xs text-slate-500 mb-6">Water level fluctuation throughout the day</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dummyData.filter((_, i) => i % 8 === 0)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="tankLevel" name="Tank Level (%)" stroke="#06b6d4" strokeWidth={2.5} fill="url(#tankGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Water Quality Trend */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[380px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Water Quality Index</h3>
                        <p className="text-xs text-slate-500 mb-6">Real-time water quality monitoring</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dummyData.filter((_, i) => i % 8 === 0)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} axisLine={false} tickLine={false} />
                                    <YAxis domain={[70, 100]} stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="quality" name="Quality Index" stroke="#10b981" strokeWidth={2.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Leak Alerts & Zone Usage */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Leak Alerts */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leak Detection Alerts</h3>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                                {leakAlerts.filter(l => l.status !== "Resolved").length} Active
                            </span>
                        </div>
                        <div className="space-y-3">
                            {leakAlerts.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white text-sm">{alert.location}</p>
                                            <p className="text-xs text-slate-500">{alert.time}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        alert.status === 'Active' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                        alert.status === 'Investigating' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    }`}>
                                        {alert.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Usage by Zone */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[340px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Usage by Zone</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageByZone} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" horizontal={false} />
                                    <XAxis type="number" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="zone" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="usage" name="Usage %" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pressure & Flow */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[380px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">System Pressure</h3>
                        <p className="text-xs text-slate-500 mb-6">Water pressure across the network (bar)</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dummyData.filter((_, i) => i % 6 === 0)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="pressure" name="Pressure (bar)" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[380px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Flow Rate Analysis</h3>
                        <p className="text-xs text-slate-500 mb-6">Real-time water flow monitoring (L/s)</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dummyData.filter((_, i) => i % 6 === 0)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="flowRate" name="Flow Rate (L/s)" stroke="#f59e0b" strokeWidth={2.5} fill="url(#flowGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
