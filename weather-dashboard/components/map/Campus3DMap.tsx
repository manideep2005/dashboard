"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type BuildingData = {
    id: string;
    name: string;
    type: "academic" | "hostel" | "admin" | "services";
    coordinates: [number, number][][];
    center: [number, number];
    height: number;
    image: string;
    metrics: {
        energy: string;
        water: string;
        occupancy: string;
        temperature: string;
        status: "normal" | "warning" | "critical";
    };
};

const VIT_AP_CENTER: [number, number] = [80.4990, 16.4945];

export const CAMPUS_DATA: BuildingData[] = [
    {
        id: "academic-1", name: "Academic Block 1", type: "academic",
        center: [80.4975, 16.4975], height: 18,
        coordinates: [[[80.4970, 16.4978], [80.4980, 16.4978], [80.4980, 16.4972], [80.4970, 16.4972], [80.4970, 16.4978]]],
        image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80",
        metrics: { energy: "850 kWh", water: "3,400 L", occupancy: "78%", temperature: "23°C", status: "warning" },
    },
    {
        id: "academic-2", name: "Academic Block 2", type: "academic",
        center: [80.4990, 16.4975], height: 18,
        coordinates: [[[80.4985, 16.4978], [80.4995, 16.4978], [80.4995, 16.4972], [80.4985, 16.4972], [80.4985, 16.4978]]],
        image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
        metrics: { energy: "920 kWh", water: "4,100 L", occupancy: "65%", temperature: "22°C", status: "normal" },
    },
    {
        id: "lab-complex", name: "Lab Complex", type: "services",
        center: [80.5005, 16.4975], height: 14,
        coordinates: [[[80.5000, 16.4978], [80.5010, 16.4978], [80.5010, 16.4972], [80.5000, 16.4972], [80.5000, 16.4978]]],
        image: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=800&q=80",
        metrics: { energy: "1,280 kWh", water: "2,600 L", occupancy: "82%", temperature: "21°C", status: "warning" },
    },
    {
        id: "admin", name: "Central Admin Block", type: "admin",
        center: [80.4975, 16.4960], height: 22,
        coordinates: [[[80.4970, 16.4963], [80.4980, 16.4963], [80.4980, 16.4957], [80.4970, 16.4957], [80.4970, 16.4963]]],
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
        metrics: { energy: "450 kWh", water: "1,200 L", occupancy: "45%", temperature: "24°C", status: "normal" },
    },
    {
        id: "library", name: "Central Library", type: "services",
        center: [80.4990, 16.4960], height: 16,
        coordinates: [[[80.4985, 16.4963], [80.4995, 16.4963], [80.4995, 16.4957], [80.4985, 16.4957], [80.4985, 16.4963]]],
        image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
        metrics: { energy: "520 kWh", water: "950 L", occupancy: "58%", temperature: "22°C", status: "normal" },
    },
    {
        id: "canteen", name: "Canteen & Food Court", type: "services",
        center: [80.5005, 16.4960], height: 10,
        coordinates: [[[80.5000, 16.4963], [80.5010, 16.4963], [80.5010, 16.4957], [80.5000, 16.4957], [80.5000, 16.4963]]],
        image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80",
        metrics: { energy: "680 kWh", water: "4,800 L", occupancy: "91%", temperature: "25°C", status: "normal" },
    },
    {
        id: "hostel-wh1", name: "Women's Hostel 1", type: "hostel",
        center: [80.4975, 16.4945], height: 20,
        coordinates: [[[80.4970, 16.4948], [80.4980, 16.4948], [80.4980, 16.4942], [80.4970, 16.4942], [80.4970, 16.4948]]],
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        metrics: { energy: "720 kWh", water: "6,200 L", occupancy: "88%", temperature: "23°C", status: "normal" },
    },
    {
        id: "hostel-wh2", name: "Women's Hostel 2", type: "hostel",
        center: [80.4990, 16.4945], height: 20,
        coordinates: [[[80.4985, 16.4948], [80.4995, 16.4948], [80.4995, 16.4942], [80.4985, 16.4942], [80.4985, 16.4948]]],
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        metrics: { energy: "690 kWh", water: "5,900 L", occupancy: "85%", temperature: "23°C", status: "normal" },
    },
    {
        id: "hostel-wh3", name: "Women's Hostel 3", type: "hostel",
        center: [80.5005, 16.4945], height: 20,
        coordinates: [[[80.5000, 16.4948], [80.5010, 16.4948], [80.5010, 16.4942], [80.5000, 16.4942], [80.5000, 16.4948]]],
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        metrics: { energy: "710 kWh", water: "6,100 L", occupancy: "90%", temperature: "24°C", status: "warning" },
    },
    {
        id: "hostel-mh1", name: "Men's Hostel 1", type: "hostel",
        center: [80.4970, 16.4930], height: 24,
        coordinates: [[[80.4965, 16.4933], [80.4975, 16.4933], [80.4975, 16.4927], [80.4965, 16.4927], [80.4965, 16.4933]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "980 kWh", water: "7,800 L", occupancy: "92%", temperature: "24°C", status: "normal" },
    },
    {
        id: "hostel-mh2", name: "Men's Hostel 2", type: "hostel",
        center: [80.4983, 16.4930], height: 24,
        coordinates: [[[80.4978, 16.4933], [80.4988, 16.4933], [80.4988, 16.4927], [80.4978, 16.4927], [80.4978, 16.4933]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "1,020 kWh", water: "8,100 L", occupancy: "94%", temperature: "25°C", status: "normal" },
    },
    {
        id: "hostel-mh3", name: "Men's Hostel 3", type: "hostel",
        center: [80.4996, 16.4930], height: 24,
        coordinates: [[[80.4991, 16.4933], [80.5001, 16.4933], [80.5001, 16.4927], [80.4991, 16.4927], [80.4991, 16.4933]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "1,100 kWh", water: "8,500 L", occupancy: "96%", temperature: "26°C", status: "critical" },
    },
    {
        id: "hostel-mh4", name: "Men's Hostel 4", type: "hostel",
        center: [80.5009, 16.4930], height: 24,
        coordinates: [[[80.5004, 16.4933], [80.5014, 16.4933], [80.5014, 16.4927], [80.5004, 16.4927], [80.5004, 16.4933]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "950 kWh", water: "7,500 L", occupancy: "87%", temperature: "24°C", status: "warning" },
    },
    {
        id: "hostel-mh5", name: "Men's Hostel 5", type: "hostel",
        center: [80.4975, 16.4915], height: 24,
        coordinates: [[[80.4970, 16.4918], [80.4980, 16.4918], [80.4980, 16.4912], [80.4970, 16.4912], [80.4970, 16.4918]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "870 kWh", water: "7,200 L", occupancy: "83%", temperature: "23°C", status: "normal" },
    },
    {
        id: "hostel-mh6", name: "Men's Hostel 6", type: "hostel",
        center: [80.4990, 16.4915], height: 24,
        coordinates: [[[80.4985, 16.4918], [80.4995, 16.4918], [80.4995, 16.4912], [80.4985, 16.4912], [80.4985, 16.4918]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "910 kWh", water: "7,600 L", occupancy: "86%", temperature: "23°C", status: "normal" },
    },
    {
        id: "hostel-mh7", name: "Men's Hostel 7", type: "hostel",
        center: [80.5005, 16.4915], height: 24,
        coordinates: [[[80.5000, 16.4918], [80.5010, 16.4918], [80.5010, 16.4912], [80.5000, 16.4912], [80.5000, 16.4918]]],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "940 kWh", water: "7,400 L", occupancy: "81%", temperature: "23°C", status: "normal" },
    },
];

function getColor(status: string): string {
    if (status === "critical") return "#ef4444";
    if (status === "warning") return "#f59e0b";
    return "#3b82f6";
}

function getGlowColor(status: string): string {
    if (status === "critical") return "rgba(239,68,68,0.5)";
    if (status === "warning") return "rgba(245,158,11,0.4)";
    return "rgba(59,130,246,0.3)";
}

export default function Campus3DMap({
    onSelectBuilding,
    selectedId,
}: {
    onSelectBuilding: (data: BuildingData | null) => void;
    selectedId: string | null;
}) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const handleClickRef = useRef<(id: string) => void>();

    handleClickRef.current = (buildingId: string) => {
        const building = CAMPUS_DATA.find((b) => b.id === buildingId);
        if (!building) return;
        if (selectedId === buildingId) {
            onSelectBuilding(null);
        } else {
            onSelectBuilding(building);
        }
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    satellite: {
                        type: "raster",
                        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
                        tileSize: 256,
                        maxzoom: 19,
                        attribution: "Tiles &copy; Esri",
                    },
                },
                layers: [{
                    id: "satellite-layer",
                    type: "raster",
                    source: "satellite",
                    minzoom: 0,
                    maxzoom: 19,
                }],
                // Dark sky/fog for atmosphere
                sky: { "sky-color": "#0a0e1a", "horizon-color": "#0f172a", "fog-color": "#0a0e1a" },
            },
            center: VIT_AP_CENTER,
            zoom: 15.8,
            pitch: 55,
            bearing: -25,
            maxPitch: 70,
        });

        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

        map.on("load", () => {
            const features = CAMPUS_DATA.map((b) => ({
                type: "Feature" as const,
                properties: {
                    id: b.id, name: b.name, type: b.type, height: b.height,
                    color: getColor(b.metrics.status),
                    glowColor: getGlowColor(b.metrics.status),
                    energy: b.metrics.energy, water: b.metrics.water,
                    occupancy: b.metrics.occupancy, temperature: b.metrics.temperature,
                    status: b.metrics.status,
                },
                geometry: { type: "Polygon" as const, coordinates: b.coordinates },
            }));

            map.addSource("buildings", {
                type: "geojson",
                data: { type: "FeatureCollection", features },
            });

            // Ground glow ring under each building
            map.addLayer({
                id: "buildings-glow",
                type: "fill",
                source: "buildings",
                paint: {
                    "fill-color": ["get", "glowColor"],
                    "fill-opacity": 0.45,
                },
            });

            // 3D extruded buildings
            map.addLayer({
                id: "buildings-3d",
                type: "fill-extrusion",
                source: "buildings",
                paint: {
                    "fill-extrusion-color": ["get", "color"],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 0.88,
                },
            });

            // Top edge outline
            map.addLayer({
                id: "buildings-outline",
                type: "line",
                source: "buildings",
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 1.2,
                    "line-opacity": 0.35,
                },
            });

            // Styled labels for each building
            CAMPUS_DATA.forEach((b) => {
                const el = document.createElement("div");
                const statusDot = b.metrics.status === "critical" ? "#ef4444" :
                    b.metrics.status === "warning" ? "#f59e0b" : "#22c55e";
                el.innerHTML = `
                    <div style="
                        display:flex; align-items:center; gap:5px;
                        background:rgba(0,0,0,0.65); backdrop-filter:blur(8px);
                        padding:3px 10px 3px 8px; border-radius:20px;
                        border:1px solid rgba(255,255,255,0.12);
                        pointer-events:none; white-space:nowrap;
                        box-shadow:0 2px 12px rgba(0,0,0,0.4);
                    ">
                        <span style="width:6px;height:6px;border-radius:50%;background:${statusDot};display:inline-block;box-shadow:0 0 6px ${statusDot}"></span>
                        <span style="color:#e2e8f0;font-size:10px;font-weight:600;letter-spacing:0.03em">${b.name}</span>
                    </div>
                `;
                new maplibregl.Marker({ element: el, anchor: "center" })
                    .setLngLat(b.center)
                    .addTo(map);
            });

            // Click
            map.on("click", "buildings-3d", (e) => {
                if (e.features?.[0]?.properties?.id) {
                    handleClickRef.current?.(e.features[0].properties.id);
                }
            });

            // Cursor
            map.on("mouseenter", "buildings-3d", () => { map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "buildings-3d", () => {
                map.getCanvas().style.cursor = "";
                if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
            });

            // Hover tooltip
            map.on("mousemove", "buildings-3d", (e) => {
                if (!e.features?.[0]?.properties) return;
                const p = e.features[0].properties;
                const dot = p.status === "critical" ? "#ef4444" : p.status === "warning" ? "#f59e0b" : "#22c55e";
                const statusText = p.status === "critical" ? "Critical" : p.status === "warning" ? "Warning" : "Operational";

                if (popupRef.current) popupRef.current.remove();
                popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 20, className: "dt-popup" })
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div style="font-family:system-ui,sans-serif">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                                <span style="width:8px;height:8px;border-radius:50%;background:${dot};box-shadow:0 0 8px ${dot}"></span>
                                <span style="font-weight:700;font-size:13px;color:#f1f5f9">${p.name}</span>
                            </div>
                            <div style="font-size:10px;color:${dot};font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">${statusText}</div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:11px;color:#cbd5e1">
                                <div><span style="color:#fbbf24">&#9889;</span> ${p.energy}</div>
                                <div><span style="color:#22d3ee">&#128167;</span> ${p.water}</div>
                                <div><span style="color:#a78bfa">&#9632;</span> ${p.occupancy}</div>
                                <div><span style="color:#fb7185">&#9832;</span> ${p.temperature}</div>
                            </div>
                            <div style="font-size:9px;color:#64748b;margin-top:8px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px">Click to view details</div>
                        </div>
                    `)
                    .addTo(map);
            });
        });

        mapRef.current = map;
        return () => { map.remove(); mapRef.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Selection effects
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        if (selectedId) {
            const building = CAMPUS_DATA.find((b) => b.id === selectedId);
            if (building) {
                map.flyTo({ center: building.center, zoom: 17.5, pitch: 60, bearing: -10, duration: 1200 });
            }
        } else {
            map.flyTo({ center: VIT_AP_CENTER, zoom: 15.8, pitch: 55, bearing: -25, duration: 1200 });
        }

        if (map.getLayer("buildings-3d")) {
            map.setPaintProperty("buildings-3d", "fill-extrusion-opacity", [
                "case", ["==", ["get", "id"], selectedId || ""], 1, 0.7,
            ]);
            map.setPaintProperty("buildings-3d", "fill-extrusion-color", [
                "case", ["==", ["get", "id"], selectedId || ""], "#22d3ee", ["get", "color"],
            ]);
        }
        if (map.getLayer("buildings-glow")) {
            map.setPaintProperty("buildings-glow", "fill-opacity", [
                "case", ["==", ["get", "id"], selectedId || ""], 0.7, 0.45,
            ]);
        }
    }, [selectedId]);

    return (
        <>
            <div ref={mapContainerRef} className="w-full h-full" />
            <style jsx global>{`
                .dt-popup .maplibregl-popup-content {
                    background: rgba(10, 14, 26, 0.94);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 14px;
                    padding: 12px 16px;
                    color: #e2e8f0;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1);
                }
                .dt-popup .maplibregl-popup-tip {
                    border-top-color: rgba(10, 14, 26, 0.94);
                }
                .maplibregl-ctrl-group {
                    background: rgba(10, 14, 26, 0.85) !important;
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    border-radius: 14px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                }
                .maplibregl-ctrl-group button {
                    border-color: rgba(255,255,255,0.06) !important;
                }
                .maplibregl-ctrl-group button span {
                    filter: invert(1) brightness(0.8);
                }
                .maplibregl-ctrl-attrib { display: none !important; }
            `}</style>
        </>
    );
}
