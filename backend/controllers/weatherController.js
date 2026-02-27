// Weather controller - works without database
export const listWeather = async (req, res) => {
  try {
    const { region, date_from, date_to, live } = req.query;
    const regionParam = region || "Maharashtra";

    // Always try external weather API first when live=1
    if (live === "1") {
      try {
        const { fetchWeatherUnlocked, normalizeWeatherUnlocked } = await import('../services/externalWeatherService.js');
        const raw = await fetchWeatherUnlocked({ region: regionParam });
        const normalized = normalizeWeatherUnlocked(raw);
        
        if (normalized && normalized.length > 0) {
          return res.json(normalized);
        }
      } catch (e) {
        console.log("External weather API failed, using demo data:", e.message);
      }
    }

    // Fallback to demo weather
    return res.json(getDemoWeather(regionParam));
  } catch (err) {
    console.error("Weather error:", err.message);
    return res.json(getDemoWeather(req.query.region || "Maharashtra"));
  }
};

export const createWeather = async (req, res) => {
  try {
    const { region, temperature, rainfall, humidity, forecast_date } = req.body;
    if (!region || temperature === undefined || rainfall === undefined || humidity === undefined || !forecast_date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Return demo response
    return res.status(201).json({ id: Date.now(), region, temperature, rainfall, humidity, forecast_date, demo: true });
  } catch (err) {
    console.error("Create weather error:", err.message);
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

function getDemoWeather(region = "Maharashtra") {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      region,
      temperature: 25 + Math.floor(Math.random() * 10),
      rainfall: Math.floor(Math.random() * 30),
      humidity: 50 + Math.floor(Math.random() * 30),
      forecast_date: date.toISOString().split('T')[0],
    };
  });
}
