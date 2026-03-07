"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoVideocamOutline, IoWarningOutline, IoPeopleOutline, IoShieldCheckmarkOutline, IoFingerPrintOutline, IoAnalyticsOutline, IoChevronDownOutline, IoCloudDownloadOutline, IoInformationCircleOutline, IoEyeOutline, IoLocateOutline, IoTimeOutline, IoAlertCircleOutline } from "react-icons/io5";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";

const surveillanceColors = {
    primary: "#6366f1",
    primaryLight: "#eef2ff",
    danger: "#ef4444",
    warning: "#f59e0b",
    success: "#10b981",
    purple: "#8b5cf6",
    pink: "#ec4899",
};

const chartColors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"];

interface Camera {
    id: string;
    name: string;
    location: string;
    status: "online" | "offline" | "maintenance";
    lastMotion: string;
    zone: string;
}

interface Alert {
    id: number;
    type: string;
    location: string;
    severity: "critical" | "warning" | "info";
    time: string;
    status: "active" | "acknowledged" | "resolved";
}

interface AccessLog {
    id: number;
    person: string;
    location: string;
    time: string;
    type: "entry" | "exit";
    badgeId: string;
}

const cameras: Camera[] = [
    { id: "CAM-001", name: "Main Gate Camera", location: "Building A - Main Entrance", status: "online", lastMotion: "2 min ago", zone: "Perimeter" },
    { id: "CAM-002", name: "Parking Lot Cam 1", location: "North Parking Area", status: "online", lastMotion: "5 min ago", zone: "Parking" },
    { id: "CAM-003", name: "Library Entrance", location: "Library - Front Door", status: "online", lastMotion: "1 min ago", zone: "Academic" },
    { id: "CAM-004", name: "Cafeteria Cam", location: "Cafeteria - Main Area", status: "online", lastMotion: "3 min ago", zone: "Common" },
    { id: "CAM-005", name: "Hostel Block A", location: "Hostel A - Lobby", status: "maintenance", lastMotion: "2 hrs ago", zone: "Residential" },
    { id: "CAM-006", name: "Lab Complex", location: "Science Block - Lab 1", status: "online", lastMotion: "10 min ago", zone: "Academic" },
    { id: "CAM-007", name: "Sports Ground", location: "Stadium - Entrance", status: "online", lastMotion: "15 min ago", zone: "Outdoor" },
    { id: "CAM-008", name: "Admin Building", location: "Admin - Reception", status: "offline", lastMotion: "1 hr ago", zone: "Administrative" },
];

const alerts: Alert[] = [
    { id: 1, type: "Unauthorized Access", location: "Hostel Block A - Floor 3", severity: "critical", time: "10 min ago", status: "active" },
    { id: 2, type: "Motion Detected", location: "Library Area", severity: "warning", time: "25 min ago", status: "acknowledged" },
    { id: 3, type: "Camera Offline", location: "Admin Building - CAM-008", severity: "critical", time: "1 hr ago", status: "active" },
    { id: 4, type: "Perimeter Breach", location: "North Parking - Gate 2", severity: "critical", time: "2 hrs ago", status: "resolved" },
    { id: 5, type: "Loitering Detected", location: "Cafeteria Exit", severity: "info", time: "3 hrs ago", status: "resolved" },
    { id: 6, type: "Vehicle Speed Alert", location: "Main Gate", severity: "warning", time: "4 hrs ago", status: "resolved" },
];

const accessLogs: AccessLog[] = [
    { id: 1, person: "Dr. Sarah Johnson", location: "Lab Complex - Floor 2", time: "09:15 AM", type: "entry", badgeId: "EMP-1024" },
    { id: 2, person: "John Smith", location: "Hostel A - Main Door", time: "09:08 AM", type: "entry", badgeId: "STD-4521" },
    { id: 3, person: "Admin Staff", location: "Admin Building - Rear", time: "08:55 AM", type: "entry", badgeId: "ADM-0089" },
    { id: 4, person: "Dr. Michael Chen", location: "Library", time: "08:45 AM", type: "entry", badgeId: "EMP-2156" },
    { id: 5, person: "Emily Davis", location: "Cafeteria", time: "08:30 AM", type: "entry", badgeId: "STD-3214" },
    { id: 6, person: "Security Guard", location: "Main Gate", time: "08:00 AM", type: "entry", badgeId: "SEC-001" },
];

