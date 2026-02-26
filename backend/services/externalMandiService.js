const mandiCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

const cacheKey = ({ crop, state, market }) => `mandi:${crop || ""}:${state || ""}:${market || ""}`;

export const fetchMandiPrices = async ({ crop, state, market }) => {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    throw new Error("Data.gov API key not configured");
  }

  const key = cacheKey({ crop, state, market });
  const cached = mandiCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const base = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const params = new URLSearchParams();
  params.set("api-key", apiKey);
  params.set("format", "json");
  params.set("limit", "50");
  if (crop) params.set("filters[commodity]", crop);
  if (state) params.set("filters[state]", state);
  if (market) params.set("filters[market]", market);

  const url = `${base}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Mandi API request failed");
  }
  const data = await res.json();

  mandiCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
};

export const normalizeMandiPrices = (raw) => {
  if (!raw || !raw.records) return [];
  return raw.records.map((r) => ({
    mandi_name: r.market || r.market_name || "",
    crop_name: r.commodity || "",
    price: Number(r.modal_price || r.min_price || r.max_price || 0),
    arrival_volume: Number(r.arrival || 0),
    price_date: r.arrival_date || r.date || "",
    state: r.state || "",
    district: r.district || "",
  }));
};
