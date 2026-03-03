"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BuildingData } from "@/components/map/CampusLeafletMap";
import { motion, AnimatePresence } from "framer-motion";
import { WiThermometer } from "react-icons/wi";
import { IoWaterOutline } from "react-icons/io5";
import { TbPlugConnected, TbActivityHeartbeat } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

// Leaflet requires window/document to exist, so we dynamically import it with SSR disabled
const CampusMapDynamic = dynamic(() => import("@/components/map/CampusLeafletMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center text-white/50">
            Loading Geographic Satellite Data...
        </div>
    ),
});

export default function CampusMapPage() {
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);

    return (
        <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-[#0A0D15] relative">
            <div className="absolute inset-0 z-0">
                <CampusMapDynamic
                    onSelectBuilding={setSelectedBuilding}
                    selectedId={selectedBuilding?.id || null}
                />
            </div>

            {/* Floating Instructions */}
            <div className="absolute top-6 left-6 z-10 glass px-6 py-3 rounded-2xl border border-white/10 pointer-events-none bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <h2 className="text-white font-bold tracking-tight">Geographic Digital Twin</h2>
                </div>
                <p className="text-white/50 text-xs mt-1">Left Click: Select Building • Drag: Pan Map</p>
            </div>

            <AnimatePresence>
                {selectedBuilding && (
                    <motion.div
                        key={selectedBuilding.id}
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute right-6 top-6 bottom-6 w-96 glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-20 flex flex-col bg-black/60 backdrop-blur-2xl"
                    >
                        {/* Image Header */}
                        <div className="relative h-48 w-full border-b border-white/10 shrink-0">
                            <Image
                                src={selectedBuilding.image}
                                alt={selectedBuilding.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <button
                                onClick={() => setSelectedBuilding(null)}
                                className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-colors z-30"
                            >
                                <IoClose size={20} />
                            </button>

                            <div className="absolute bottom-4 left-6 right-6">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block mb-2 ${selectedBuilding.metrics.status === 'normal' ? 'bg-blue-500 text-white' :
                                        selectedBuilding.metrics.status === 'warning' ? 'bg-amber-500 text-white' :
                                            'bg-red-500 text-white'
                                    }`}>
                                    {selectedBuilding.type}
                                </span>
                                <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">{selectedBuilding.name}</h3>
                                <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
                                    <TbActivityHeartbeat size={14} className="text-green-400" /> Live Telemetry Linked
                                </p>
                            </div>
                        </div>

                        {/* Metrics Layout */}
                        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                            <div className="glass bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <TbPlugConnected className="text-amber-400" size={18} />
                                    <span className="text-white/60 text-xs font-semibold">POWER LOAD</span>
                                </div>
                                <div className="text-3xl font-extrabold text-white">{selectedBuilding.metrics.energy}</div>
                            </div>

                            <div className="glass bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <IoWaterOutline className="text-cyan-400" size={18} />
                                    <span className="text-white/60 text-xs font-semibold">WATER FLOW</span>
                                </div>
                                <div className="text-3xl font-extrabold text-white">{selectedBuilding.metrics.water}</div>
                            </div>

                            <div className="glass bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <WiThermometer className="text-rose-400" size={20} />
                                    <span className="text-white/60 text-xs font-semibold">HVAC STATUS</span>
                                </div>
                                <div className="text-base font-bold text-white">Cooling Active (22°C)</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
