# Agrichain ML Service

This document explains how to use the ML service for training models and getting predictions.

## Starting the ML Service

### Option 1: Using Docker
```
bash
cd docker
docker-compose up ml-service
```

### Option 2: Running Locally
```
bash
cd ml_service
pip install -r requirements.txt
python api/main.py
```

The ML service will start on port 8000.

---

## Training Models

You can train ML models using the training endpoint. The service includes fallback logic so it works even without trained models.

### Train Price Forecast Model

```
bash
curl -X POST http://localhost:8000/train/price \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"quantity": 100, "soil_ph": 6.5, "soil_n": 90, "soil_p": 50, "soil_k": 60, "temperature": 25, "humidity": 60, "price": 2000},
      {"quantity": 150, "soil_ph": 7.0, "soil_n": 100, "soil_p": 55, "soil_k": 65, "temperature": 28, "humidity": 55, "price": 2200}
    ]
  }'
```

Or train with auto-generated sample data:
```
bash
curl -X POST http://localhost:8000/train/price \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Train Spoilage Model

```
bash
curl -X POST http://localhost:8000/train/spoilage \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"temperature": 30, "humidity": 80, "rainfall": 10, "storage_temp": 25, "storage_humidity": 70, "transit_hours": 8, "spoilage_risk": 0.6},
      {"temperature": 20, "humidity": 50, "rainfall": 0, "storage_temp": 10, "storage_humidity": 50, "transit_hours": 2, "spoilage_risk": 0.15}
    ]
  }'
```

Or train with auto-generated sample data:
```
bash
curl -X POST http://localhost:8000/train/spoilage \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Train Soil Model

```
bash
curl -X POST http://localhost:8000/train/soil \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"ph": 6.5, "nitrogen": 100, "phosphorus": 50, "potassium": 60, "organic_matter": 1.5, "health_score": 0.85},
      {"ph": 5.0, "nitrogen": 30, "phosphorus": 15, "potassium": 20, "organic_matter": 0.5, "health_score": 0.35}
    ]
  }'
```

Or train with auto-generated sample data:
```
bash
curl -X POST http://localhost:8000/train/soil \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Getting Recommendations

### Main Recommendation Endpoint

```
bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "crop_name": "tomato",
    "region": "Maharashtra",
    "quantity": 100,
    "soil": {"ph": 6.5, "n": 90, "p": 50, "k": 60},
    "storage": {"temp": 20, "humidity": 60, "transit": 6},
    "weather": [
      {"temperature": 28, "humidity": 70, "rainfall": 5},
      {"temperature": 30, "humidity": 75, "rainfall": 10}
    ],
    "mandi_prices": [
      {"mandi_name": "Nagpur APMC", "price": 2000},
      {"mandi_name": "Mumbai APMC", "price": 2200}
    ]
  }'
```

Response:
```
json
{
  "suggested_mandi": "Mumbai APMC",
  "predicted_price": 2200,
  "predicted_profit": 185000,
  "spoilage_risk": 0.35,
  "harvest_window": "3-5 days",
  "explanation_text": "Based on fallback and fallback...",
  "transport_cost_estimate": 2500
}
```

---

## Spoilage Simulator

Simulate spoilage based on various conditions:

```
bash
curl -X POST http://localhost:8000/simulate/spoilage \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "vegetable",
    "quantity": 100,
    "initial_quality": 1.0,
    "storage_temp": 25,
    "storage_humidity": 70,
    "transit_hours": 8,
    "weather": [
      {"temperature": 30, "humidity": 80, "rainfall": 15}
    ]
  }'
```

Response:
```
json
{
  "simulation_results": [
    {"day": 1, "spoilage_rate": 12.5, "cumulative_spoilage": 12.5, "remaining_quality": 87.5},
    {"day": 2, "spoilage_rate": 12.5, "cumulative_spoilage": 23.4, "remaining_quality": 76.6}
  ],
  "final_spoilage_percent": 58.3,
  "risk_level": "HIGH",
  "recommendation": "Sell within 2-3 days to minimize losses",
  "factors": {
    "temperature_impact": 50,
    "humidity_impact": 30,
    "transit_impact": 17,
    "weather_impact": 3
  },
  "optimal_conditions": {
    "suggested_temp": "4-10°C",
    "suggested_humidity": "40-60%",
    "max_transit_hours": 6
  }
}
```

---

## Feature Information

Get feature names and importance for each model:

```
bash
curl http://localhost:8000/features
```

Response:
```json
{
  "price_model": {
    "features": ["quantity", "soil_ph", "soil_n", "soil_p", "soil_k", "temperature", "humidity"],
    "importance": [0.15, 0.2, 0.15, 0.15, 0.15, 0.1, 0.1]
  },
  "spoilage_model": {
    "features": ["temperature", "humidity", "rainfall", "storage_temp", "storage_humidity", "transit_hours"],
    "importance": [0.25, 0.25, 0.15, 0.15, 0.12, 0.08]
  },
  "soil_model": {
    "features": ["ph", "nitrogen", "phosphorus", "potassium", "organic_matter"],
    "importance": [0.3, 0.25, 0.2, 0.15, 0.1]
  }
}
```

---

## Health Check

```
bash
curl http://localhost:8000/health
```

Response:
```
json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "models_loaded": {
    "price": true,
    "spoilage": true,
    "soil": true
  }
}
```

---

## Training Data Format

### Price Model Training Data
```
json
{
  "data": [
    {
      "quantity": 100,
      "soil_ph": 6.5,
      "soil_n": 90,
      "soil_p": 50,
      "soil_k": 60,
      "temperature": 25,
      "humidity": 60,
      "price": 2000
    }
  ]
}
```

### Spoilage Model Training Data
```
json
{
  "data": [
    {
      "temperature": 30,
      "humidity": 80,
      "rainfall": 10,
      "storage_temp": 25,
      "storage_humidity": 70,
      "transit_hours": 8,
      "spoilage_risk": 0.6
    }
  ]
}
```

### Soil Model Training Data
```
json
{
  "data": [
    {
      "ph": 6.5,
      "nitrogen": 100,
      "phosphorus": 50,
      "potassium": 60,
      "organic_matter": 1.5,
      "health_score": 0.85
    }
  ]
}
```

---

## Environment Variables

- `PORT`: ML service port (default: 8000)

---

## Backend Integration

The backend connects to ML service via `ML_SERVICE_URL` environment variable:

```
bash
export ML_SERVICE_URL=http://localhost:8000
```

The backend endpoints:
- `POST /api/recommendations/generate` - Get AI recommendation
- `POST /api/recommendations/simulate/spoilage` - Run spoilage simulation
- `POST /api/recommendations/train/:modelType` - Train a model (admin only)
- `GET /api/recommendations/features` - Get feature information
