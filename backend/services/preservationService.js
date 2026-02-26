import pool from "../config/db.js";

export const getRankedActions = async () => {
  const result = await pool.query(
    `SELECT *,
            (effectiveness_score::float / NULLIF(cost_score, 0)) AS value_score
     FROM preservation_actions
     ORDER BY value_score DESC, effectiveness_score DESC`
  );
  return result.rows;
};
