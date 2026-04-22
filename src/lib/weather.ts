/**
 * Lightweight weather lookup for Israel, used to make AI suggestions
 * indoor/outdoor aware. Graceful failure: returns null if the API key
 * is missing or the fetch fails — callers skip the weather context.
 *
 * Requires OPENWEATHER_API_KEY env var (free tier is plenty).
 * Defaults to Tel Aviv coords; we don't ask users for location yet.
 */

export interface WeatherSnapshot {
  tempC: number;
  /** "clear" | "clouds" | "rain" | "thunderstorm" | "snow" | "extreme" | "other" */
  condition: string;
  /** Human-readable Hebrew hint for the AI prompt */
  hint: string;
}

const DEFAULT_LAT = 32.0853; // Tel Aviv
const DEFAULT_LON = 34.7818;

const CACHE: { at: number; data: WeatherSnapshot | null } = { at: 0, data: null };
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

export async function getWeather(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON,
): Promise<WeatherSnapshot | null> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return null;

  // Simple in-memory cache (fine for a single Vercel instance — avoids
  // hammering the API when many suggestions fire in a burst).
  if (CACHE.data && Date.now() - CACHE.at < CACHE_TTL_MS) return CACHE.data;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=he`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const json = await res.json() as {
      main?: { temp?: number };
      weather?: Array<{ main?: string }>;
    };
    const tempC = Math.round(json.main?.temp ?? 22);
    const main = (json.weather?.[0]?.main ?? "").toLowerCase();
    const condition =
      main === "clear" || main === "clouds" || main === "rain" ||
      main === "thunderstorm" || main === "snow" || main === "extreme"
        ? main : "other";

    let hint = `${tempC}°C בתל אביב, `;
    if (condition === "rain" || condition === "thunderstorm") hint += "גשום — עדיפות לפעילויות בבית.";
    else if (condition === "snow") hint += "שלג — עדיפות לפעילויות בבית.";
    else if (tempC >= 34) hint += "חם מאוד — הימנע מפעילויות בחוץ בשעות האור.";
    else if (tempC >= 28) hint += "חם — אם בחוץ אז בצל ועם מים.";
    else if (tempC <= 10) hint += "קר — לבוש חם אם יוצאים או להישאר בבית.";
    else hint += "מזג אוויר נעים — מצוין לפעילויות בחוץ.";

    const snap: WeatherSnapshot = { tempC, condition, hint };
    CACHE.at = Date.now();
    CACHE.data = snap;
    return snap;
  } catch {
    return null;
  }
}
