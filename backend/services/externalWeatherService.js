// Open-Meteo API - Free, no API key required
// https://open-meteo.com/

const weatherCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

const cacheKey = ({ region }) => `weather:${region || ""}`;

// Map Indian region names to Open-Meteo coordinates
const regionCoordinates = {
  "maharashtra": { lat: 19.7515, lon: 75.7139 },
  "nagpur": { lat: 21.1458, lon: 79.0882 },
  "mumbai": { lat: 19.0760, lon: 72.8777 },
  "pune": { lat: 18.5204, lon: 73.8567 },
  "delhi": { lat: 28.7041, lon: 77.1025 },
  "gujarat": { lat: 22.2587, lon: 71.1924 },
  "karnataka": { lat: 15.3173, lon: 75.7139 },
  "tamil nadu": { lat: 11.1271, lon: 78.6569 },
  "west bengal": { lat: 22.9868, lon: 87.8550 },
  "uttar pradesh": { lat: 27.2046, lon: 77.4977 },
  "madhya pradesh": { lat: 23.4733, lon: 80.4420 },
  "rajasthan": { lat: 27.0238, lon: 74.2179 },
  "haryana": { lat: 29.238, lon: 76.4319 },
  "punjab": { lat: 31.1471, lon: 75.3413 },
  "kerala": { lat: 10.8505, lon: 76.2711 },
  "andhra pradesh": { lat: 15.9129, lon: 79.7400 },
  "telangana": { lat: 18.1124, lon: 79.0193 },
  "default": { lat: 20.5937, lon: 78.9629 } // India center
};

export const fetchWeatherUnlocked = async ({ region }) => {
  if (!region) throw new Error("Region is required");

  const key = cacheKey({ region });
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    console.log("Returning cached weather data for:", region);
    return cached.data;
  }

  // Get coordinates for region
  const regionKey = region.toLowerCase().trim();
  const coords = regionCoordinates[regionKey] || regionCoordinates["default"];
  
  console.log("Fetching weather for:", region, "coordinates:", coords);

  // Open-Meteo API - Free, no API key needed
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max&timezone=Asia/Kolkata&forecast_days=7`;

  console.log("Weather API URL:", url);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Weather API error: ${text}`);
    }

    const data = await res.json();
    console.log("Weather data received:", JSON.stringify(data).substring(0, 200));

    weatherCache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return data;
  } catch (error) {
    console.error("Weather fetch error:", error.message);
    throw error;
  }
};

export const normalizeWeatherUnlocked = (raw) => {
  if (!raw || !raw.daily) {
    console.log("No daily data in response");
    return [];
  }

  const { daily } = raw;
  const days = daily.time || [];
  
  return days.map((date, i) => ({
    region: "",
    temperature: Number(daily.temperature_2m_max?.[i] ?? daily.temperature_2m_min?.[i] ?? 0),
    rainfall: Number(daily.precipitation_sum?.[i] ?? 0),
    humidity: Number(daily.relative_humidity_2m_max?.[i] ?? 0),
    forecast_date: date,
  }));
};
