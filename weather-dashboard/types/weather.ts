import { calculateInternationalAQI } from "@/lib/aqi";

export interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  coord: { lat: number; lon: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  clouds: { all: number };
  dt: number;
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
}

export interface AirPollutionData {
  list: {
    main: { aqi: number };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }[];
  coord: { lat: number; lon: number };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  dt_txt: string;
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
}

export interface ForecastData {
  list: ForecastItem[];
  city: { name: string; country: string };
}

export interface AQILevel {
  label: string;
  color: string;
  bg: string;
  range: string;
  description: string;
}

export const AQI_LEVELS: Record<number, AQILevel> = {
  1: { label: "Good", color: "#10b981", bg: "rgba(16,185,129,0.15)", range: "0-50", description: "Air quality is satisfactory, and air pollution poses little or no risk." },
  2: { label: "Moderate", color: "#eab308", bg: "rgba(234,179,8,0.15)", range: "51-100", description: "Air quality is acceptable. However, there may be a risk for some people." },
  3: { label: "Unhealthy for Sensitive Groups", color: "#f97316", bg: "rgba(249,115,22,0.15)", range: "101-150", description: "Members of sensitive groups may experience health effects." },
  4: { label: "Unhealthy", color: "#ef4444", bg: "rgba(239,68,68,0.15)", range: "151-200", description: "Some members of the general public may experience health effects." },
  5: { label: "Very Unhealthy", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", range: "201-300", description: "Health alert: The risk of health effects is increased for everyone." },
  6: { label: "Hazardous", color: "#7f1d1d", bg: "rgba(127,29,29,0.15)", range: "301+", description: "Health warning of emergency conditions: everyone is more likely to be affected." },
};

export function getAQILevelIndex(aqi: number): number {
  if (aqi <= 50) return 1;
  if (aqi <= 100) return 2;
  if (aqi <= 150) return 3;
  if (aqi <= 200) return 4;
  if (aqi <= 300) return 5;
  return 6;
}

export interface WeatherAlert {
  type: string;
  severity: "warning" | "danger";
  title: string;
  message: string;
  color: string;
}

export function getWeatherAlerts(
  weather: WeatherData | null,
  airPollution: AirPollutionData | null
): WeatherAlert[] {
  if (!weather) return [];
  const alerts: WeatherAlert[] = [];

  const windKmh = weather.wind.speed * 3.6;
  if (windKmh > 60) {
    alerts.push({ type: "wind", severity: "danger", title: "Extreme Wind", message: `Wind speed at ${Math.round(windKmh)} km/h. Stay indoors.`, color: "#ef4444" });
  } else if (windKmh > 40) {
    alerts.push({ type: "wind", severity: "warning", title: "Strong Wind", message: `Wind speed at ${Math.round(windKmh)} km/h. Secure loose objects.`, color: "#f97316" });
  }

  if (weather.main.temp > 40) {
    alerts.push({ type: "heat", severity: "danger", title: "Extreme Heat", message: `Temperature at ${Math.round(weather.main.temp)}\u00B0C. Risk of heatstroke.`, color: "#ef4444" });
  } else if (weather.main.temp > 35) {
    alerts.push({ type: "heat", severity: "warning", title: "Heat Advisory", message: `Temperature at ${Math.round(weather.main.temp)}\u00B0C. Stay hydrated.`, color: "#f59e0b" });
  }

  if (weather.main.temp < -15) {
    alerts.push({ type: "cold", severity: "danger", title: "Extreme Cold", message: `Temperature at ${Math.round(weather.main.temp)}\u00B0C. Risk of frostbite.`, color: "#3b82f6" });
  } else if (weather.main.temp < -5) {
    alerts.push({ type: "cold", severity: "warning", title: "Cold Advisory", message: `Temperature at ${Math.round(weather.main.temp)}\u00B0C. Bundle up.`, color: "#06b6d4" });
  }

  if (weather.rain?.["1h"] && weather.rain["1h"] > 10) {
    alerts.push({ type: "rain", severity: "danger", title: "Heavy Rain", message: `${weather.rain["1h"].toFixed(1)} mm/h. Flash flood risk.`, color: "#3b82f6" });
  } else if (weather.rain?.["1h"] && weather.rain["1h"] > 4) {
    alerts.push({ type: "rain", severity: "warning", title: "Rain Advisory", message: `${weather.rain["1h"].toFixed(1)} mm/h rainfall.`, color: "#60a5fa" });
  }

  if (weather.snow?.["1h"] && weather.snow["1h"] > 5) {
    alerts.push({ type: "snow", severity: "danger", title: "Heavy Snow", message: `${weather.snow["1h"].toFixed(1)} mm/h. Travel may be hazardous.`, color: "#a78bfa" });
  }

  if (weather.visibility < 500) {
    alerts.push({ type: "visibility", severity: "danger", title: "Very Low Visibility", message: `Visibility at ${weather.visibility}m. Avoid driving.`, color: "#6b7280" });
  } else if (weather.visibility < 1000) {
    alerts.push({ type: "visibility", severity: "warning", title: "Low Visibility", message: `Visibility at ${weather.visibility}m. Drive carefully.`, color: "#9ca3af" });
  }

  if (airPollution?.list?.[0]) {
    const { aqi } = calculateInternationalAQI(airPollution.list[0].components);
    const levelIndex = getAQILevelIndex(aqi);

    if (levelIndex >= 5) {
      alerts.push({ type: "aqi", severity: "danger", title: "Hazardous Air Quality", message: `AQI is ${aqi}. Health alert: everyone may experience serious health effects.`, color: "#7f1d1d" });
    } else if (levelIndex >= 4) {
      alerts.push({ type: "aqi", severity: "warning", title: "Unhealthy Air Quality", message: `AQI is ${aqi}. Some members of the general public may experience health effects.`, color: "#ef4444" });
    } else if (levelIndex >= 3) {
      alerts.push({ type: "aqi", severity: "warning", title: "Unhealthy for Sensitive Groups", message: `AQI is ${aqi}. Sensitive groups should limit outdoor exposure.`, color: "#f97316" });
    }
  }

  return alerts;
}
