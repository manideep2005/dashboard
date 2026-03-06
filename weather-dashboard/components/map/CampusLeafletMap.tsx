"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TbBuildingCommunity } from "react-icons/tb";
import { renderToString } from "react-dom/server";

export type BuildingData = {
    id: string;
    name: string;
    type: "academic" | "hostel" | "admin" | "services";
    coordinates: [number, number][]; // Polygon bounds
    center: [number, number]; // Icon pin location
    image: string; // URL for the slide-out panel header
    metrics: {
        energy: string;
        water: string;
        status: "normal" | "warning" | "critical";
    };
};

/* 
  Approximated Coordinates focusing over VIT AP University, Amaravati.
  Real map integrations in production should use precise GPS survey bounds.
  16 Campus Buildings — each building has energy, water & status metrics.
*/
const VIT_AP_CENTER: [number, number] = [16.4945, 80.4990];

export const CAMPUS_DATA: BuildingData[] = [
    // ─── ROW 1 (NORTH): Academic & Lab ───
    {
        id: "academic-1",
        name: "Academic Block 1",
        type: "academic",
        center: [16.4975, 80.4975],
        coordinates: [
            [16.4978, 80.4971], [16.4978, 80.4979],
            [16.4972, 80.4979], [16.4972, 80.4971],
        ],
        image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80",
        metrics: { energy: "850 kWh", water: "3400 L", status: "warning" },
    },
    {
        id: "academic-2",
        name: "Academic Block 2",
        type: "academic",
        center: [16.4975, 80.4990],
        coordinates: [
            [16.4978, 80.4986], [16.4978, 80.4994],
            [16.4972, 80.4994], [16.4972, 80.4986],
        ],
        image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
        metrics: { energy: "920 kWh", water: "4100 L", status: "normal" },
    },
    {
        id: "lab-complex",
        name: "Lab Complex",
        type: "services",
        center: [16.4975, 80.5005],
        coordinates: [
            [16.4978, 80.5001], [16.4978, 80.5009],
            [16.4972, 80.5009], [16.4972, 80.5001],
        ],
        image: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=800&q=80",
        metrics: { energy: "1280 kWh", water: "2600 L", status: "warning" },
    },

    // ─── ROW 2: Admin, Library, Canteen ───
    {
        id: "admin",
        name: "Central Admin Block",
        type: "admin",
        center: [16.4960, 80.4975],
        coordinates: [
            [16.4963, 80.4971], [16.4963, 80.4979],
            [16.4957, 80.4979], [16.4957, 80.4971],
        ],
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
        metrics: { energy: "450 kWh", water: "1200 L", status: "normal" },
    },
    {
        id: "library",
        name: "Central Library",
        type: "services",
        center: [16.4960, 80.4990],
        coordinates: [
            [16.4963, 80.4986], [16.4963, 80.4994],
            [16.4957, 80.4994], [16.4957, 80.4986],
        ],
        image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
        metrics: { energy: "520 kWh", water: "950 L", status: "normal" },
    },
    {
        id: "canteen",
        name: "Canteen & Food Court",
        type: "services",
        center: [16.4960, 80.5005],
        coordinates: [
            [16.4963, 80.5001], [16.4963, 80.5009],
            [16.4957, 80.5009], [16.4957, 80.5001],
        ],
        image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80",
        metrics: { energy: "680 kWh", water: "4800 L", status: "normal" },
    },

    // ─── ROW 3: Women's Hostels ───
    {
        id: "hostel-wh1",
        name: "Women's Hostel 1",
        type: "hostel",
        center: [16.4945, 80.4975],
        coordinates: [
            [16.4948, 80.4971], [16.4948, 80.4979],
            [16.4942, 80.4979], [16.4942, 80.4971],
        ],
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        metrics: { energy: "720 kWh", water: "6200 L", status: "normal" },
    },
    {
        id: "hostel-wh2",
        name: "Women's Hostel 2",
        type: "hostel",
        center: [16.4945, 80.4990],
        coordinates: [
            [16.4948, 80.4986], [16.4948, 80.4994],
            [16.4942, 80.4994], [16.4942, 80.4986],
        ],
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        metrics: { energy: "690 kWh", water: "5900 L", status: "normal" },
    },
    {
        id: "hostel-wh3",
        name: "Women's Hostel 3",
        type: "hostel",
        center: [16.4945, 80.5005],
        coordinates: [
            [16.4948, 80.5001], [16.4948, 80.5009],
            [16.4942, 80.5009], [16.4942, 80.5001],
        ],
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        metrics: { energy: "710 kWh", water: "6100 L", status: "warning" },
    },

    // ─── ROW 4: Men's Hostels 1-4 ───
    {
        id: "hostel-mh1",
        name: "Men's Hostel 1",
        type: "hostel",
        center: [16.4930, 80.4970],
        coordinates: [
            [16.4933, 80.4966], [16.4933, 80.4974],
            [16.4927, 80.4974], [16.4927, 80.4966],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "980 kWh", water: "7800 L", status: "normal" },
    },
    {
        id: "hostel-mh2",
        name: "Men's Hostel 2",
        type: "hostel",
        center: [16.4930, 80.4983],
        coordinates: [
            [16.4933, 80.4979], [16.4933, 80.4987],
            [16.4927, 80.4987], [16.4927, 80.4979],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "1020 kWh", water: "8100 L", status: "normal" },
    },
    {
        id: "hostel-mh3",
        name: "Men's Hostel 3",
        type: "hostel",
        center: [16.4930, 80.4996],
        coordinates: [
            [16.4933, 80.4992], [16.4933, 80.5000],
            [16.4927, 80.5000], [16.4927, 80.4992],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "1100 kWh", water: "8500 L", status: "critical" },
    },
    {
        id: "hostel-mh4",
        name: "Men's Hostel 4",
        type: "hostel",
        center: [16.4930, 80.5009],
        coordinates: [
            [16.4933, 80.5005], [16.4933, 80.5013],
            [16.4927, 80.5013], [16.4927, 80.5005],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "950 kWh", water: "7500 L", status: "warning" },
    },

    // ─── ROW 5 (SOUTH): Men's Hostels 5-7 ───
    {
        id: "hostel-mh5",
        name: "Men's Hostel 5",
        type: "hostel",
        center: [16.4915, 80.4975],
        coordinates: [
            [16.4918, 80.4971], [16.4918, 80.4979],
            [16.4912, 80.4979], [16.4912, 80.4971],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "870 kWh", water: "7200 L", status: "normal" },
    },
    {
        id: "hostel-mh6",
        name: "Men's Hostel 6",
        type: "hostel",
        center: [16.4915, 80.4990],
        coordinates: [
            [16.4918, 80.4986], [16.4918, 80.4994],
            [16.4912, 80.4994], [16.4912, 80.4986],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "910 kWh", water: "7600 L", status: "normal" },
    },
    {
        id: "hostel-mh7",
        name: "Men's Hostel 7",
        type: "hostel",
        center: [16.4915, 80.5005],
        coordinates: [
            [16.4918, 80.5001], [16.4918, 80.5009],
            [16.4912, 80.5009], [16.4912, 80.5001],
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "940 kWh", water: "7400 L", status: "normal" },
    },
];

