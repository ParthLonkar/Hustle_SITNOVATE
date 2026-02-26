# ML Model Training Guide for Agrichain

This guide explains how to train the machine learning models for the Agrichain application.

## Quick Start

### Option 1: Run Training Scripts Directly

```
bash
# Navigate to ML service directory
cd ml_service

# Install dependencies
pip install -r requirements.txt

# Train all models
python training/train_price_model.py
python training/train_spoilage_model.py
python training/train_soil_model.py
```

### Option 2: Run via API

```
bash
# Start ML service
python api/main.py

# Train models via HTTP
curl -X POST http://localhost:8000/train/price -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:8000/train/spoilage -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:8000/train/soil -H "Content-Type: application/json" -d '{}'
```

### Option 3: Docker

```
bash
cd docker
docker-compose up ml
```

## Model Descriptions

| Model | File | Purpose |
|-------|------|---------|
| Price Forecast | `price_forecast_model.pkl` | Predicts crop prices based on quantity, soil, weather |
| Spoilage | `spoilage_model.pkl` | Estimates spoilage risk based on storage conditions |
| Soil | `soil_model.pkl` | Analyzes soil suitability for crops |

## Training Data Format

### Price Model
```
json
{
  "data": [
    {"quantity": 100, "soil_ph": 6.5, "soil_n": 60, "soil_p": 40, "soil_k": 50, "temperature": 25, "humidity": 60, "price": 2000}
  ]
}
```

### Spoilage Model
```
json
{
  "data": [
    {"crop_type": "tomato", "quantity": 100, "initial_quality": 1.0, "storage_temp": 20, "storage_humidity": 60, "transit_hours": 6, "spoilage_rate": 0.15}
  ]
}
```

### Soil Model
```
json
{
  "data": [
    {"crop_id": 1, "soil_ph": 6.5, "soil_n": 60, "soil_p": 40, "soil_k": 50, "suitability_score": 0.85}
  ]
}
```

## Output

Trained models are saved to:
- `ml_service/models/price_forecast_model.pkl`
- `ml_service/models/spoilage_model.pkl`
- `ml_service/models/soil_model.pkl`
