import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "51.5074";
  const lon = searchParams.get("lon") || "-0.1278";

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const res = await axios.get(url);
    return NextResponse.json(res.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 401) return NextResponse.json({ error: "Invalid API key. OpenWeatherMap keys take up to 2 hours to activate." }, { status: 401 });
      return NextResponse.json({ error: msg || error.message }, { status: status || 500 });
    }
    const message = error instanceof Error ? error.message : "Failed to fetch air pollution data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
