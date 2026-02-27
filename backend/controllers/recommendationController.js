// Recommendation controller - works without database
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Demo preservation actions
const DEMO_ACTIONS = [
  { id: 1, action_name: "Temperature Control", description: "Maintain storage temperature between 4-10°C", cost_score: 3, effectiveness_score: 5 },
  { id: 2, action_name: "Humidity Management", description: "Keep humidity at 40-60% to prevent mold", cost_score: 2, effectiveness_score: 4 },
  { id: 3, action_name: "Ventilation", description: "Ensure proper air circulation", cost_score: 2, effectiveness_score: 4 },
  { id: 4, action_name: "Packaging", description: "Use breathable packaging materials", cost_score: 3, effectiveness_score: 3 },
  { id: 5, action_name: "Pre-cooling", description: "Pre-cool produce before storage", cost_score: 4, effectiveness_score: 5 },
];

let pool = null;

const loadPool = async () => {
  if (!pool) {
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      console.warn('Database not available - using demo mode');
    }
  }
  return pool;
};

const tryMlRecommendation = async ({ cropId, region, quantity, soil, storage, weather, mandiPrices }) => {
  if (!ML_SERVICE_URL) return null;
  try {
    const res = await fetch(`${ML_SERVICE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop_id: cropId, region, quantity, soil: soil || {}, storage: storage || {}, weather: weather || [], mandi_prices: mandiPrices || [] })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("ML recommendation error:", err);
    return null;
  }
};

export const simulateSpoilage = async (req, res) => {
  try {
    const { crop_type, quantity, initial_quality, storage_temp, storage_humidity, transit_hours, weather } = req.body;

    // Try ML service first
    if (ML_SERVICE_URL) {
      try {
        const mlResponse = await fetch(`${ML_SERVICE_URL}/simulate/spoilage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            crop_type: crop_type || 'vegetable',
            quantity: Number(quantity) || 100,
            initial_quality: Number(initial_quality) || 1.0,
            storage_temp: Number(storage_temp) || 20,
            storage_humidity: Number(storage_humidity) || 60,
            transit_hours: Number(transit_hours) || 0,
            weather: weather || []
          })
        });
        if (mlResponse.ok) {
          const data = await mlResponse.json();
          return res.json(data);
        }
      } catch (mlErr) {
        console.log("ML service unavailable, using fallback simulation");
      }
    }

    // Fallback simulation
    const temp = Number(storage_temp) || 20;
    const humidity = Number(storage_humidity) || 60;
    const transit = Number(transit_hours) || 0;
    const initQuality = Number(initial_quality) || 1.0;

    const tempImpact = temp > 30 ? 25 : temp > 25 ? 15 : temp < 10 ? 5 : 10;
    const humidityImpact = humidity > 80 ? 25 : humidity > 70 ? 15 : humidity < 40 ? 5 : 10;
    const transitImpact = transit > 12 ? 20 : transit > 6 ? 12 : transit > 3 ? 6 : 2;

    let weatherImpact = 0;
    if (weather && weather.length > 0) {
      weather.forEach(w => {
        if (w.temperature > 30) weatherImpact += 10;
        if (w.humidity > 80) weatherImpact += 8;
        if (w.rainfall > 20) weatherImpact += 7;
      });
      weatherImpact = Math.min(20, weatherImpact);
    }

    const totalImpact = tempImpact + humidityImpact + transitImpact + weatherImpact;
    const dailyRate = totalImpact / 7;

    const simulationResults = [];
    let cumulativeSpoilage = 0;

    for (let day = 1; day <= 7; day++) {
      const dailySpoilage = dailyRate * (1 + (day - 1) * 0.05) * (2 - initQuality);
      cumulativeSpoilage = Math.min(100, cumulativeSpoilage + dailySpoilage);
      simulationResults.push({
        day,
        spoilage_rate: Math.round(dailySpoilage * 10) / 10,
        cumulative_spoilage: Math.round(cumulativeSpoilage * 10) / 10,
        remaining_quality: Math.round((100 - cumulativeSpoilage) * 10) / 10
      });
    }

    const finalSpoilage = Math.round(cumulativeSpoilage * 10) / 10;
    const riskLevel = finalSpoilage > 50 ? "CRITICAL" : finalSpoilage > 30 ? "HIGH" : finalSpoilage > 15 ? "MEDIUM" : "LOW";

    return res.json({
      simulation_results: simulationResults,
      final_spoilage_percent: finalSpoilage,
      risk_level: riskLevel,
      recommendation: finalSpoilage > 50 ? "Sell immediately" : finalSpoilage > 30 ? "Sell within 2-3 days" : finalSpoilage > 15 ? "Monitor closely" : "Quality can be maintained",
      factors: { temperature_impact: tempImpact, humidity_impact: humidityImpact, transit_impact: transitImpact, weather_impact: weatherImpact },
      optimal_conditions: { suggested_temp: "4-10°C", suggested_humidity: "40-60%", max_transit_hours: 6 }
    });
  } catch (err) {
    console.error("Spoilage simulation error:", err);
    return res.status(500).json({ message: "Failed to simulate spoilage" });
  }
};