// Custom map icon since default Leaflet markers break frequently in NextJS
const createCustomIcon = (status: "normal" | "warning" | "critical") => {
    let color = "#3b82f6"; // Blue
    if (status === "warning") color = "#f59e0b"; // Ornage/Amber
    if (status === "critical") color = "#ef4444"; // Red

    // Render a React icon to a raw SVG HTML string
    const iconHtml = renderToString(
        <div style={{ color, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }}>
            <TbBuildingCommunity size={32} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
};

function MapEventHandler({ selectedBuildingId, onMapClick }: { selectedBuildingId: string | null, onMapClick: () => void }) {
    const map = useMap();

    useEffect(() => {
        // When a building is selected, smoothly fly the camera to its center
        if (selectedBuildingId) {
            const selected = CAMPUS_DATA.find(b => b.id === selectedBuildingId);
            if (selected) {
                map.flyTo(selected.center, 18, { duration: 1.5 });
            }
        } else {
            // Re-center if deselected
            map.flyTo(VIT_AP_CENTER, 16, { duration: 1.5 });
        }
    }, [selectedBuildingId, map]);

    return null;
}

export default function CampusLeafletMap({ onSelectBuilding, selectedId }: { onSelectBuilding: (data: BuildingData | null) => void, selectedId: string | null }) {
    const [mounted, setMounted] = useState(false);

    // Avoid SSR issues with window/document inside Leaflet
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-full h-full flex items-center justify-center text-white/50">Loading Cartography Engine...</div>;

    return (
        <MapContainer
            center={VIT_AP_CENTER}
            zoom={16}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            zoomControl={false} // Disable default zoom to keep UI clean
        >
            {/* 
        ESRI World Imagery provides high-res satellite photos globally
        Without requiring an API key (unlike Google Maps)
      */}
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                maxZoom={19}
            />

            <MapEventHandler selectedBuildingId={selectedId} onMapClick={() => onSelectBuilding(null)} />

            {CAMPUS_DATA.map((building) => {
                const isSelected = selectedId === building.id;
                let polyColor = "#3b82f6";
                if (building.metrics.status === "warning") polyColor = "#f59e0b";
                if (building.metrics.status === "critical") polyColor = "#ef4444";

                return (
                    <div key={building.id}>
                        {/* Clickable Overlay Shape above the building */}
                        <Polygon
                            positions={building.coordinates}
                            pathOptions={{
                                color: polyColor,
                                fillColor: polyColor,
                                fillOpacity: isSelected ? 0.6 : 0.2, // Highlight if selected
                                weight: isSelected ? 3 : 1
                            }}
                            eventHandlers={{
                                click: () => onSelectBuilding(isSelected ? null : building), // Toggle selection
                            }}
                        >
                            <Tooltip sticky direction="top" opacity={0.9}>
                                <div className="font-bold text-gray-800">{building.name}</div>
                                <div className="text-xs text-gray-500">Click for details</div>
                            </Tooltip>
                        </Polygon>

                        {/* Visual Icon floating above center */}
                        <Marker
                            position={building.center}
                            icon={createCustomIcon(building.metrics.status)}
                            eventHandlers={{
                                click: () => onSelectBuilding(isSelected ? null : building), // Toggle selection
                            }}
                        />
                    </div>
                );
            })}
        </MapContainer>
    );
}
