import pool from "../config/db.js";

export const getWeatherForRegion = async ({ region, dateFrom, dateTo }) => {
  const filters = [];
  const values = [];

  if (region) {
    values.push(region);
    filters.push(`region = $${values.length}`);
  }
  if (dateFrom) {
    values.push(dateFrom);
    filters.push(`forecast_date >= $${values.length}`);
  }
  if (dateTo) {
    values.push(dateTo);
    filters.push(`forecast_date <= $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM weather_data ${where} ORDER BY forecast_date ASC`,
    values
  );

  return result.rows;
};

export const estimateSpoilageRisk = (weatherRows = []) => {
  if (!weatherRows.length) return 0.25;

  const max = weatherRows.reduce(
    (acc, w) => {
      const humidity = Number(w.humidity || 0);
      const rainfall = Number(w.rainfall || 0);
      const risk = Math.min(1, (humidity / 100) * 0.6 + (rainfall / 100) * 0.4);
      return Math.max(acc, risk);
    },
    0
  );

  return Math.round(max * 100) / 100;
};