export const trainMlModel = async (req, res) => {
  try {
    const { model_type, training_data } = req.body;
    if (!ML_SERVICE_URL) {
      return res.status(503).json({ message: "ML service not configured" });
    }
    const mlResponse = await fetch(`${ML_SERVICE_URL}/train/${model_type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(training_data || {})
    });
    if (!mlResponse.ok) {
      return res.status(500).json({ message: "Failed to train model" });
    }
    return res.json(await mlResponse.json());
  } catch (err) {
    return res.status(500).json({ message: "Failed to train model" });
  }
};

export const getMlFeatures = async (req, res) => {
  try {
    if (!ML_SERVICE_URL) {
      return res.status(503).json({ message: "ML service not configured" });
    }
    const mlResponse = await fetch(`${ML_SERVICE_URL}/features`);
    if (!mlResponse.ok) {
      return res.status(500).json({ message: "Failed to fetch features" });
    }
    return res.json(await mlResponse.json());
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch features" });
  }
};

const getDemoCrops = () => [
  { id: 1, name: 'Wheat', optimal_ph_range: '6.0-7.0', optimal_n_range: '40-60', optimal_p_range: '20-40', optimal_k_range: '20-30' },
  { id: 2, name: 'Rice', optimal_ph_range: '5.5-7.0', optimal_n_range: '50-80', optimal_p_range: '25-50', optimal_k_range: '30-50' },
  { id: 3, name: 'Cotton', optimal_ph_range: '5.5-8.0', optimal_n_range: '50-100', optimal_p_range: '25-50', optimal_k_range: '30-60' },
];

const rangeScore = (value, rangeText) => {
  if (value === undefined || value === null || !rangeText) return 0;
  const nums = String(rangeText).match(/-?\d+(?:\.\d+)?/g) || [];
  if (nums.length < 2) return 0;
  const min = Number(nums[0]);
  const max = Number(nums[1]);
  if (value >= min && value <= max) return 1;
  if (value < min) return Math.max(0, 1 - (min - value) / Math.max(min, 1));
  return Math.max(0, 1 - (value - max) / Math.max(max, 1));
};

const spoilageAdjust = ({ baseRisk, storage_temp, storage_humidity, transit_hours }) => {
  let risk = baseRisk;
  if (storage_temp !== undefined) {
    const temp = Number(storage_temp);
    if (temp > 25) risk += 0.08;
    if (temp > 30) risk += 0.08;
    if (temp < 10) risk -= 0.05;
  }
  if (storage_humidity !== undefined) {
    const hum = Number(storage_humidity);
    if (hum > 80) risk += 0.08;
    if (hum < 40) risk -= 0.03;
  }
  if (transit_hours !== undefined) {
    const hours = Number(transit_hours);
    if (hours > 6) risk += 0.05;
    if (hours > 12) risk += 0.08;
  }
  return Math.min(1, Math.max(0, Math.round(risk * 100) / 100));
};

const getDemoWeather = (region) => {
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
};

const getDemoMandi = (cropName) => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { mandi_name: "Vashi", price: 2150, distance: 25 },
    { mandi_name: "Azadpur", price: 3200, distance: 50 },
    { mandi_name: "Lasalgaon", price: 1800, distance: 30 },
  ];
};

const calculateProfit = ({ pricePerUnit, quantity, transportCost }) => {
  return Math.max(0, (pricePerUnit * quantity / 100) - transportCost);
};

export const generateRecommendation = async (req, res) => {
  try {
    const dbPool = await loadPool();
    let { crop_id, region, quantity, soil_ph, soil_n, soil_p, soil_k, storage_temp, storage_humidity, transit_hours } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const cropIdNum = Number(crop_id || 0);
    if (!cropIdNum) {
      return res.status(400).json({ message: "crop_id is required." });
    }

    let crop = null;
    if (dbPool) {
      try {
        const cropResult = await dbPool.query("SELECT * FROM crops WHERE id = $1", [cropIdNum]);
        crop = cropResult.rows[0];
      } catch (e) {}
    }
    if (!crop) {
      crop = getDemoCrops().find(c => c.id === cropIdNum) || getDemoCrops()[0];
    }

    // Get weather data
    let weather = [];
    try {
      if (dbPool) {
        const weatherResult = await dbPool.query("SELECT * FROM weather_data WHERE region = $1 ORDER BY forecast_date DESC LIMIT 7", [region]);
        weather = weatherResult.rows;
      }
    } catch (e) {}
    if (weather.length === 0) {
      weather = getDemoWeather(region || "Maharashtra");
    }

    const baseWeatherRisk = weather.length > 0 
      ? Math.min(1, (weather.reduce((a, w) => a + (Number(w.humidity || 0) / 100) * 0.6 + (Number(w.rainfall || 0) / 100) * 0.4, 0) / weather.length))
      : 0.25;

    let suggestedMandi = "Vashi";
    let harvestWindow = "3-7 days";
    let spoilageRisk = baseWeatherRisk;
    let predictedProfit = 0;
    let predictedPrice = 2100;

    // Try ML service
    const ml = await tryMlRecommendation({ cropId: cropIdNum, region, quantity });
    if (ml && ml.suggested_mandi) {
      suggestedMandi = ml.suggested_mandi;
      harvestWindow = ml.harvest_window || harvestWindow;
      const mlBaseRisk = Number(ml.spoilage_risk ?? baseWeatherRisk);
      spoilageRisk = spoilageAdjust({ baseRisk: mlBaseRisk, storage_temp, storage_humidity, transit_hours });
      predictedProfit = Number(ml.predicted_profit || 0);
      predictedPrice = Number(ml.predicted_price || 0);
    } else {
      // Use demo data
      const mandiList = getDemoMandi(crop?.name);
      const bestMandi = mandiList.sort((a, b) => b.price - a.price)[0];
      
      if (bestMandi) {
        suggestedMandi = bestMandi.mandi_name;
        predictedPrice = bestMandi.price;
        const transportCost = bestMandi.distance * 2; // Simple estimate
        predictedProfit = calculateProfit({ pricePerUnit: predictedPrice, quantity: Number(quantity) || 100, transportCost });
      }

      spoilageRisk = spoilageAdjust({ baseRisk: baseWeatherRisk, storage_temp, storage_humidity, transit_hours });
    }

    const soilScore = crop
      ? Math.round(((rangeScore(Number(soil_ph), crop.optimal_ph_range)
          + rangeScore(Number(soil_n), crop.optimal_n_range)
          + rangeScore(Number(soil_p), crop.optimal_p_range)
          + rangeScore(Number(soil_k), crop.optimal_k_range)) / 4) * 100)
      : null;

    // Try to save to database
    let savedRec = null;
    if (dbPool) {
      try {
        const insertResult = await dbPool.query(
          `INSERT INTO recommendations (user_id, crop_id, suggested_mandi, harvest_window, spoilage_risk, predicted_profit, explanation_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [userId, cropIdNum, suggestedMandi, harvestWindow, spoilageRisk, predictedProfit, "Generated recommendation"]
        );
        savedRec = insertResult.rows[0];
      } catch (e) {}
    }

    const response = {
      id: savedRec?.id || Date.now(),
      user_id: userId,
      crop_id: cropIdNum,
      suggested_mandi: suggestedMandi,
      harvest_window: harvestWindow,
      spoilage_risk: spoilageRisk,
      predicted_profit: predictedProfit,
      predicted_price: predictedPrice,
      explanation_text: `Recommended ${suggestedMandi} mandi for best price. Soil suitability: ${soilScore || 0}%.`,
      preservation_actions: DEMO_ACTIONS.slice(0, 3),
      soil_score: soilScore,
      weather: weather,
      demo: !dbPool
    };

    return res.status(201).json(response);
  } catch (err) {
    console.error("Generate recommendation error:", err);
    return res.status(500).json({ message: "Failed to generate recommendation." });
  }
};

