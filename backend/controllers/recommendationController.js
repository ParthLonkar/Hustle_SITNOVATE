import pool from "../config/db.js";
import { getWeatherForRegion, estimateSpoilageRisk } from "../services/weatherService.js";
import { estimateTransportCost } from "../services/transportService.js";
import { calculateProfit } from "../services/profitCalculator.js";
import { fetchMandiPrices, normalizeMandiPrices } from "../services/externalMandiService.js";
import { getRankedActions } from "../services/preservationService.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "";

const tryMlRecommendation = async ({ cropId, region, quantity }) => {
  if (!ML_SERVICE_URL) return null;

  try {
    const res = await fetch(`${ML_SERVICE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop_id: cropId, region, quantity })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
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

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const cropIdNum = Number(crop_id || 0);
    if (!cropIdNum) {
      return res.status(400).json({ message: "crop_id is required." });
    }

    if (!region) {
      region = await getUserRegion(userId);
    }

    if (!region) {
      return res.status(400).json({ message: "region is required." });
    }

    const crop = await getCrop(cropIdNum);
    const ml = await tryMlRecommendation({ cropId: cropIdNum, region, quantity });

    let suggestedMandi = null;
    let harvestWindow = "3-7 days";
    let spoilageRisk = 0.2;
    let predictedProfit = 0;
    let explanationText = "";
    let predictedPrice = 0;

    if (ml && ml.suggested_mandi) {
      suggestedMandi = ml.suggested_mandi;
      harvestWindow = ml.harvest_window || harvestWindow;
      spoilageRisk = Number(ml.spoilage_risk || spoilageRisk);
      predictedProfit = Number(ml.predicted_profit || predictedProfit);
      predictedPrice = Number(ml.predicted_price || predictedPrice);
      explanationText = ml.explanation_text || "ML-based recommendation.";
    } else {
      const bestMandi = await getBestMandi(cropIdNum);
      const weather = await getWeatherForRegion({ region });
      spoilageRisk = estimateSpoilageRisk(weather);

      const transportCost = estimateTransportCost({ quantity, distanceKm: 30 });

      if (bestMandi) {
        suggestedMandi = bestMandi.mandi_name;
        predictedPrice = Number(bestMandi.price || 0);
        predictedProfit = calculateProfit({
          pricePerUnit: predictedPrice,
          quantity: Number(quantity || 0),
          transportCost
        });
        explanationText = "Selected mandi with highest recent stored price and adjusted for transport cost.";
      } else {
        const live = await getLiveMandi({ cropName: crop?.name || "", region });
        if (live) {
          suggestedMandi = live.mandi_name;
          predictedPrice = Number(live.price || 0);
          predictedProfit = calculateProfit({
            pricePerUnit: predictedPrice,
            quantity: Number(quantity || 0),
            transportCost
          });
          explanationText = "Selected mandi with highest live price and adjusted for transport cost.";
        } else {
          suggestedMandi = "Nearest Mandi";
          predictedProfit = calculateProfit({ pricePerUnit: 0, quantity: Number(quantity || 0), transportCost });
          explanationText = "No recent mandi price data found. Using default recommendation.";
        }
      }

      const soilScore = crop
        ? (rangeScore(Number(soil_ph), crop.optimal_ph_range)
            + rangeScore(Number(soil_n), crop.optimal_n_range)
            + rangeScore(Number(soil_p), crop.optimal_p_range)
            + rangeScore(Number(soil_k), crop.optimal_k_range)) / 4
        : 0;

      spoilageRisk = spoilageAdjust({ baseRisk: spoilageRisk, storage_temp, storage_humidity, transit_hours });

      explanationText = `${explanationText} Soil suitability score is ${(soilScore * 100).toFixed(0)}%. Spoilage risk accounts for storage and transit conditions.`;
    }

    const actions = await getRankedActions();
    const topActions = actions.slice(0, 3);

    const insertResult = await pool.query(
      `INSERT INTO recommendations (user_id, crop_id, suggested_mandi, harvest_window, spoilage_risk, predicted_profit, explanation_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, cropIdNum, suggestedMandi, harvestWindow, spoilageRisk, predictedProfit, explanationText]
    );

    return res.status(201).json({
      ...insertResult.rows[0],
      predicted_price: predictedPrice,
      preservation_actions: topActions,
      soil_score: crop ? Math.round(((rangeScore(Number(soil_ph), crop.optimal_ph_range)
        + rangeScore(Number(soil_n), crop.optimal_n_range)
        + rangeScore(Number(soil_p), crop.optimal_p_range)
        + rangeScore(Number(soil_k), crop.optimal_k_range)) / 4) * 100) : null
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate recommendation." });
  }
};

export const listRecommendationsForUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT r.*, c.name as crop_name
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
