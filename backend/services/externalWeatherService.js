const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const cacheKey = ({ region }) => `weather:${region || ""}`;

// Demo weather data
const getDemoWeather = (region = "Maharashtra") => {
  const today = new Date();
  return {
    location: region,
    Days: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        temp_max_c: 28 + Math.floor(Math.random() * 8),
        temp_c: 24 + Math.floor(Math.random() * 6),
        rain_mm: Math.floor(Math.random() * 25),
        humid_max_pct: 65 + Math.floor(Math.random() * 25),
        humid_min_pct: 45 + Math.floor(Math.random() * 15),
      };
    })
  };
};

export const fetchWeatherUnlocked = async ({ region }) => {
  if (!region) throw new Error("Region is required");

  const appId = process.env.WEATHERUNLOCKED_APP_ID;
  const appKey = process.env.WEATHERUNLOCKED_APP_KEY;

  // Check if API keys are configured
  if (!appId || !appKey || appId === 'undefined' || appKey === 'undefined') {
    console.log("Weather API keys not configured, using demo data");
    return getDemoWeather(region);
  }

  const key = cacheKey({ region });
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const encoded = encodeURIComponent(region);
  const url = `https://api.weatherunlocked.com/api/forecast/${encoded}?app_id=${appId}&app_key=${appKey}`;

  console.log("Fetching weather from:", url);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Weather API error, using demo data");
      return getDemoWeather(region);
    }
    const data = await res.json();
    weatherCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    console.warn("Weather fetch failed, using demo data:", err.message);
    return getDemoWeather(region);
  }
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
