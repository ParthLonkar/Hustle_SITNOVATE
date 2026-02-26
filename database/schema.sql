-- PostgreSQL schema for Agrichain (per requested fields)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('farmer','admin','trader')),
  region        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crops (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL UNIQUE,
  optimal_ph_range  TEXT NOT NULL,
  optimal_n_range   TEXT NOT NULL,
  optimal_p_range   TEXT NOT NULL,
  optimal_k_range   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mandi_prices (
  id             BIGSERIAL PRIMARY KEY,
  mandi_name     TEXT NOT NULL,
  crop_id        BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  price          NUMERIC(12,2) NOT NULL,
  arrival_volume NUMERIC(12,2) NOT NULL,
  price_date     DATE NOT NULL,
  UNIQUE (mandi_name, crop_id, price_date)
);

CREATE TABLE IF NOT EXISTS weather_data (
  id            BIGSERIAL PRIMARY KEY,
  region        TEXT NOT NULL,
  temperature   NUMERIC(5,2) NOT NULL,
  rainfall      NUMERIC(6,2) NOT NULL,
  humidity      NUMERIC(5,2) NOT NULL,
  forecast_date DATE NOT NULL,
  UNIQUE (region, forecast_date)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id          BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  suggested_mandi  TEXT NOT NULL,
  harvest_window   TEXT NOT NULL,
  spoilage_risk    NUMERIC(5,2) NOT NULL,
  predicted_profit NUMERIC(14,2) NOT NULL,
  explanation_text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role_region ON users(role, region);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_crop_date ON mandi_prices(crop_id, price_date);
CREATE INDEX IF NOT EXISTS idx_weather_region_date ON weather_data(region, forecast_date);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
-- Preservation actions table
CREATE TABLE IF NOT EXISTS preservation_actions (
  id BIGSERIAL PRIMARY KEY,
  action_name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_score INT NOT NULL CHECK (cost_score BETWEEN 1 AND 5),
  effectiveness_score INT NOT NULL CHECK (effectiveness_score BETWEEN 1 AND 5)
);
