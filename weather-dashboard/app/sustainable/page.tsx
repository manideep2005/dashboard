"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoFlashOutline, IoTrendingUpOutline, IoSpeedometerOutline, IoCloudDownloadOutline } from "react-icons/io5";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Navbar from "@/components/Navbar";

interface SolarData {
  time: string;
  timeOnly: string;
  energy: number;
  current: number;
  voltage: number;
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
  data: SolarData[];
  groupedData: Record<string, SolarData[]>;
  stats: ApiStats;
  groupedStats: Record<string, ApiStats>;
  availableDays: string[];
}

const colorMap: Record<string, { bg: string, text: string }> = {
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" }
};

const StatCard = ({ label, value, unit, icon: Icon, colorName }: any) => {
  const colors = colorMap[colorName] || colorMap.cyan;
  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} border border-white/5`}>
          <Icon className="text-2xl" />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-white/60 text-sm font-medium mb-1">{label}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
          <span className={`text-sm font-semibold ${colors.text}`}>{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default function SustainableDashboard() {
  const [dataPayload, setDataPayload] = useState<ApiResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("All Data");

  useEffect(() => {
    fetch("/api/sustainable-data")
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
    link.download = "solar_data_export.json";
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

  const augmentedData = useMemo(() => {
    return activeData.map(d => ({
      ...d,
      powerCalculated: (d.current * d.voltage) / 1000 // Calculate power in kW
    }));
  }, [activeData]);

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
        timeMap[entry.timeOnly][`Energy_${day}`] = entry.energy;
        timeMap[entry.timeOnly][`Current_${day}`] = entry.current;
      });
    });

    return Object.values(timeMap).sort((a, b) => {
      const timeA = a.timeOnly.split(':').map(Number);
      const timeB = b.timeOnly.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  }, [dataPayload, selectedTab]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-xl shadow-xl">
          <p className="text-white/60 mb-2 font-medium text-sm border-b border-white/5 pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 my-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <p className="text-white/80 text-sm font-medium">
                {entry.name.replace(/_/g, " ")}: <span className="text-white font-bold ml-1">{entry.value.toFixed(2)}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartColors = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"];

  return (
    <div className="min-h-screen bg-animated font-sans selection:bg-cyan-500/30 text-white pb-20">
      <Navbar />

      <main className="max-w-[1800px] mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Sustainability Dashboard</h1>
            <p className="text-white/60 text-sm font-medium">Real-time sustainability system analytics seamlessly adapting to your theme.</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex items-center gap-2 glass px-5 py-2.5 rounded-xl transition-all self-start md:self-auto hover:bg-white/5"
          >
            <IoCloudDownloadOutline className="text-cyan-500 text-lg" />
            <span className="text-sm font-semibold text-white">Export Data</span>
          </motion.button>
        </div>

        {/* Dynamic Tabs */}
        {dataPayload && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8 glass p-1.5 rounded-2xl w-fit"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedTab === tab ? "text-white" : "text-white/50 hover:text-white/80"}`}
              >
                {selectedTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab === "Comparison" ? "Date Comparison" : tab}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Energy Generated" value={(activeStats.totalEnergy / 1000).toFixed(2)} unit="MWh" icon={IoFlashOutline} colorName="cyan" />
          <StatCard label="Average Current Output" value={activeStats.avgCurrent.toFixed(2)} unit="A" icon={IoSpeedometerOutline} colorName="blue" />
          <StatCard label="Average Base Voltage" value={activeStats.avgVoltage.toFixed(1)} unit="V" icon={IoTrendingUpOutline} colorName="purple" />
          <StatCard label="Peak System Power" value={activeStats.peakPower.toFixed(2)} unit="kW" icon={IoFlashOutline} colorName="emerald" />
        </div>

        {/* Charts Section */}
        <AnimatePresence mode="wait">
          {selectedTab !== "Comparison" ? (
            <motion.div
              key="standard-view"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Energy Generation */}
              <div className="glass rounded-3xl p-6 shadow-lg h-[450px] flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">Energy Generation Profile</h3>
                <p className="text-xs text-white/50 mb-4">Total cumulative energy produced (kWh) over time.</p>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={augmentedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="energyGradClean" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} tickMargin={12} />
                      <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="#0ea5e9" strokeWidth={3} fill="url(#energyGradClean)" activeDot={{ r: 6, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Power Output */}
              <div className="glass rounded-3xl p-6 shadow-lg h-[450px] flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">System Power Output</h3>
                <p className="text-xs text-white/50 mb-4">Real-time active power delivery (kW).</p>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={augmentedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} tickMargin={12} />
                      <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="powerCalculated" name="Power (kW)" stroke="#8b5cf6" strokeWidth={3} fill="url(#powerGrad)" activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Voltage Profile */}
              <div className="glass rounded-3xl p-6 shadow-lg h-[450px] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">Grid Voltage Profile</h3>
                </div>
                <p className="text-xs text-white/50 mb-4">Average system voltage stability monitoring (V).</p>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={augmentedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} tickMargin={12} />
                      <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="voltage" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Voltage (V)" activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Phase Analysis */}
              <div className="glass rounded-3xl p-6 shadow-lg h-[450px] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">Three-Phase Current</h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-xs font-medium text-white/60"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />Phase A</span>
                    <span className="flex items-center gap-2 text-xs font-medium text-white/60"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />Phase B</span>
                    <span className="flex items-center gap-2 text-xs font-medium text-white/60"><div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />Phase C</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-4">Amperage load balancing across Phase A, B, and C.</p>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={augmentedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} tickMargin={12} />
                      <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="phase1" stroke="#10b981" strokeWidth={2.5} dot={false} name="Phase A (A)" activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="phase2" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Phase B (A)" activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="phase3" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Phase C (A)" activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="comparison-view"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            >
              {/* Energy Comparison */}
              <div className="glass rounded-3xl p-6 shadow-lg h-[500px] flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">Daily Energy Comparison</h3>
                <p className="text-xs text-white/50 mb-6">Overlay of energy generation cycles matching normalized time of day.</p>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" vertical={false} />
                      <XAxis dataKey="timeOnly" stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} minTickGap={30} tickMargin={12} />
                      <YAxis stroke="var(--recharts-text)" tick={{ fill: "var(--recharts-text)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px", color: "var(--text-primary)" }} iconType="circle" />
                      {dataPayload?.availableDays.map((day, idx) => (
                        <Line
                          key={`Energy_${day}`}
                          type="monotone"
                          dataKey={`Energy_${day}`}
                          name={`Date: ${day}`}
                          stroke={chartColors[idx % chartColors.length]}
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6 }}
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
