-- Seed data for Agrichain

-- Insert crops
INSERT INTO crops (name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range) VALUES
('Tomato', '[6.0, 6.8]', '[40, 80]', '[30, 60]', '[40, 80]'),
('Onion', '[6.0, 7.0]', '[40, 60]', '[30, 50]', '[50, 80]'),
('Potato', '[5.0, 6.5]', '[60, 100]', '[40, 80]', '[80, 120]'),
('Wheat', '[6.0, 7.0]', '[60, 80]', '[40, 60]', '[40, 60]'),
('Rice', '[5.5, 7.0]', '[60, 100]', '[30, 60]', '[40, 80]'),
('Cotton', '[5.5, 8.0]', '[40, 60]', '[30, 50]', '[30, 50]'),
('Soybean', '[6.0, 7.0]', '[40, 60]', '[30, 50]', '[30, 50]'),
('Orange', '[5.5, 7.0]', '[40, 60]', '[30, 50]', '[40, 60]'),
('Pomegranate', '[5.5, 7.5]', '[40, 60]', '[30, 50]', '[40, 60]'),
('Maize', '[5.5, 7.0]', '[60, 80]', '[40, 60]', '[40, 60]'),
('Gram', '[6.0, 7.5]', '[20, 40]', '[40, 60]', '[20, 40]'),
('Mustard', '[6.0, 7.5]', '[40, 60]', '[30, 50]', '[30, 50]')
ON CONFLICT (name) DO NOTHING;

-- Insert preservation actions
INSERT INTO preservation_actions (action_name, description, cost_score, effectiveness_score) VALUES
('Cold Storage', 'Store at 2-8°C to slow ripening', 4, 5),
('Ventilated Crates', 'Use perforated crates for airflow', 3, 4),
('Ethylene Absorbers', 'Use potassium permanganate pads', 3, 4),
('Proper Packing', 'Use cushioning materials', 2, 3),
('Shade Cover', 'Protect from direct sunlight', 1, 2),
('Mist Sprinkling', 'Keep produce moist but not wet', 2, 3),
('UV Treatment', 'Pre-treatment with UV-C light', 4, 4),
('Modified Atmosphere', 'Control oxygen/CO2 levels', 5, 5)
ON CONFLICT DO NOTHING;

-- Insert sample mandi prices for different crops
INSERT INTO mandi_prices (mandi_name, crop_id, price, arrival_volume, price_date) VALUES
('Nagpur APMC', 1, 2400, 500, CURRENT_DATE),
('Nagpur APMC', 2, 1800, 300, CURRENT_DATE),
('Nagpur APMC', 3, 1200, 400, CURRENT_DATE),
('Wardha Mandi', 1, 2200, 200, CURRENT_DATE),
('Wardha Mandi', 2, 1650, 150, CURRENT_DATE),
('Amravati Mandi', 1, 2600, 350, CURRENT_DATE),
('Amravati Mandi', 2, 1950, 250, CURRENT_DATE),
('Yavatmal Mandi', 1, 2100, 180, CURRENT_DATE),
('Yavatmal Mandi', 2, 1600, 120, CURRENT_DATE),
('Akola Mandi', 1, 2300, 220, CURRENT_DATE),
('Akola Mandi', 2, 1700, 180, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert sample weather data for Maharashtra
INSERT INTO weather_data (region, temperature, rainfall, humidity, forecast_date) VALUES
('Maharashtra', 31, 10, 62, CURRENT_DATE),
('Maharashtra', 33, 0, 58, CURRENT_DATE + 1),
('Maharashtra', 29, 40, 78, CURRENT_DATE + 2),
('Maharashtra', 27, 70, 85, CURRENT_DATE + 3),
('Maharashtra', 30, 20, 70, CURRENT_DATE + 4),
('Maharashtra', 32, 5, 60, CURRENT_DATE + 5),
('Maharashtra', 34, 0, 55, CURRENT_DATE + 6),
('Nagpur', 32, 5, 58, CURRENT_DATE),
('Nagpur', 34, 0, 55, CURRENT_DATE + 1),
('Nagpur', 30, 25, 75, CURRENT_DATE + 2),
('Nagpur', 28, 60, 82, CURRENT_DATE + 3),
('Nagpur', 31, 15, 68, CURRENT_DATE + 4),
('Nagpur', 33, 0, 52, CURRENT_DATE + 5),
('Nagpur', 35, 0, 50, CURRENT_DATE + 6)
ON CONFLICT DO NOTHING;
