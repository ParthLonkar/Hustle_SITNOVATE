"""
Agrichain ML Service API
Provides ML-powered recommendations for crop pricing, spoilage prediction, and soil analysis.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Model paths
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
TRAINING_DIR = os.path.join(os.path.dirname(__file__), '..', 'training')

# Load models (lazy loading)
models = {
    'price': None,
    'spoilage': None,
    'soil': None
}

def load_model(model_name):
    """Lazy load a model from pickle file"""
    if models[model_name] is not None:
        return models[model_name]
    
    model_path = os.path.join(MODELS_DIR, f'{model_name}_model.pkl')
    try:
        with open(model_path, 'rb') as f:
            models[model_name] = pickle.load(f)
        print(f"Loaded {model_name} model successfully")
        return models[model_name]
    except FileNotFoundError:
        print(f"Model file not found: {model_path}")
        return None
    except Exception as e:
        print(f"Error loading {model_name} model: {e}")
        return None

def get_default_price_prediction(crop_name, region, quantity):
    """Fallback price prediction when model is not available"""
    # Base prices per quintal (in Rs)
    base_prices = {
        'tomato': 1500, 'onion': 1200, 'wheat': 2200, 'cotton': 6500,
        'soybean': 4500, 'orange': 4000, 'pomegranate': 8000,
        'rice': 2100, 'maize': 1900, 'potato': 1200, 'gram': 5000,
        'mustard': 5200, 'sugarcane': 350, 'banana': 800
    }
    
    crop_lower = crop_name.lower() if crop_name else ''
    base_price = base_prices.get(crop_lower, 2000)
    
    # Regional adjustment
    region_multipliers = {
        'maharashtra': 1.1, 'nagpur': 1.15, 'mumbai': 1.2, 'pune': 1.1,
        'gujarat': 1.05, 'delhi': 1.15, 'haryana': 1.0, 'punjab': 1.0,
        'rajasthan': 0.95, 'karnataka': 1.05, 'tamil nadu': 1.1,
        'west bengal': 1.0, 'uttar pradesh': 0.95, 'madhya pradesh': 0.9
    }
    
    region_lower = region.lower() if region else ''
    multiplier = 1.0
    for key, val in region_multipliers.items():
        if key in region_lower:
            multiplier = val
            break
    
    predicted_price = base_price * multiplier
    
    # Quantity discount (bulk)
    if quantity and int(quantity) > 100:
        predicted_price *= 0.98
    
    return {
        'predicted_price': round(predicted_price, 2),
        'confidence': 0.65,
        'model_used': 'fallback'
    }

def get_default_spoilage_prediction(weather_data, storage_conditions):
    """Fallback spoilage prediction when model is not available"""
    risk = 0.25  # Base risk
    
    # Weather factors
    if weather_data:
        for day in weather_data:
            humidity = day.get('humidity', 50)
            rainfall = day.get('rainfall', 0)
            temp = day.get('temperature', 25)
            
            if humidity > 80:
                risk += 0.08
            elif humidity > 70:
                risk += 0.04
            
            if rainfall > 20:
                risk += 0.05
            
            if temp > 30:
                risk += 0.05
            elif temp < 10:
                risk -= 0.02
    
    # Storage factors
    if storage_conditions:
        temp = storage_conditions.get('temp', 20)
        humidity = storage_conditions.get('humidity', 60)
        transit = storage_conditions.get('transit', 0)
        
        if temp > 25:
            risk += 0.08
        if humidity > 70:
            risk += 0.06
        if transit and transit > 6:
            risk += 0.05
    
    risk = min(1.0, max(0.0, risk))
    
    return {
        'spoilage_risk': round(risk, 3),
        'risk_level': 'high' if risk > 0.5 else 'medium' if risk > 0.25 else 'low',
        'model_used': 'fallback'
    }

def calculate_profit(price_per_unit, quantity, transport_cost, spoilage_risk):
    """Calculate net profit with spoilage adjustment"""
    gross = price_per_unit * quantity
    spoilage_loss = gross * spoilage_risk
    net_profit = gross - transport_cost - spoilage_loss
    return max(0, round(net_profit, 2))

def determine_harvest_window(weather_data, spoilage_risk):
    """Determine optimal harvest window based on weather and spoilage risk"""
    if not weather_data:
        return "3-5 days"
    
    # Check for bad weather days
    bad_days = 0
    for i, day in enumerate(weather_data[:5]):
        if day.get('humidity', 0) > 75 or day.get('rainfall', 0) > 15:
            bad_days += 1
    
    if bad_days >= 3:
        return "Harvest immediately (bad weather ahead)"
    elif bad_days >= 2:
        return "Harvest in 1-2 days"
    elif spoilage_risk > 0.5:
        return "Harvest in 2-3 days"
    else:
        return "3-5 days"

def determine_best_mandi(mandi_prices):
    """Determine best mandi based on prices"""
    if not mandi_prices or len(mandi_prices) == 0:
        return "Nearest Mandi", 0
    
    # Sort by price (highest first)
    sorted_prices = sorted(mandi_prices, key=lambda x: x.get('price', 0), reverse=True)
    best = sorted_prices[0]
    
    return best.get('mandi_name', 'Unknown'), best.get('price', 0)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': {k: v is not None for k, v in models.items()}
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Main recommendation endpoint
    Input: crop_id, region, quantity, soil data, storage conditions, weather, mandi prices
    Output: recommended mandi, predicted price, profit, harvest window, spoilage risk
    """
    try:
        data = request.get_json()
        
        crop_id = data.get('crop_id')
        crop_name = data.get('crop_name', '')
        region = data.get('region', '')
        quantity = float(data.get('quantity', 100))
        soil_data = data.get('soil', {})
        storage_conditions = data.get('storage', {})
        weather_data = data.get('weather', [])
        mandi_prices = data.get('mandi_prices', [])
        
        print(f"Received recommendation request: crop={crop_name}, region={region}, qty={quantity}")
        
        # Try to load and use price model
        price_model = load_model('price')
        
        if price_model and hasattr(price_model, 'predict'):
            # Use ML model for prediction
            try:
                # Create feature vector
                features = np.array([[
                    quantity,
                    soil_data.get('ph', 7.0),
                    soil_data.get('n', 50),
                    soil_data.get('p', 30),
                    soil_data.get('k', 40),
                    weather_data[0].get('temperature', 25) if weather_data else 25,
                    weather_data[0].get('humidity', 60) if weather_data else 60
                ]])
                
                predicted_price = float(price_model.predict(features)[0])
                model_used = 'price_model'
            except Exception as e:
                print(f"Price model prediction error: {e}")
                price_result = get_default_price_prediction(crop_name, region, quantity)
                predicted_price = price_result['predicted_price']
                model_used = price_result['model_used']
        else:
            # Use fallback prediction
            price_result = get_default_price_prediction(crop_name, region, quantity)
            predicted_price = price_result['predicted_price']
            model_used = price_result['model_used']
        
        # Try to load and use spoilage model
        spoilage_model = load_model('spoilage')
        
        if spoilage_model and hasattr(spoilage_model, 'predict'):
            try:
                features = np.array([[
                    weather_data[0].get('temperature', 25) if weather_data else 25,
                    weather_data[0].get('humidity', 60) if weather_data else 60,
                    weather_data[0].get('rainfall', 0) if weather_data else 0,
                    storage_conditions.get('temp', 20),
                    storage_conditions.get('humidity', 60),
                    storage_conditions.get('transit', 0)
                ]])
                
                spoilage_risk = float(spoilage_model.predict(features)[0])
                spoilage_risk = min(1.0, max(0.0, spoilage_risk))
                spoilage_model_used = 'spoilage_model'
            except Exception as e:
                print(f"Spoilage model prediction error: {e}")
                spoilage_result = get_default_spoilage_prediction(weather_data, storage_conditions)
                spoilage_risk = spoilage_result['spoilage_risk']
                spoilage_model_used = spoilage_result['model_used']
        else:
            spoilage_result = get_default_spoilage_prediction(weather_data, storage_conditions)
            spoilage_risk = spoilage_result['spoilage_risk']
            spoilage_model_used = spoilage_result['model_used']
        
        # Determine best mandi
        suggested_mandi, mandi_price = determine_best_mandi(mandi_prices)
        
        # Use actual mandi price if available
        if mandi_price > 0:
            predicted_price = mandi_price
        
        # Calculate transport cost (rough estimate)
        transport_cost = quantity * 0.5  # Rs 0.5 per quintal per km (assume 50km avg)
        
        # Calculate profit
        predicted_profit = calculate_profit(predicted_price, quantity, transport_cost, spoilage_risk)
        
        # Determine harvest window
        harvest_window = determine_harvest_window(weather_data, spoilage_risk)
        
        # Generate explanation
        explanation = f"Based on {model_used} and {spoilage_model_used}. "
        if spoilage_risk > 0.4:
            explanation += f"High spoilage risk ({int(spoilage_risk*100)}%) due to weather conditions. "
            explanation += "Consider immediate harvest and fast transport."
        elif spoilage_risk > 0.25:
            explanation += f"Moderate spoilage risk ({int(spoilage_risk*100)}%). "
            explanation += "Recommend harvesting within recommended window."
        else:
            explanation += f"Low spoilage risk ({int(spoilage_risk*100)}%). "
            explanation += "Good conditions for storage and transport."
        
        result = {
            'suggested_mandi': suggested_mandi,
            'predicted_price': round(predicted_price, 2),
            'predicted_profit': predicted_profit,
            'spoilage_risk': round(spoilage_risk, 3),
            'harvest_window': harvest_window,
            'explanation_text': explanation,
            'transport_cost_estimate': round(transport_cost, 2),
            'model_used': f"{model_used}, {spoilage_model_used}",
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"Recommendation result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Recommendation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/simulate/spoilage', methods=['POST'])
def simulate_spoilage():
    """
    Spoilage simulator endpoint
    Simulates spoilage risk based on various conditions
    """
    try:
        data = request.get_json()
        
        # Input parameters
        crop_type = data.get('crop_type', 'vegetable')
        quantity = float(data.get('quantity', 100))
        initial_quality = float(data.get('initial_quality', 1.0))  # 0-1 scale
        storage_temp = float(data.get('storage_temp', 20))  # Celsius
        storage_humidity = float(data.get('storage_humidity', 60))  # Percentage
        transit_hours = float(data.get('transit_hours', 0))
        weather_conditions = data.get('weather', [])
        
        print(f"Simulating spoilage for: crop={crop_type}, qty={quantity}, temp={storage_temp}, humidity={storage_humidity}")
        
        # Base spoilage rates by crop type (per day)
        base_rates = {
            'vegetable': 0.08,
            'fruit': 0.06,
            'grain': 0.02,
            'pulses': 0.03,
            'default': 0.05
        }
        
        base_rate = base_rates.get(crop_type.lower(), base_rates['default'])
        
        # Temperature factor (optimal: 4-10°C for most produce)
        temp_factor = 1.0
        if storage_temp > 25:
            temp_factor = 2.0
        elif storage_temp > 20:
            temp_factor = 1.5
        elif storage_temp < 4:
            temp_factor = 0.8  # Too cold can also damage
        
        # Humidity factor (optimal: 40-60%)
        humidity_factor = 1.0
        if storage_humidity > 80:
            humidity_factor = 1.8
        elif storage_humidity > 70:
            humidity_factor = 1.3
        elif storage_humidity < 40:
            humidity_factor = 1.1  # Too dry can cause weight loss
        
        # Transit factor
        transit_factor = 1.0 + (transit_hours / 24) * 0.5
        
        # Weather impact
        weather_impact = 0
        if weather_conditions:
            for day in weather_conditions[:3]:
                if day.get('rainfall', 0) > 10:
                    weather_impact += 0.02
                if day.get('humidity', 0) > 80:
                    weather_impact += 0.03
        
        # Calculate daily spoilage rate
        daily_rate = base_rate * temp_factor * humidity_factor * transit_factor
        daily_rate += weather_impact
        
        # Calculate spoilage over time (7 days)
        days = [1, 2, 3, 4, 5, 6, 7]
        spoilage_percentages = []
        remaining_quality = initial_quality
        
        for day in days:
            daily_loss = remaining_quality * daily_rate
            remaining_quality -= daily_loss
            remaining_quality = max(0, remaining_quality)
            spoilage_percentages.append({
                'day': day,
                'spoilage_rate': round(daily_rate * 100, 2),
                'cumulative_spoilage': round((1 - remaining_quality) * 100, 2),
                'remaining_quality': round(remaining_quality * 100, 1)
            })
        
        final_spoilage = (1 - remaining_quality) * 100
        
        # Risk level assessment
        if final_spoilage > 50:
            risk_level = 'CRITICAL'
            recommendation = 'Immediate sale recommended - high spoilage expected!'
        elif final_spoilage > 30:
            risk_level = 'HIGH'
            recommendation = 'Sell within 2-3 days to minimize losses'
        elif final_spoilage > 15:
            risk_level = 'MEDIUM'
            recommendation = 'Monitor conditions closely, sale within 5 days recommended'
        else:
            risk_level = 'LOW'
            recommendation = 'Safe to store, maintain current conditions'
        
        result = {
            'simulation_results': spoilage_percentages,
            'final_spoilage_percent': round(final_spoilage, 2),
            'risk_level': risk_level,
            'recommendation': recommendation,
            'factors': {
                'temperature_impact': round((temp_factor - 1) * 100, 1),
                'humidity_impact': round((humidity_factor - 1) * 100, 1),
                'transit_impact': round((transit_factor - 1) * 100, 1),
                'weather_impact': round(weather_impact * 100, 1)
            },
            'optimal_conditions': {
                'suggested_temp': '4-10°C',
                'suggested_humidity': '40-60%',
                'max_transit_hours': 6
            },
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"Simulation result: risk={risk_level}, final_spoilage={final_spoilage}%")
        return jsonify(result)
        
    except Exception as e:
        print(f"Simulation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/train/<model_type>', methods=['POST'])
def train_model(model_type):
    """
    Training endpoint for ML models
    Usage: POST /train/price or /train/spoilage or /train/soil
    """
    try:
        if model_type not in ['price', 'spoilage', 'soil']:
            return jsonify({'error': 'Invalid model type. Use: price, spoilage, or soil'}), 400
        
        data = request.get_json() or {}
        
        print(f"Training {model_type} model...")
        
        # Import training modules
        if model_type == 'price':
            from training.train_price_model import train_model as train
        elif model_type == 'spoilage':
            from training.train_spoilage_model import train_model as train
        elif model_type == 'soil':
            from training.train_soil_model import train_model as train
        
        # Train model
        result = train(data)
        
        # Reload the model
        models[model_type] = None  # Reset cached model
        load_model(model_type)
        
        return jsonify({
            'status': 'success',
            'model_type': model_type,
            'message': f'{model_type.capitalize()} model trained successfully',
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except ImportError as e:
        return jsonify({
            'status': 'error',
            'message': f'Training module not found: {str(e)}',
            'instructions': f'Create training/train_{model_type}_model.py with train_model() function'
        }), 500
    except Exception as e:
        print(f"Training error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/features', methods=['GET'])
def get_features():
    """
    Feature importance endpoint
    Returns feature names and their importance for each model
    """
    try:
        features = {
            'price_model': {
                'features': [
                    'quantity', 'soil_ph', 'soil_nitrogen', 'soil_phosphorus', 
                    'soil_potassium', 'temperature', 'humidity'
                ],
                'importance': [0.15, 0.2, 0.15, 0.15, 0.15, 0.1, 0.1],
                'description': 'Features used for price prediction'
            },
            'spoilage_model': {
                'features': [
                    'temperature', 'humidity', 'rainfall', 
                    'storage_temp', 'storage_humidity', 'transit_hours'
                ],
                'importance': [0.25, 0.25, 0.15, 0.15, 0.12, 0.08],
                'description': 'Features used for spoilage risk prediction'
            },
            'soil_model': {
                'features': ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter'],
                'importance': [0.3, 0.25, 0.2, 0.15, 0.1],
                'description': 'Features used for soil health analysis'
            }
        }
        
        return jsonify(features)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/price', methods=['POST'])
def predict_price():
    """
    Direct price prediction endpoint
    """
    try:
        data = request.get_json()
        
        required_fields = ['quantity', 'soil_ph', 'soil_n', 'soil_p', 'soil_k']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        price_model = load_model('price')
        
        if price_model and hasattr(price_model, 'predict'):
            features = np.array([[
                data['quantity'],
                data['soil_ph'],
                data['soil_n'],
                data['soil_p'],
                data['soil_k'],
                data.get('temperature', 25),
                data.get('humidity', 60)
            ]])
            
            predicted_price = float(price_model.predict(features)[0])
        else:
            # Fallback
            crop_name = data.get('crop_name', '')
            region = data.get('region', '')
            result = get_default_price_prediction(crop_name, region, data['quantity'])
            predicted_price = result['predicted_price']
        
        return jsonify({
            'predicted_price': round(predicted_price, 2),
            'unit': 'Rs/quintal',
            'model': 'price_model' if price_model else 'fallback'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/spoilage', methods=['POST'])
def predict_spoilage():
    """
    Direct spoilage prediction endpoint
    """
    try:
        data = request.get_json()
        
        required_fields = ['temperature', 'humidity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        spoilage_model = load_model('spoilage')
        
        if spoilage_model and hasattr(spoilage_model, 'predict'):
            features = np.array([[
                data['temperature'],
                data['humidity'],
                data.get('rainfall', 0),
                data.get('storage_temp', 20),
                data.get('storage_humidity', 60),
                data.get('transit_hours', 0)
            ]])
            
            spoilage_risk = float(spoilage_model.predict(features)[0])
            spoilage_risk = min(1.0, max(0.0, spoilage_risk))
        else:
            # Fallback
            weather = [{'temperature': data['temperature'], 'humidity': data['humidity'], 'rainfall': data.get('rainfall', 0)}]
            storage = {'temp': data.get('storage_temp', 20), 'humidity': data.get('storage_humidity', 60), 'transit': data.get('transit_hours', 0)}
            result = get_default_spoilage_prediction(weather, storage)
            spoilage_risk = result['spoilage_risk']
        
        return jsonify({
            'spoilage_risk': round(spoilage_risk, 3),
            'risk_level': 'high' if spoilage_risk > 0.5 else 'medium' if spoilage_risk > 0.25 else 'low',
            'model': 'spoilage_model' if spoilage_model else 'fallback'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Load models on startup
@app.before_request
def before_request():
    """Load models on first request"""
    for model_name in models:
        if models[model_name] is None:
            load_model(model_name)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Agrichain ML Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
