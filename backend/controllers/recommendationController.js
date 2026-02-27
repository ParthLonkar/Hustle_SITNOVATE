import pool from "../config/db.js";
import { getWeatherForRegion, estimateSpoilageRisk } from "../services/weatherService.js";
import { estimateTransportCost } from "../services/transportService.js";
import { calculateProfit } from "../services/profitCalculator.js";
import { fetchMandiPrices, normalizeMandiPrices } from "../services/externalMandiService.js";
import { getRankedActions } from "../services/preservationService.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const tryMlRecommendation = async ({ cropId, region, quantity, soil, storage, weather, mandiPrices }) => {
  if (!ML_SERVICE_URL) return null;

  try {
    const res = await fetch(`${ML_SERVICE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        crop_id: cropId, 
        region, 
        quantity,
        soil: soil || {},
        storage: storage || {},
        weather: weather || [],
        mandi_prices: mandiPrices || []
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
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
    const temp        = Number(storage_temp)      || 20;
    const humidity    = Number(storage_humidity)  || 60;
    const transit     = Number(transit_hours)     || 0;
    const initQuality = Number(initial_quality)   || 1.0;

    const tempImpact     = temp     > 30 ? 25 : temp     > 25 ? 15 : temp < 10     ?  5 : 10;
    const humidityImpact = humidity > 80 ? 25 : humidity > 70 ? 15 : humidity < 40 ?  5 : 10;
    const transitImpact  = transit  > 12 ? 20 : transit  >  6 ? 12 : transit > 3   ?  6 :  2;

    let weatherImpact = 0;
    if (weather && weather.length > 0) {
      weather.forEach(w => {
        if (w.temperature > 30) weatherImpact += 10;
        if (w.humidity    > 80) weatherImpact +=  8;
        if (w.rainfall    > 20) weatherImpact +=  7;
      });
      weatherImpact = Math.min(20, weatherImpact);
    }

    const totalImpact = tempImpact + humidityImpact + transitImpact + weatherImpact;
    const dailyRate   = totalImpact / 7;

    const simulationResults = [];
    let cumulativeSpoilage  = 0;

    for (let day = 1; day <= 7; day++) {
      const dailySpoilage = dailyRate * (1 + (day - 1) * 0.05) * (2 - initQuality);
      cumulativeSpoilage  = Math.min(100, cumulativeSpoilage + dailySpoilage);
      const remainingQuality = Math.max(0, 100 - cumulativeSpoilage);

      simulationResults.push({
        day,
        spoilage_rate:       Math.round(dailySpoilage     * 10) / 10,
        cumulative_spoilage: Math.round(cumulativeSpoilage * 10) / 10,
        remaining_quality:   Math.round(remainingQuality   * 10) / 10
      });
    }

    const finalSpoilage = Math.round(cumulativeSpoilage * 10) / 10;
    const riskLevel     = finalSpoilage > 50 ? "CRITICAL"
                        : finalSpoilage > 30 ? "HIGH"
                        : finalSpoilage > 15 ? "MEDIUM"
                        : "LOW";
    const recommendation = finalSpoilage > 50
      ? "Sell immediately to minimize losses"
      : finalSpoilage > 30
        ? "Sell within 2-3 days"
        : finalSpoilage > 15
          ? "Monitor closely, sell within 5 days"
          : "Quality can be maintained for a week with proper storage";

    return res.json({
      simulation_results:    simulationResults,
      final_spoilage_percent: finalSpoilage,
      risk_level:            riskLevel,
      recommendation,
      factors: {
        temperature_impact: tempImpact,
        humidity_impact:    humidityImpact,
        transit_impact:     transitImpact,
        weather_impact:     weatherImpact
      },
      optimal_conditions: {
        suggested_temp:    "4-10C",
        suggested_humidity: "40-60%",
        max_transit_hours:  6
      }
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
      const error = await mlResponse.json();
      return res.status(500).json({ message: error.message || "Failed to train model" });
    }

    const data = await mlResponse.json();
    return res.json(data);
  } catch (err) {
    console.error("Model training error:", err);
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

    const data = await mlResponse.json();
    return res.json(data);
  } catch (err) {
    console.error("Get features error:", err);
    return res.status(500).json({ message: "Failed to fetch features" });
  }
};

const getBestMandi = async (cropId) => {
  const result = await pool.query(
    `SELECT mandi_name, price, arrival_volume, price_date
     FROM mandi_prices
     WHERE crop_id = $1
     ORDER BY price_date DESC, price DESC
     LIMIT 1`,
    [cropId]
  );
  return result.rows[0] || null;
};

const getCrop = async (cropId) => {
  const result = await pool.query(
    "SELECT id, name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range FROM crops WHERE id = $1",
    [cropId]
  );
  return result.rows[0] || null;
};

const getUserRegion = async (userId) => {
  const result = await pool.query("SELECT region FROM users WHERE id = $1", [userId]);
  return result.rows[0]?.region || "";
};

const getLiveMandi = async ({ cropName, region }) => {
  if (!cropName) return null;
  const raw = await fetchMandiPrices({ crop: cropName, state: region });
  const normalized = normalizeMandiPrices(raw);
  if (!normalized.length) return null;
  // Sort by price (descending) and use the one with best price
  const best = normalized.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))[0];
  return best || null;
};

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

  if (storage_temp !== undefined && storage_temp !== null) {
    const temp = Number(storage_temp);
    if (temp > 25) risk += 0.08;
    if (temp > 30) risk += 0.08;
    if (temp < 10) risk -= 0.05;
  }
  if (storage_humidity !== undefined && storage_humidity !== null) {
    const hum = Number(storage_humidity);
    if (hum > 80) risk += 0.08;
    if (hum < 40) risk -= 0.03;
  }
  if (transit_hours !== undefined && transit_hours !== null) {
    const hours = Number(transit_hours);
    if (hours > 6) risk += 0.05;
    if (hours > 12) risk += 0.08;
  }

  return Math.min(1, Math.max(0, Math.round(risk * 100) / 100));
};

export const generateRecommendation = async (req, res) => {
  try {
    let { crop_id, region, quantity, soil_ph, soil_n, soil_p, soil_k, storage_temp, storage_humidity, transit_hours } = req.body;
    const userId = req.user?.id;

    console.log("Generate recommendation called:", { crop_id, region, quantity, userId });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const cropIdNum = Number(crop_id || 0);
    if (!cropIdNum) {
      return res.status(400).json({ message: "crop_id is required." });
    }

    if (!region) {
      region = await getUserRegion(userId);
      console.log("Using user region:", region);
    }

    if (!region) {
      return res.status(400).json({ message: "region is required." });
    }

    const crop = await getCrop(cropIdNum);
    console.log("Got crop:", crop);

    // Always fetch weather — needed for spoilage calculation regardless of ML path
    const weather = await getWeatherForRegion({ region });
    const baseWeatherRisk = estimateSpoilageRisk(weather);
    console.log("Weather spoilage base risk:", baseWeatherRisk);

    const ml = await tryMlRecommendation({ cropId: cropIdNum, region, quantity });

    let suggestedMandi = null;
    let harvestWindow = "3-7 days";
    let spoilageRisk = baseWeatherRisk; // use real weather risk as default, not hardcoded 0.2
    let predictedProfit = 0;
    let explanationText = "";
    let predictedPrice = 0;

    if (ml && ml.suggested_mandi) {
      suggestedMandi = ml.suggested_mandi;
      harvestWindow = ml.harvest_window || harvestWindow;
      // ML gives a base risk — still adjust it with user's actual storage/transit inputs
      const mlBaseRisk = Number(ml.spoilage_risk ?? baseWeatherRisk);
      spoilageRisk = spoilageAdjust({ baseRisk: mlBaseRisk, storage_temp, storage_humidity, transit_hours });
      predictedProfit = Number(ml.predicted_profit || predictedProfit);
      predictedPrice = Number(ml.predicted_price || predictedPrice);
      explanationText = ml.explanation_text || "ML-based recommendation.";
    } else {
      console.log("ML service not available, using fallback logic");
      
      const bestMandi = await getBestMandi(cropIdNum);
      console.log("Best mandi from DB:", bestMandi);
      
      // weather already fetched above, reuse it
      spoilageRisk = baseWeatherRisk;
      console.log("Weather and spoilage risk:", { weatherCount: weather.length, spoilageRisk });

      // Get live mandi prices as fallback
      const liveMandi = await getLiveMandi({ cropName: crop?.name || "", region });
      console.log("Live mandi:", liveMandi);

      const transportCost = estimateTransportCost({ quantity, distanceKm: liveMandi?.distance || 30 });
      console.log("Transport cost:", transportCost);

      if (liveMandi && liveMandi.price > 0) {
        suggestedMandi = liveMandi.mandi_name;
        predictedPrice = Number(liveMandi.price || 0);
        predictedProfit = calculateProfit({
          pricePerUnit: predictedPrice,
          quantity: Number(quantity || 0),
          transportCost
        });
        explanationText = `Selected ${suggestedMandi} with highest live price of Rs ${predictedPrice}/q. Transport cost: Rs ${transportCost}.`;
      } else if (bestMandi) {
        suggestedMandi = bestMandi.mandi_name;
        predictedPrice = Number(bestMandi.price || 0);
        predictedProfit = calculateProfit({
          pricePerUnit: predictedPrice,
          quantity: Number(quantity || 0),
          transportCost
        });
        explanationText = "Selected mandi with highest recent stored price and adjusted for transport cost.";
      } else {
        // Use default values when no data available
        suggestedMandi = "Nearest Mandi";
        predictedPrice = 2000; // Default reasonable price
        predictedProfit = calculateProfit({
          pricePerUnit: predictedPrice,
          quantity: Number(quantity || 0),
          transportCost
        });
        explanationText = "No recent mandi price data found. Using estimated price based on market averages.";
      }

      const soilScore = crop
        ? (rangeScore(Number(soil_ph), crop.optimal_ph_range)
            + rangeScore(Number(soil_n), crop.optimal_n_range)
            + rangeScore(Number(soil_p), crop.optimal_p_range)
            + rangeScore(Number(soil_k), crop.optimal_k_range)) / 4
        : 0;

      spoilageRisk = spoilageAdjust({ baseRisk: spoilageRisk, storage_temp, storage_humidity, transit_hours });

      explanationText = `${explanationText} Soil suitability: ${(soilScore * 100).toFixed(0)}%. Spoilage risk: ${(spoilageRisk * 100).toFixed(0)}% (weather base: ${(baseWeatherRisk * 100).toFixed(0)}%, adjusted for storage conditions).`;
    }

    const actions = await getRankedActions();
    const topActions = actions.slice(0, 3);
    console.log("Preservation actions:", topActions.length);

    const insertResult = await pool.query(
      `INSERT INTO recommendations (user_id, crop_id, suggested_mandi, harvest_window, spoilage_risk, predicted_profit, explanation_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, cropIdNum, suggestedMandi, harvestWindow, spoilageRisk, predictedProfit, explanationText]
    );

    const soilScore = crop
      ? Math.round(((rangeScore(Number(soil_ph), crop.optimal_ph_range)
          + rangeScore(Number(soil_n), crop.optimal_n_range)
          + rangeScore(Number(soil_p), crop.optimal_p_range)
          + rangeScore(Number(soil_k), crop.optimal_k_range)) / 4) * 100)
      : null;

    const response = {
      ...insertResult.rows[0],
      predicted_price: predictedPrice,
      preservation_actions: topActions,
      soil_score: soilScore
    };

    console.log("Sending response:", response);
    return res.status(201).json(response);
  } catch (err) {
    console.error("Generate recommendation error:", err);
    return res.status(500).json({ message: "Failed to generate recommendation." });
  }
};

export const listRecommendationsForUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT r.id, r.user_id, r.crop_id, r.suggested_mandi, r.harvest_window,
              r.spoilage_risk, r.predicted_profit, r.explanation_text,
              r.created_at,
              c.name as crop_name
       FROM recommendations r
       JOIN crops c ON c.id = r.crop_id
       WHERE r.user_id = $1
       ORDER BY r.id DESC`,
      [userId]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch recommendations." });
  }
};

export const listRecommendationsAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, c.name as crop_name
       FROM recommendations r
       JOIN users u ON u.id = r.user_id
       JOIN crops c ON c.id = r.crop_id
       ORDER BY r.id DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch recommendations." });
  }
};