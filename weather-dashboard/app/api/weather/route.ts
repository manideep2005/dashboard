import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "London";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    let url = "";
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    }

    const res = await axios.get(url);
    return NextResponse.json(res.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 401) return NextResponse.json({ error: "Invalid API key. OpenWeatherMap keys take up to 2 hours to activate after signup." }, { status: 401 });
      if (status === 404) return NextResponse.json({ error: `City "${city}" not found. Try a different city name.` }, { status: 404 });
      return NextResponse.json({ error: msg || error.message }, { status: status || 500 });
    }
    const message = error instanceof Error ? error.message : "Failed to fetch weather";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