export const listRecommendationsForUser = async (req, res) => {
  try {
    const dbPool = await loadPool();
    const userId = req.user?.id;

    if (dbPool) {
      try {
        const result = await dbPool.query(
          `SELECT r.*, c.name as crop_name
           FROM recommendations r
           JOIN crops c ON c.id = r.crop_id
           WHERE r.user_id = $1
           ORDER BY r.id DESC`,
          [userId]
        );
        return res.json(result.rows);
      } catch (e) {}
    }

    // Return demo data
    return res.json([
      { id: 1, user_id: userId, crop_id: 1, crop_name: "Wheat", suggested_mandi: "Vashi", harvest_window: "3-7 days", spoilage_risk: 0.15, predicted_profit: 15000, created_at: new Date().toISOString() },
      { id: 2, user_id: userId, crop_id: 2, crop_name: "Rice", suggested_mandi: "Azadpur", harvest_window: "5-10 days", spoilage_risk: 0.2, predicted_profit: 22000, created_at: new Date().toISOString() },
    ]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch recommendations." });
  }
};

export const listRecommendationsAll = async (req, res) => {
  try {
    const dbPool = await loadPool();
    if (dbPool) {
      try {
        const result = await dbPool.query(
          `SELECT r.*, u.name as user_name, c.name as crop_name
           FROM recommendations r
           JOIN users u ON u.id = r.user_id
           JOIN crops c ON c.id = r.crop_id
           ORDER BY r.id DESC`
        );
        return res.json(result.rows);
      } catch (e) {}
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch recommendations." });
  }
};
