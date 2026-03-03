"use client";

import Navbar from "@/components/Navbar";

export default function WaterDashboard() {
    return (
        <div className="min-h-screen bg-animated">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Water Resources</h1>
                <p className="text-white/40 mb-8 font-medium">Coming soon: Water usage, leak detection and conservation.</p>
            </main>
        </div>
    );
}