const generateTrafficData = () => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
        const baseTraffic = hour >= 7 && hour <= 21 ? 60 : 20;
        const peak = (hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 18) ? 1.5 : 1;
        data.push({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            footTraffic: Math.floor(baseTraffic * peak * (0.8 + Math.random() * 0.4)),
            vehicleCount: Math.floor(baseTraffic * 0.3 * peak * (0.7 + Math.random() * 0.6)),
            incidents: Math.floor(Math.random() * 5),
        });
    }
    return data;
};

const trafficData = generateTrafficData();

const zoneData = [
    { name: "Academic Block", value: 35, fill: surveillanceColors.primary },
    { name: "Parking Area", value: 25, fill: surveillanceColors.success },
    { name: "Hostels", value: 20, fill: surveillanceColors.purple },
    { name: "Common Areas", value: 15, fill: surveillanceColors.warning },
    { name: "Perimeter", value: 5, fill: surveillanceColors.danger },
];

const weeklyIncidents = [
    { day: "Mon", incidents: 3, resolved: 3 },
    { day: "Tue", incidents: 5, resolved: 4 },
    { day: "Wed", incidents: 2, resolved: 2 },
    { day: "Thu", incidents: 8, resolved: 7 },
    { day: "Fri", incidents: 6, resolved: 5 },
    { day: "Sat", incidents: 1, resolved: 1 },
    { day: "Sun", incidents: 2, resolved: 2 },
];

const colorMap: Record<string, { bg: string, text: string, border: string }> = {
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
    red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
    green: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
};

