"""
Price Forecast Model Training Script
Train a model to predict crop prices based on various features.
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import os
import json
from datetime import datetime

# Model save path
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_sample_data(n_samples=1000):
    """Generate sample training data for price prediction"""
    np.random.seed(42)
    
    # Feature ranges
    quantities = np.random.uniform(10, 500, n_samples)  # quintals
    soil_ph = np.random.uniform(5.5, 8.5, n_samples)
    soil_n = np.random.uniform(20, 150, n_samples)  # kg/ha
    soil_p = np.random.uniform(10, 60, n_samples)   # kg/ha
    soil_k = np.random.uniform(15, 80, n_samples)   # kg/ha
    temperature = np.random.uniform(15, 40, n_samples)  # Celsius
    humidity = np.random.uniform(30, 90, n_samples)  # Percentage
    
    # Base price calculation (with some noise)
    base_prices = {
        'tomato': 1500, 'onion': 1200, 'wheat': 2200, 'cotton': 6500,
        'soybean': 4500, 'orange': 4000, 'pomegranate': 8000
    }
    
    # Generate prices with feature dependencies
    prices = []
    for i in range(n_samples):
        # Base price with seasonal variation
        base = 2000 + np.random.uniform(-500, 1000)
        
        # Quantity discount
        if quantities[i] > 100:
            base *= 0.95
        
        # Soil quality bonus
        ph_bonus = 1.0 if 6.0 <= soil_ph[i] <= 7.5 else 0.9
        base *= ph_bonus
        
        # Weather impact
        if temperature[i] > 35:
            base *= 1.1  # Scarcity premium
        elif temperature[i] < 20:
            base *= 0.95
        
        if humidity[i] > 80:
            base *= 0.9  # Poor quality
        
        prices.append(max(500, base + np.random.uniform(-200, 200)))
    
    # Create DataFrame
    df = pd.DataFrame({
        'quantity': quantities,
        'soil_ph': soil_ph,
        'soil_n': soil_n,
        'soil_p': soil_p,
        'soil_k': soil_k,
        'temperature': temperature,
        'humidity': humidity,
        'price': prices
    })
    
    return df

def create_features(df):
    """Create feature matrix"""
    feature_cols = ['quantity', 'soil_ph', 'soil_n', 'soil_p', 'soil_k', 'temperature', 'humidity']
    X = df[feature_cols].values
    y = df['price'].values
    return X, y

def train_model(training_data=None):
    """
    Main training function
    Args:
        training_data: dict with 'data' key containing list of samples
                     Each sample: {quantity, soil_ph, soil_n, soil_p, soil_k, temperature, humidity, price}
    Returns:
        dict with training results
    """
    print("=" * 60)
    print("PRICE FORECAST MODEL TRAINING")
    print("=" * 60)
    
    # Generate or use provided data
    if training_data and 'data' in training_data:
        print("Using provided training data...")
        df = pd.DataFrame(training_data['data'])
    else:
        print("Generating sample training data...")
        df = generate_sample_data(n_samples=1000)
        print(f"Generated {len(df)} training samples")
    
    # Prepare features and target
    X, y = create_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("\nTraining Random Forest model...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Train Gradient Boosting
    print("Training Gradient Boosting model...")
    gb_model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )
    gb_model.fit(X_train_scaled, y_train)
    
    # Evaluate models
    rf_pred = rf_model.predict(X_test_scaled)
    gb_pred = gb_model.predict(X_test_scaled)
    
    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    
    # Random Forest metrics
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
    rf_mae = mean_absolute_error(y_test, rf_pred)
    rf_r2 = r2_score(y_test, rf_pred)
    
    print(f"\nRandom Forest:")
    print(f"  RMSE: {rf_rmse:.2f}")
    print(f"  MAE: {rf_mae:.2f}")
    print(f"  R² Score: {rf_r2:.4f}")
    
    # Gradient Boosting metrics
    gb_rmse = np.sqrt(mean_squared_error(y_test, gb_pred))
    gb_mae = mean_absolute_error(y_test, gb_pred)
    gb_r2 = r2_score(y_test, gb_pred)
    
    print(f"\nGradient Boosting:")
    print(f"  RMSE: {gb_rmse:.2f}")
    print(f"  MAE: {gb_mae:.2f}")
    print(f"  R² Score: {gb_r2:.4f}")
    
    # Select best model
    if gb_rmse < rf_rmse:
        best_model = gb_model
        best_name = "GradientBoosting"
        best_rmse = gb_rmse
        best_r2 = gb_r2
    else:
        best_model = rf_model
        best_name = "RandomForest"
        best_rmse = rf_rmse
        best_r2 = rf_r2
    
    print(f"\nBest model: {best_name}")
    
    # Save model and scaler together
    model_package = {
        'model': best_model,
        'scaler': scaler,
        'feature_names': ['quantity', 'soil_ph', 'soil_n', 'soil_p', 'soil_k', 'temperature', 'humidity'],
        'model_type': best_name,
        'training_date': datetime.now().isoformat(),
        'metrics': {
            'rmse': float(best_rmse),
            'r2': float(best_r2),
            'mae': float(mean_absolute_error(y_test, best_model.predict(X_test_scaled)))
        }
    }
    
    # Save model
    model_path = os.path.join(MODELS_DIR, 'price_forecast_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_package, f)
    
    print(f"\nModel saved to: {model_path}")
    print("=" * 60)
    
    return {
        'model_type': best_name,
        'rmse': float(best_rmse),
        'r2': float(best_r2),
        'mae': float(mean_absolute_error(y_test, best_model.predict(X_test_scaled))),
        'n_samples': len(df),
        'training_date': datetime.now().isoformat()
    }

if __name__ == '__main__':
    # Run training
    result = train_model()
    print("\nTraining completed!")
    print(json.dumps(result, indent=2))
