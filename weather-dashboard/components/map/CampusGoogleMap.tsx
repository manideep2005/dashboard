"use client";

import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow } from "@react-google-maps/api";

export type BuildingData = {
    id: string;
    name: string;
    type: "academic" | "hostel" | "admin" | "services";
    coordinates: { lat: number; lng: number }[];
    center: { lat: number; lng: number };
    metrics: {
        energy: string;
        water: string;
        occupancy: string;
        temperature: string;
        status: "normal" | "warning" | "critical";
    };
};

const VIT_AP_CENTER = { lat: 16.4945, lng: 80.4990 };

export const CAMPUS_DATA: BuildingData[] = [
    {
        id: "academic-ab1", name: "Academic Block 1 (AB-1)", type: "academic",
        center: { lat: 16.495774354545457, lng: 80.50035104545455 },
        coordinates: [{ "lat": 16.4953695, "lng": 80.5002541 }, { "lat": 16.4956387, "lng": 80.5005322 }, { "lat": 16.4959199, "lng": 80.5008227 }, { "lat": 16.4962748, "lng": 80.5006993 }, { "lat": 16.4961976, "lng": 80.5004794 }, { "lat": 16.4960485, "lng": 80.5005384 }, { "lat": 16.4958295, "lng": 80.500313 }, { "lat": 16.4956576, "lng": 80.5001361 }, { "lat": 16.4957193, "lng": 80.499959 }, { "lat": 16.495493, "lng": 80.4998732 }, { "lat": 16.4953695, "lng": 80.5002541 }],
        metrics: { "energy": "678 kWh", "water": "7649 L", "occupancy": "61%", "temperature": "24°C", "status": "normal" }
    },
    {
        id: "academic-ab2", name: "Academic Block 2 (AB-2)", type: "academic",
        center: { lat: 16.495772871428574, lng: 80.49816485714284 },
        coordinates: [{ "lat": 16.4954878, "lng": 80.4986099 }, { "lat": 16.4953695, "lng": 80.4982291 }, { "lat": 16.4956275, "lng": 80.4979188 }, { "lat": 16.4958941, "lng": 80.4976604 }, { "lat": 16.4962336, "lng": 80.4977784 }, { "lat": 16.496177, "lng": 80.4979984 }, { "lat": 16.4960073, "lng": 80.4979447 }, { "lat": 16.4959207, "lng": 80.4980399 }, { "lat": 16.4958444, "lng": 80.4981237 }, { "lat": 16.4957876, "lng": 80.4981861 }, { "lat": 16.4956936, "lng": 80.4982893 }, { "lat": 16.4956215, "lng": 80.4983685 }, { "lat": 16.4956678, "lng": 80.4985509 }, { "lat": 16.4954878, "lng": 80.4986099 }],
        metrics: { "energy": "1058 kWh", "water": "3752 L", "occupancy": "79%", "temperature": "21°C", "status": "normal" }
    },
    {
        id: "admin-cb", name: "Central Block (CB)", type: "admin",
        center: { lat: 16.494381577272726, lng: 80.4992272409091 },
        coordinates: [{ "lat": 16.4946806, "lng": 80.4998706 }, { "lat": 16.4945793, "lng": 80.4998672 }, { "lat": 16.4944576, "lng": 80.4998535 }, { "lat": 16.4943408, "lng": 80.4998153 }, { "lat": 16.4942334, "lng": 80.4997541 }, { "lat": 16.4941395, "lng": 80.4996722 }, { "lat": 16.4940728, "lng": 80.4995728 }, { "lat": 16.4940403, "lng": 80.4994722 }, { "lat": 16.49402, "lng": 80.4993729 }, { "lat": 16.4940111, "lng": 80.4992499 }, { "lat": 16.4940109, "lng": 80.499172 }, { "lat": 16.4940141, "lng": 80.4991293 }, { "lat": 16.4940426, "lng": 80.4989802 }, { "lat": 16.4940893, "lng": 80.4988661 }, { "lat": 16.4941477, "lng": 80.4987513 }, { "lat": 16.4942148, "lng": 80.4986461 }, { "lat": 16.4943011, "lng": 80.4985764 }, { "lat": 16.4943984, "lng": 80.4985047 }, { "lat": 16.4945163, "lng": 80.4984487 }, { "lat": 16.4947175, "lng": 80.4984221 }, { "lat": 16.4947008, "lng": 80.498659 }, { "lat": 16.4946849, "lng": 80.4988838 }, { "lat": 16.4946215, "lng": 80.4988767 }, { "lat": 16.494558, "lng": 80.4988826 }, { "lat": 16.4944968, "lng": 80.4989013 }, { "lat": 16.4944402, "lng": 80.4989321 }, { "lat": 16.4943905, "lng": 80.4989738 }, { "lat": 16.4943496, "lng": 80.4990249 }, { "lat": 16.494319, "lng": 80.4990833 }, { "lat": 16.4942999, "lng": 80.4991467 }, { "lat": 16.4942953, "lng": 80.4991919 }, { "lat": 16.4942931, "lng": 80.4992129 }, { "lat": 16.4942988, "lng": 80.4992791 }, { "lat": 16.4943248, "lng": 80.4993283 }, { "lat": 16.4943604, "lng": 80.4993704 }, { "lat": 16.4944004, "lng": 80.4994139 }, { "lat": 16.4944513, "lng": 80.499467 }, { "lat": 16.4945033, "lng": 80.4994905 }, { "lat": 16.4945501, "lng": 80.4995062 }, { "lat": 16.4946215, "lng": 80.4995281 }, { "lat": 16.4947227, "lng": 80.4995312 }, { "lat": 16.4947014, "lng": 80.499703 }, { "lat": 16.4946964, "lng": 80.4997437 }, { "lat": 16.4946806, "lng": 80.4998706 }],
        metrics: { "energy": "826 kWh", "water": "9024 L", "occupancy": "61%", "temperature": "25°C", "status": "normal" }
    },
    {
        id: "services-sac", name: "Student Activity Center (SAC)", type: "services",
        center: { lat: 16.494775477777782, lng: 80.4979906111111 },
        coordinates: [{ "lat": 16.4949194, "lng": 80.4981485 }, { "lat": 16.4947013, "lng": 80.4981501 }, { "lat": 16.4945619, "lng": 80.4981512 }, { "lat": 16.4945672, "lng": 80.4977004 }, { "lat": 16.4947698, "lng": 80.4976907 }, { "lat": 16.4947735, "lng": 80.4979774 }, { "lat": 16.4948505, "lng": 80.4979753 }, { "lat": 16.4949163, "lng": 80.4979734 }, { "lat": 16.4949194, "lng": 80.4981485 }],
        metrics: { "energy": "1714 kWh", "water": "5915 L", "occupancy": "89%", "temperature": "25°C", "status": "normal" }
    },
    {
        id: "hostel-lh1", name: "Ladies Hostel 1 (LH-1)", type: "hostel",
        center: { lat: 16.492029680952378, lng: 80.49672819047619 },
        coordinates: [{ "lat": 16.4922678, "lng": 80.4967618 }, { "lat": 16.4921694, "lng": 80.4968657 }, { "lat": 16.4921099, "lng": 80.4968043 }, { "lat": 16.4920923, "lng": 80.4968229 }, { "lat": 16.4921518, "lng": 80.4968842 }, { "lat": 16.4920543, "lng": 80.4969871 }, { "lat": 16.491923, "lng": 80.4968518 }, { "lat": 16.4919978, "lng": 80.496773 }, { "lat": 16.4919758, "lng": 80.4967503 }, { "lat": 16.4919011, "lng": 80.4968292 }, { "lat": 16.4918111, "lng": 80.4967365 }, { "lat": 16.4918868, "lng": 80.4966567 }, { "lat": 16.4918176, "lng": 80.4965854 }, { "lat": 16.4918853, "lng": 80.4965139 }, { "lat": 16.4919545, "lng": 80.4965779 }, { "lat": 16.4920246, "lng": 80.4965112 }, { "lat": 16.4921126, "lng": 80.4966018 }, { "lat": 16.4920329, "lng": 80.496686 }, { "lat": 16.4920536, "lng": 80.4967073 }, { "lat": 16.4921333, "lng": 80.4966232 }, { "lat": 16.4922678, "lng": 80.4967618 }],
        metrics: { "energy": "624 kWh", "water": "7236 L", "occupancy": "71%", "temperature": "24°C", "status": "normal" }
    },
    {
        id: "services-food-street", name: "Food Street", type: "services",
        center: { lat: 16.49379288333333, lng: 80.49836463333334 },
        coordinates: [{ "lat": 16.4940749, "lng": 80.4984864 }, { "lat": 16.4937975, "lng": 80.4982254 }, { "lat": 16.493618, "lng": 80.4980565 }, { "lat": 16.4933875, "lng": 80.4982849 }, { "lat": 16.4938045, "lng": 80.4986482 }, { "lat": 16.4940749, "lng": 80.4984864 }],
        metrics: { "energy": "1491 kWh", "water": "8987 L", "occupancy": "83%", "temperature": "22°C", "status": "normal" }
    },




    {
        id: "hostel-wh2", name: "Women's Hostel 2", type: "hostel",
        center: { lat: 16.491909683333333, lng: 80.4972532 },
        coordinates: [{ "lat": 16.4919358, "lng": 80.4970226 }, { "lat": 16.4920413, "lng": 80.4971348 }, { "lat": 16.4921727, "lng": 80.4972745 }, { "lat": 16.4918012, "lng": 80.4976571 }, { "lat": 16.4915713, "lng": 80.4974076 }, { "lat": 16.4919358, "lng": 80.4970226 }],
        metrics: { "energy": "945 kWh", "water": "4026 L", "occupancy": "71%", "temperature": "22°C", "status": "normal" }
    },
    {
        id: "hostel-wh3", name: "Women's Hostel 3", type: "hostel",
        center: { lat: 16.492793700000004, lng: 80.49748181666668 },
        coordinates: [{ "lat": 16.4927765, "lng": 80.4972458 }, { "lat": 16.4928923, "lng": 80.4973786 }, { "lat": 16.4930746, "lng": 80.4975877 }, { "lat": 16.4927808, "lng": 80.4978897 }, { "lat": 16.4924615, "lng": 80.4975433 }, { "lat": 16.4927765, "lng": 80.4972458 }],
        metrics: { "energy": "1065 kWh", "water": "7487 L", "occupancy": "83%", "temperature": "24°C", "status": "normal" }
    },
    {
        id: "hostel-mh1", name: "Men's Hostel 1", type: "hostel",
        center: { lat: 16.4943196625, lng: 80.5004970625 },
        coordinates: [{ "lat": 16.4944281, "lng": 80.5003111 }, { "lat": 16.494339, "lng": 80.5003085 }, { "lat": 16.494058, "lng": 80.5003004 }, { "lat": 16.4940374, "lng": 80.5008687 }, { "lat": 16.4944178, "lng": 80.5008633 }, { "lat": 16.4944231, "lng": 80.5005802 }, { "lat": 16.4944258, "lng": 80.5004332 }, { "lat": 16.4944281, "lng": 80.5003111 }],
        metrics: { "energy": "695 kWh", "water": "2244 L", "occupancy": "71%", "temperature": "21°C", "status": "normal" }
    },
    {
        id: "hostel-mh2", name: "Men's Hostel 2", type: "hostel",
        center: { lat: 16.493658375, lng: 80.5011990375 },
        coordinates: [{ "lat": 16.4939203, "lng": 80.5010187 }, { "lat": 16.4937284, "lng": 80.5010305 }, { "lat": 16.4937027, "lng": 80.501032 }, { "lat": 16.4933825, "lng": 80.5010517 }, { "lat": 16.4933627, "lng": 80.5013118 }, { "lat": 16.493343, "lng": 80.5015713 }, { "lat": 16.4939071, "lng": 80.5015576 }, { "lat": 16.4939203, "lng": 80.5010187 }],
        metrics: { "energy": "1139 kWh", "water": "4054 L", "occupancy": "75%", "temperature": "21°C", "status": "warning" }
    },
    {
        id: "hostel-mh3", name: "Men's Hostel 3", type: "hostel",
        center: { lat: 16.49236255, lng: 80.50123341666666 },
        coordinates: [{ "lat": 16.4925389, "lng": 80.5010598 }, { "lat": 16.4925352, "lng": 80.5012315 }, { "lat": 16.4925277, "lng": 80.5014703 }, { "lat": 16.4920221, "lng": 80.5014762 }, { "lat": 16.4920125, "lng": 80.5011029 }, { "lat": 16.4925389, "lng": 80.5010598 }],
        metrics: { "energy": "902 kWh", "water": "5141 L", "occupancy": "72%", "temperature": "25°C", "status": "normal" }
    },
    {
        id: "hostel-mh4", name: "Men's Hostel 4", type: "hostel",
        center: { lat: 16.48823926, lng: 80.50204846 },
        coordinates: [{ "lat": 16.4882169, "lng": 80.5020118 }, { "lat": 16.488287, "lng": 80.5020257 }, { "lat": 16.4882728, "lng": 80.5021034 }, { "lat": 16.4882027, "lng": 80.5020896 }, { "lat": 16.4882169, "lng": 80.5020118 }],
        metrics: { "energy": "897 kWh", "water": "4772 L", "occupancy": "71%", "temperature": "24°C", "status": "normal" }
    },
    {
        id: "hostel-mh5", name: "Men's Hostel 5", type: "hostel",
        center: { lat: 16.494217983333332, lng: 80.50120108333334 },
        coordinates: [{ "lat": 16.494351, "lng": 80.5010081 }, { "lat": 16.4939911, "lng": 80.5010135 }, { "lat": 16.4939911, "lng": 80.5015282 }, { "lat": 16.4942994, "lng": 80.501425 }, { "lat": 16.4943243, "lng": 80.5012236 }, { "lat": 16.494351, "lng": 80.5010081 }],
        metrics: { "energy": "461 kWh", "water": "6288 L", "occupancy": "43%", "temperature": "22°C", "status": "normal" }
    },
    {
        id: "hostel-mh6", name: "Men's Hostel 6", type: "hostel",
        center: { lat: 16.4920818625, lng: 80.4999802625 },
        coordinates: [{ "lat": 16.4920912, "lng": 80.4995537 }, { "lat": 16.4925432, "lng": 80.5000838 }, { "lat": 16.4922288, "lng": 80.500386 }, { "lat": 16.4920896, "lng": 80.5002331 }, { "lat": 16.4919631, "lng": 80.5001042 }, { "lat": 16.4918742, "lng": 80.5000169 }, { "lat": 16.4917736, "lng": 80.4999107 }, { "lat": 16.4920912, "lng": 80.4995537 }],
        metrics: { "energy": "1026 kWh", "water": "7580 L", "occupancy": "82%", "temperature": "22°C", "status": "normal" }
    },
    {
        id: "hostel-mh7", name: "Men's Hostel 7", type: "hostel",
        center: { lat: 16.492663283333332, lng: 80.50052515 },
        coordinates: [{ "lat": 16.4926418, "lng": 80.5001901 }, { "lat": 16.4923752, "lng": 80.5004801 }, { "lat": 16.4925787, "lng": 80.5007277 }, { "lat": 16.4927318, "lng": 80.5009287 }, { "lat": 16.4930104, "lng": 80.5006342 }, { "lat": 16.4926418, "lng": 80.5001901 }],
        metrics: { "energy": "1054 kWh", "water": "7687 L", "occupancy": "77%", "temperature": "22°C", "status": "normal" }
    }
];

