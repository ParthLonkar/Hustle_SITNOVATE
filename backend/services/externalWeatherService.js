const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const cacheKey = ({ region }) => `weather:${region || ""}`;

export const fetchWeatherUnlocked = async ({ region }) => {
  const appId = process.env.WEATHERUNLOCKED_APP_ID;
  const appKey = process.env.WEATHERUNLOCKED_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Weather API keys not configured");
  }

  const key = cacheKey({ region });
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const encoded = encodeURIComponent(region || "");
  const url = `http://api.weatherunlocked.com/api/forecast/${encoded}?app_id=${appId}&app_key=${appKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Weather API request failed");
  }
  const data = await res.json();

  weatherCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
};

export const normalizeWeatherUnlocked = (raw) => {
  if (!raw || !raw.Days) return [];
  return raw.Days.slice(0, 7).map((d) => ({
    region: raw.location || "",
    temperature: Number(d.temp_max_c ?? d.temp_c ?? 0),
    rainfall: Number(d.rain_mm ?? 0),
    humidity: Number(d.humid_max_pct ?? d.humid_min_pct ?? 0),
    forecast_date: d.date,
  }));
};