const StatCard = ({ label, value, subValue, icon: Icon, color, trend }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${colorMap[color]?.bg || 'bg-slate-500/10'} border ${colorMap[color]?.border || 'border-slate-500/20'}`}>
                <Icon className={`text-2xl ${colorMap[color]?.text || 'text-slate-500'}`} />
            </div>
            {trend && (
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${trend > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</h3>
            <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</span>
                {subValue && <span className={`text-sm font-medium ${colorMap[color]?.text || 'text-slate-500'}`}>{subValue}</span>}
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
                            {entry.name}: <span className="text-slate-900 dark:text-white font-bold ml-1">{entry.value}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function SurveillanceDashboard() {
    const [selectedTab, setSelectedTab] = useState<string>("Live View");
    const [showDocumentation, setShowDocumentation] = useState<boolean>(false);

    const tabs = ["Live View", "Playback", "Analytics", "Access Logs", "Reports"];

    const onlineCameras = cameras.filter(c => c.status === "online").length;
    const activeAlerts = alerts.filter(a => a.status === "active").length;
    const todayEntries = accessLogs.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 transition-colors pb-20">
            <Navbar />

            <main className="max-w-[1700px] mx-auto px-6 py-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                            <IoShieldCheckmarkOutline className="text-indigo-500" />
                            Surveillance & Security
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Campus security monitoring, access control & threat detection</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                        <IoCloudDownloadOutline className="text-indigo-500 text-lg" />
                        <span className="text-sm font-semibold">Export Report</span>
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
                            className={`relative px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${selectedTab === tab ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                        >
                            {selectedTab === tab && (
                                <motion.div
                                    layoutId="activeTabSurveillance"
                                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"
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
                            <IoInformationCircleOutline className="text-indigo-500 text-2xl" />
                            <span className="font-bold text-slate-800 dark:text-white text-base">Security Analytics Guide</span>
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
                                            <h4 className="font-bold text-indigo-500 mb-1">Live Camera Feeds</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Real-time video monitoring from all campus cameras with motion detection.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-amber-500 mb-1">Alert Management</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered threat detection with instant alerts and automated response.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-emerald-500 mb-1">Access Control</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Biometric and badge-based entry tracking across all secured areas.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-purple-500 mb-1">Traffic Analytics</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Foot and vehicle traffic patterns for optimized security deployment.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-pink-500 mb-1">Zone Coverage</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Camera coverage mapping and blind spot identification.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-500 mb-1">Incident Reports</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive logging and exportable incident documentation.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Active Cameras" value={onlineCameras} subValue={`/ ${cameras.length}`} icon={IoVideocamOutline} color="indigo" />
                    <StatCard label="Active Alerts" value={activeAlerts} subValue="unresolved" icon={IoAlertCircleOutline} color="red" />
                    <StatCard label="Today's Entries" value={todayEntries} subValue="recorded" icon={IoFingerPrintOutline} color="green" />
                    <StatCard label="Coverage Rate" value="94" subValue={`\u0025`} icon={IoEyeOutline} color="purple" trend={2} />
                </div>

                {/* Camera Grid & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Live Camera Feeds */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Camera Feeds</h3>
                            <span className="flex items-center gap-2 text-xs font-semibold text-green-500">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {onlineCameras} Online
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {cameras.slice(0, 8).map((camera) => (
                                <div key={camera.id} className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <IoVideocamOutline className="text-white/30 text-4xl" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2">
                                        <p className="text-white text-xs font-medium truncate">{camera.name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] ${camera.status === 'online' ? 'text-green-400' : camera.status === 'offline' ? 'text-red-400' : 'text-amber-400'}`}>
                                                {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
                                            </span>
                                            <span className="text-white/50 text-[10px]">{camera.lastMotion}</span>
                                        </div>
                                    </div>
                                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-500' : camera.status === 'offline' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Alerts */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-h-[450px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Security Alerts</h3>
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg">
                                {activeAlerts} Active
                            </span>
                        </div>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                            <span className={`text-xs font-semibold ${
                                                alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                            }`}>
                                                {alert.type}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                            alert.status === 'active' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                            alert.status === 'acknowledged' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                            'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">{alert.location}</p>
                                    <p className="text-xs text-slate-400">{alert.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Traffic Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Foot Traffic Pattern</h3>
                        <p className="text-xs text-slate-500 mb-6">People count by hour</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="hour" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="footTraffic" name="People" stroke="#6366f1" strokeWidth={2.5} fill="url(#trafficGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Vehicle Count</h3>
                        <p className="text-xs text-slate-500 mb-6">Vehicles detected by hour</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="hour" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="vehicleCount" name="Vehicles" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Zone Coverage & Weekly Incidents */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[380px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Zone Coverage</h3>
                        <p className="text-xs text-slate-500 mb-4">Camera distribution by zone</p>
                        <div className="flex-1 w-full min-h-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={zoneData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                                        {zoneData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                <span className="text-sm font-medium text-slate-400">Total</span>
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">8</span>
                                <span className="text-xs text-slate-400">Cameras</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {zoneData.map((d, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[380px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Weekly Incidents</h3>
                        <p className="text-xs text-slate-500 mb-6">Incidents detected vs resolved</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyIncidents} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="incidents" name="Total Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={25} />
                                    <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Access Control Logs */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Access Logs</h3>
                        <span className="text-xs text-slate-500">Showing last 10 entries</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Person</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Badge ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                        {log.person.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-slate-800 dark:text-white text-sm">{log.person}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{log.location}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{log.time}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                log.type === 'entry' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{log.badgeId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <motion.div
                    className="text-center text-white/40 text-xs pb-04"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    Developed by Manideep, Centre of Excellence, Artificial Intelligence and Robotics (AIR)
                </motion.div>

            </main>
        </div>
    );
}
