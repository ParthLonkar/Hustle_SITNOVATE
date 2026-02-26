// Mock data for all dashboard components

const mandiData = [
  { name: "Wheat", emoji: "🌾", price: 2240, change: 2.4, market: "Delhi", bar: 85, color: "#f5c518" },
  { name: "Rice", emoji: "🍚", price: 3180, change: -1.1, market: "Mumbai", bar: 72, color: "#4caf50" },
  { name: "Maize", emoji: "🌽", price: 1860, change: 4.7, market: "Punjab", bar: 60, color: "#ff9500" },
  { name: "Cotton", emoji: "☁️", price: 6520, change: -0.8, market: "Gujarat", bar: 90, color: "#00b4a0" },
  { name: "Sugarcane", emoji: "🎋", price: 285, change: 1.2, market: "UP", bar: 45, color: "#ff6b35" },
  { name: "Soybean", emoji: "🫘", price: 4330, change: 3.6, market: "MP", bar: 78, color: "#a8d8a8" },
];

const spoilageData = [
  { name: "Tomatoes", pct: 68, color: "#ff6b35", days: "2-3 days" },
  { name: "Mangoes", pct: 82, color: "#f5c518", days: "4-5 days" },
  { name: "Wheat", pct: 15, color: "#4caf50", days: "180+ days" },
  { name: "Onions", pct: 30, color: "#00b4a0", days: "30-45 days" },
];

const preservationData = [
  { rank: 1, name: "Cold Storage", crop: "Potatoes", score: 94, color: "#f5c518" },
  { rank: 2, name: "Hermetic Bags", crop: "Wheat", score: 88, color: "#e0e0e0" },
  { rank: 3, name: "Solar Drying", crop: "Tomatoes", score: 76, color: "#ff9500" },
  { rank: 4, name: "Wax Coating", crop: "Fruits", score: 71, color: "#4caf50" },
  { rank: 5, name: "Modified Atm.", crop: "Veggies", score: 65, color: "#00b4a0" },
];

const marketCompareData = [
  { market: "Delhi", price: 2240, color: "#4caf50" },
  { market: "Mumbai", price: 2180, color: "#00b4a0" },
  { market: "Pune", price: 2320, color: "#f5c518" },
  { market: "Nagpur", price: 2090, color: "#ff9500" },
  { market: "Jaipur", price: 2410, color: "#ff6b35" },
  { market: "Ludhiana", price: 2280, color: "#a8d8a8" },
];

const weatherData = [
  { day: "Mon", icon: "☀️", temp: "34°C", today: true },
  { day: "Tue", icon: "⛅", temp: "31°C" },
  { day: "Wed", icon: "🌧️", temp: "27°C" },
  { day: "Thu", icon: "⛅", temp: "29°C" },
  { day: "Fri", icon: "☀️", temp: "33°C" },
  { day: "Sat", icon: "🌤️", temp: "35°C" },
  { day: "Sun", icon: "☀️", temp: "36°C" },
];

const explainFactors = [
  { label: "Rainfall", pct: 72, color: "#4caf50" },
  { label: "Temperature", pct: 88, color: "#f5c518" },
  { label: "Market Demand", pct: 60, color: "#00b4a0" },
  { label: "Transport Cost", pct: 45, color: "#ff9500" },
  { label: "Govt. Policy", pct: 33, color: "#ff6b35" },
];

const alertsData = [
  {
    type: "warn",
    icon: "⚠️",
    title: "High Spoilage Risk",
    body: "Tomatoes · Temperature rising above 35°C expected tomorrow.",
  },
  {
    type: "info",
    icon: "💡",
    title: "Price Opportunity",
    body: "Wheat prices in Jaipur 8% above your local mandi today.",
  },
  {
    type: "warn",
    icon: "🌧️",
    title: "Rain Alert",
    body: "Heavy rainfall forecast Wed–Thu. Harvest cotton now.",
  },
];

const statsData = [
  { label: "Avg. Mandi Price", value: "₹2,847", change: "+3.2%", dir: "up", icon: "📈" },
  { label: "Spoilage Prevented", value: "1.4T", change: "+12% this week", dir: "up", icon: "🛡️" },
  { label: "Active Markets", value: "38", change: "+2 new", dir: "up", icon: "🏪" },
  { label: "Revenue Saved", value: "₹4.2L", change: "this season", dir: "up", icon: "💰" },
];

export { mandiData, spoilageData, preservationData, marketCompareData, weatherData, explainFactors, alertsData, statsData };