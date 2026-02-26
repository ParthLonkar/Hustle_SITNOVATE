import pool from "../config/db.js";
import { fetchWeatherUnlocked, normalizeWeatherUnlocked } from "../services/externalWeatherService.js";

export const listWeather = async (req, res) => {
  try {
    const { region, date_from, date_to, live } = req.query;

    if (live === "1") {
      const raw = await fetchWeatherUnlocked({ region });
      const normalized = normalizeWeatherUnlocked(raw);
      return res.json(normalized);
    }

    const filters = [];
    const values = [];

    if (region) {
      values.push(region);
      filters.push(`region = $${values.length}`);
    }
    if (date_from) {
      values.push(date_from);
      filters.push(`forecast_date >= $${values.length}`);
    }
    if (date_to) {
      values.push(date_to);
      filters.push(`forecast_date <= $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM weather_data ${where} ORDER BY forecast_date DESC`,
      values
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch weather data." });
  }
};

export const createWeather = async (req, res) => {
  try {
    const { region, temperature, rainfall, humidity, forecast_date } = req.body;
    if (!region || temperature === undefined || rainfall === undefined || humidity === undefined || !forecast_date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `INSERT INTO weather_data (region, temperature, rainfall, humidity, forecast_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [region, temperature, rainfall, humidity, forecast_date]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      return res.status(409).json({ message: "Weather entry already exists for this date." });
    }
    return res.status(500).json({ message: "Failed to create weather data." });
  }
};
