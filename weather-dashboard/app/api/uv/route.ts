import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    // Try One Call 3.0 first (requires subscription but is the current supported endpoint)
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`;
    const res = await axios.get(oneCallUrl);
    return NextResponse.json({ uv: res.data.current?.uvi ?? null });
  } catch {
    try {
      // Fallback: try the 2.5 UV endpoint (deprecated but may still work for some keys)
      const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const res = await axios.get(url);
      return NextResponse.json({ uv: res.data.value ?? res.data });
    } catch {
      return NextResponse.json({ uv: null });
    }
  }
}
