// Market controller - works without database
export const listMandiPrices = async (req, res) => {
  try {
    const { crop_id, mandi_name, date_from, date_to, live, crop, state, market } = req.query;

    // Try external Mandi API first when live=1
    if (live === "1") {
      try {
        const { fetchMandiPrices, normalizeMandiPrices } = await import('../services/externalMandiService.js');
        const raw = await fetchMandiPrices({ crop, state, market: market || mandi_name });
        const normalized = normalizeMandiPrices(raw);
        
        if (normalized && normalized.length > 0) {
          return res.json(normalized);
        }
      } catch (e) {
        console.log("External Mandi API failed, using demo data:", e.message);
      }
    }

    // Fallback to demo data
    return res.json(getDemoMandiPrices({ crop, state }));
  } catch (err) {
    console.error("Market error:", err.message);
    return res.json(getDemoMandiPrices(req.query));
  }
};

export const createMandiPrice = async (req, res) => {
  try {
    const { mandi_name, crop_id, price, arrival_volume, price_date } = req.body;
    if (!mandi_name || !crop_id || !price || !arrival_volume || !price_date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Return demo response
    return res.status(201).json({ id: Date.now(), mandi_name, crop_id, price, arrival_volume, price_date, demo: true });
  } catch (err) {
    console.error("Create mandi price error:", err.message);
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

function getDemoMandiPrices({ crop, state }) {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: 1, mandi_name: "Vashi", crop_id: 1, crop_name: crop || "Wheat", price: 2150, arrival_volume: 500, price_date: today, state: "Maharashtra" },
    { id: 2, mandi_name: "Azadpur", crop_id: 2, crop_name: crop || "Rice", price: 3200, arrival_volume: 300, price_date: today, state: "Delhi" },
    { id: 3, mandi_name: "Lasalgaon", crop_id: 5, crop_name: crop || "Onion", price: 1800, arrival_volume: 800, price_date: today, state: "Maharashtra" },
    { id: 4, mandi_name: "Vashi", crop_id: 6, crop_name: crop || "Tomato", price: 2500, arrival_volume: 200, price_date: today, state: "Maharashtra" },
    { id: 5, mandi_name: "Pune", crop_id: 1, crop_name: crop || "Wheat", price: 2100, arrival_volume: 450, price_date: today, state: "Maharashtra" },
    { id: 6, mandi_name: "Nagpur", crop_id: 3, crop_name: crop || "Cotton", price: 6200, arrival_volume: 150, price_date: today, state: "Maharashtra" },
    { id: 7, mandi_name: "Nashik", crop_id: 4, crop_name: crop || "Sugarcane", price: 3500, arrival_volume: 1000, price_date: today, state: "Maharashtra" },
  ];
}
