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
*/
const VIT_AP_CENTER: [number, number] = [16.4950, 80.5000];

export const CAMPUS_DATA: BuildingData[] = [
    {
        id: "admin",
        name: "Central Admin Block",
        type: "admin",
        center: [16.4952, 80.4998],
        coordinates: [
            [16.4955, 80.4995], [16.4955, 80.5001],
            [16.4949, 80.5001], [16.4949, 80.4995]
        ],
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
        metrics: { energy: "450 kWh", water: "1200 L", status: "normal" },
    },
    {
        id: "academic-1",
        name: "Academic Block 1",
        type: "academic",
        center: [16.4965, 80.5015],
        coordinates: [
            [16.4970, 80.5010], [16.4970, 80.5020],
            [16.4960, 80.5020], [16.4960, 80.5010]
        ],
        image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80",
        metrics: { energy: "850 kWh", water: "3400 L", status: "warning" },
    },
    {
        id: "academic-2",
        name: "Academic Block 2",
        type: "academic",
        center: [16.4945, 80.5025],
        coordinates: [
            [16.4950, 80.5020], [16.4950, 80.5030],
            [16.4940, 80.5030], [16.4940, 80.5020]
        ],
        image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
        metrics: { energy: "920 kWh", water: "4100 L", status: "normal" },
    },
    {
        id: "hostel-mh",
        name: "Mens Hostel",
        type: "hostel",
        center: [16.4930, 80.4980],
        coordinates: [
            [16.4935, 80.4975], [16.4935, 80.4985],
            [16.4925, 80.4985], [16.4925, 80.4975]
        ],
        image: "https://plus.unsplash.com/premium_photo-1682089407335-51da24a30a10?w=800&q=80",
        metrics: { energy: "1100 kWh", water: "8500 L", status: "critical" },
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
