import pool from "../config/db.js";
import { fetchMandiPrices, normalizeMandiPrices } from "../services/externalMandiService.js";

export const listMandiPrices = async (req, res) => {
  try {
    const { crop_id, mandi_name, date_from, date_to, live, crop, state, market } = req.query;

    if (live === "1") {
      const raw = await fetchMandiPrices({ crop, state, market: market || mandi_name });
      const normalized = normalizeMandiPrices(raw);
      return res.json(normalized);
    }

    const filters = [];
    const values = [];

    if (crop_id) {
      values.push(crop_id);
      filters.push(`crop_id = $${values.length}`);
    }
    if (mandi_name) {
      values.push(mandi_name);
      filters.push(`mandi_name = $${values.length}`);
    }
    if (date_from) {
      values.push(date_from);
      filters.push(`price_date >= $${values.length}`);
    }
    if (date_to) {
      values.push(date_to);
      filters.push(`price_date <= $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM mandi_prices ${where} ORDER BY price_date DESC, price DESC`,
      values
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch mandi prices." });
  }
};

export const createMandiPrice = async (req, res) => {
  try {
    const { mandi_name, crop_id, price, arrival_volume, price_date } = req.body;
    if (!mandi_name || !crop_id || !price || !arrival_volume || !price_date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `INSERT INTO mandi_prices (mandi_name, crop_id, price, arrival_volume, price_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [mandi_name, crop_id, price, arrival_volume, price_date]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      return res.status(409).json({ message: "Mandi price entry already exists for this date." });
    }
    return res.status(500).json({ message: "Failed to create mandi price." });
  }
};