function getColor(status: string): string {
    if (status === "critical") return "#ef4444";
    if (status === "warning") return "#f59e0b";
    return "#3b82f6";
}

const mapContainerStyle = { width: "100%", height: "100%" };

const mapOptions: google.maps.MapOptions = {
    mapTypeId: "satellite",
    tilt: 45,
    heading: 320,
    zoom: 17,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    rotateControl: true,
    gestureHandling: "greedy",
};

export default function CampusGoogleMap({
    onSelectBuilding,
    selectedId,
}: {
    onSelectBuilding: (data: BuildingData | null) => void;
    selectedId: string | null;
}) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    });

    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [infoBuilding, setInfoBuilding] = useState<BuildingData | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => { setMapInstance(map); }, []);

    const handleBuildingClick = useCallback(
        (building: BuildingData) => {
            if (selectedId === building.id) {
                onSelectBuilding(null);
                mapInstance?.panTo(VIT_AP_CENTER);
                mapInstance?.setZoom(17);
            } else {
                onSelectBuilding(building);
                mapInstance?.panTo(building.center);
                mapInstance?.setZoom(19);
            }
        },
        [selectedId, onSelectBuilding, mapInstance]
    );

    if (loadError) {
        return (
            <div className="flex h-full w-full items-center justify-center text-red-400 flex-col gap-3 bg-[#0a0e1a]">
                <div className="text-lg font-bold">Google Maps failed to load</div>
                <div className="text-sm text-white/50">Check NEXT_PUBLIC_GOOGLE_MAPS_KEY in .env.local</div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#0a0e1a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/40 text-sm tracking-wider">Loading Google Maps...</span>
                </div>
            </div>
        );
    }

    return (
        <GoogleMap mapContainerStyle={mapContainerStyle} center={VIT_AP_CENTER} options={mapOptions} onLoad={onLoad}>
            {CAMPUS_DATA.map((building) => {
                const isSelected = selectedId === building.id;
                const isHovered = hoveredId === building.id;
                const color = getColor(building.metrics.status);
                return (
                    <div key={building.id}>
                        <Polygon
                            paths={building.coordinates}
                            options={{
                                fillColor: isSelected ? "#22d3ee" : color,
                                fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.3,
                                strokeColor: isSelected ? "#06b6d4" : isHovered ? "#ffffff" : color,
                                strokeWeight: isSelected ? 3 : isHovered ? 2 : 1,
                                strokeOpacity: 0.9,
                                clickable: true,
                            }}
                            onClick={() => handleBuildingClick(building)}
                            onMouseOver={() => { setHoveredId(building.id); setInfoBuilding(building); }}
                            onMouseOut={() => { setHoveredId(null); setInfoBuilding(null); }}
                        />
                        <Marker
                            position={building.center}
                            label={{ text: building.name, color: "#ffffff", fontSize: "11px", fontWeight: "700", className: "building-marker-label" }}
                            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: isSelected ? "#22d3ee" : color, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 }}
                            onClick={() => handleBuildingClick(building)}
                        />
                    </div>
                );
            })}
            {infoBuilding && !selectedId && (
                <InfoWindow position={infoBuilding.center} options={{ pixelOffset: new google.maps.Size(0, -20), disableAutoPan: true }} onCloseClick={() => setInfoBuilding(null)}>
                    <div className={`dark:bg-gradient-to-br dark:from-[#0d121f]/90 dark:to-[#111827]/95 bg-white/90 backdrop-blur-2xl p-5 min-w-[220px] border-2 rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300 ${infoBuilding.metrics.status === 'critical' ? 'border-red-500/50 dark:shadow-[0_0_30px_rgba(239,68,68,0.2)]' : infoBuilding.metrics.status === 'warning' ? 'border-amber-500/50 dark:shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-cyan-500/50 dark:shadow-[0_0_30px_rgba(6,182,212,0.2)]'}`}>
                        {/* Status Ambient Glow */}
                        <div className={`absolute top-0 right-0 w-24 h-24 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 ${infoBuilding.metrics.status === 'critical' ? 'bg-red-500' : infoBuilding.metrics.status === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'}`} />

                        <div className={`absolute top-0 left-0 w-1.5 h-full ${infoBuilding.metrics.status === 'critical' ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-[0_0_15px_#ef4444]' : infoBuilding.metrics.status === 'warning' ? 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_15px_#f59e0b]' : 'bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_15px_#22d3ee]'}`} />

                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50 dark:text-white/30 mb-1 pl-1">{infoBuilding.type}</div>
                        <div className="font-bold text-black dark:text-white text-lg tracking-tight uppercase mb-4 border-b border-black/5 dark:border-white/5 pb-2 pl-1 drop-shadow-sm">{infoBuilding.name}</div>

                        <div className="grid grid-cols-2 gap-4 pl-1">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-black/50 dark:text-white/40 font-black uppercase tracking-widest">Power</span>
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 drop-shadow-sm">{infoBuilding.metrics.energy}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-black/50 dark:text-white/40 font-black uppercase tracking-widest">Hydrology</span>
                                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 drop-shadow-sm">{infoBuilding.metrics.water}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-black/50 dark:text-white/40 font-black uppercase tracking-widest">Load Factor</span>
                                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 drop-shadow-sm">{infoBuilding.metrics.occupancy}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-black/50 dark:text-white/40 font-black uppercase tracking-widest">Thermal</span>
                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 drop-shadow-sm">{infoBuilding.metrics.temperature}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between pl-1 bg-black/5 dark:bg-white/5 px-2 py-1.5 rounded border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${infoBuilding.metrics.status === 'critical' ? 'bg-red-500 text-red-500 animate-ping' : infoBuilding.metrics.status === 'warning' ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'}`} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${infoBuilding.metrics.status === 'critical' ? 'text-red-600 dark:text-red-400' : infoBuilding.metrics.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>System {infoBuilding.metrics.status}</span>
                            </div>
                            <div className="w-[1px] h-3 bg-black/10 dark:bg-white/10" />
                            <span className="text-[8px] text-cyan-700 dark:text-cyan-400 font-black uppercase tracking-[0.2em] animate-pulse">Linkage Active</span>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
