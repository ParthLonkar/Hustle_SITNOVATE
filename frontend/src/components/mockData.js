export const mockRecommendation = {
  best_mandi: "Nagpur APMC",
  harvest_window: "Harvest in 3-5 days",
  predicted_price: 2400,
  spoilage_risk: 0.23,
  net_profit: 18500,
  explanation:
    "High humidity forecast on Day 3-4 increases spoilage risk. Recommend harvesting before Day 3 and transporting to Nagpur APMC for the best net return after transport costs.",
  weather: [
    { day: "Mon", temp: 31, rain: 10, humidity: 62 },
    { day: "Tue", temp: 33, rain: 0,  humidity: 58 },
    { day: "Wed", temp: 29, rain: 40, humidity: 78 },
    { day: "Thu", temp: 27, rain: 70, humidity: 85 },
    { day: "Fri", temp: 30, rain: 20, humidity: 70 },
    { day: "Sat", temp: 32, rain: 5,  humidity: 60 },
    { day: "Sun", temp: 34, rain: 0,  humidity: 55 }
  ]
};

export const mockMandis = [
  { name: "Nagpur APMC",    price: 2400, distance: 45, transport: 1200, profit: 18500, trend: "+4%" },
  { name: "Wardha Mandi",   price: 2200, distance: 30, transport: 800,  profit: 16800, trend: "-1%" },
  { name: "Amravati Mandi", price: 2600, distance: 90, transport: 2400, profit: 17200, trend: "+7%" },
  { name: "Yavatmal Mandi", price: 2100, distance: 110, transport: 2900, profit: 14800, trend: "-3%" }
];

export const crops = ["Tomato", "Onion", "Wheat", "Cotton", "Soybean", "Orange", "Pomegranate"];
export const regions = ["Nagpur", "Wardha", "Amravati", "Yavatmal", "Akola", "Buldana"];

export const recentRecs = [
  { farmer: "Ramesh Patil", crop: "Tomato", region: "Nagpur", mandi: "Nagpur APMC", profit: 18500, date: "Today 9:12 AM", risk: "23%" },
  { farmer: "Sunita Devi",  crop: "Onion",  region: "Wardha", mandi: "Wardha Mandi", profit: 14200, date: "Today 8:45 AM", risk: "41%" },
  { farmer: "Vikas Jadhav", crop: "Cotton", region: "Amravati", mandi: "Amravati Mandi", profit: 31000, date: "Yesterday", risk: "18%" },
  { farmer: "Meena Rao",    crop: "Soybean",region: "Yavatmal", mandi: "Nagpur APMC", profit: 22400, date: "Yesterday", risk: "12%" },
  { farmer: "Anil Kumar",   crop: "Orange", region: "Nagpur", mandi: "Amravati Mandi", profit: 29800, date: "2 days ago", risk: "35%" }
];
