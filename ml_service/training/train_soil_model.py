"""
Soil Health Analysis Model Training Script
Train a model to analyze soil health and recommend crops.
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
import os
import json
from datetime import datetime

# Model save path
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_sample_data(n_samples=1000):
    """Generate sample training data for soil analysis"""
    np.random.seed(42)
    
    # Feature ranges
    ph_values = np.random.uniform(4.5, 9.0, n_samples)
    nitrogen = np.random.uniform(10, 200, n_samples)  # kg/ha
    phosphorus = np.random.uniform(5, 80, n_samples)  # kg/ha
    potassium = np.random.uniform(10, 120, n_samples)  # kg/ha
    organic_matter = np.random.uniform(0.2, 3.5, n_samples)  # percentage
    
    # Determine soil health scores and suitability
    health_scores = []
    crop_suitabilities = []
    
    for i in range(n_samples):
        # Calculate health score
        score = 0.5  # Base
        
        # pH impact (optimal 6.0-7.5)
        if 6.0 <= ph_values[i] <= 7.5:
            score += 0.2
        elif 5.5 <= ph_values[i] <= 8.0:
            score += 0.1
        
        # Nitrogen impact
        if nitrogen[i] >= 100:
            score += 0.1
        elif nitrogen[i] >= 50:
            score += 0.05
        
        # Phosphorus impact
        if phosphorus[i] >= 40:
            score += 0.1
        elif phosphorus[i] >= 20:
            score += 0.05
        
        # Potassium impact
        if potassium[i] >= 60:
            score += 0.1
        elif potassium[i] >= 30:
            score += 0.05
        
        # Organic matter impact
        if organic_matter[i] >= 1.5:
            score += 0.15
        elif organic_matter[i] >= 0.8:
            score += 0.1
        
        # Add noise
        score += np.random.uniform(-0.1, 0.1)
        health_scores.append(max(0, min(1, score)))
        
        # Determine crop suitability
        suitable_crops = []
        
        # Rice - likes slightly acidic, high moisture
        if 5.5 <= ph_values[i] <= 7.0 and nitrogen[i] >= 80:
            suitable_crops.append('rice')
        
        # Wheat - neutral pH, good nutrients
        if 6.0 <= ph_values[i] <= 7.5 and nitrogen[i] >= 60:
            suitable_crops.append('wheat')
        
        # Cotton - neutral to alkaline
        if 6.0 <= ph_values[i] <= 8.0:
            suitable_crops.append('cotton')
        
        # Vegetables - need good OM
        if organic_matter[i] >= 1.0 and nitrogen[i] >= 50:
            suitable_crops.append('vegetables')
        
        # Pulses - nitrogen fixing
        if ph_values[i] >= 6.0 and phosphorus[i] >= 20:
            suitable_crops.append('pulses')
        
        # Fruits
        if organic_matter[i] >= 0.8:
            suitable_crops.append('fruits')
        
        if not suitable_crops:
            suitable_crops = ['general']
        
        crop_suitabilities.append(suitable_crops)
    
    # Create DataFrame
    df = pd.DataFrame({
        'ph': ph_values,
        'nitrogen': nitrogen,
        'phosphorus': phosphorus,
        'potassium': potassium,
        'organic_matter': organic_matter,
        'health_score': health_scores,
        'suitable_crops': crop_suitabilities
    })
    
    return df

def create_features(df):
    """Create feature matrix"""
    feature_cols = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter']
    X = df[feature_cols].values
    y = df['health_score'].values
    return X, y

def train_model(training_data=None):
    """
    Main training function
    Args:
        training_data: dict with 'data' key containing list of samples
    Returns:
        dict with training results
    """
    print("=" * 60)
    print("SOIL HEALTH ANALYSIS MODEL TRAINING")
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
    
    # Train Random Forest Regressor
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
    
    # Evaluate
    y_pred = rf_model.predict(X_test_scaled)
    
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mae = np.mean(np.abs(y_test - y_pred))
    
    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    print(f"\nRandom Forest Regressor:")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  MAE: {mae:.4f}")
    print(f"  R² Score: {r2:.4f}")
    
    # Feature importance
    feature_names = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter']
    importances = rf_model.feature_importances_
    
    print("\nFeature Importance:")
    for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
        print(f"  {name}: {imp:.4f}")
    
    # Save model package
    model_package = {
        'model': rf_model,
        'scaler': scaler,
        'feature_names': feature_names,
        'model_type': 'RandomForest',
        'training_date': datetime.now().isoformat(),
        'metrics': {
            'rmse': float(rmse),
            'r2': float(r2),
            'mae': float(mae)
        }
    }
    
    # Save model
    model_path = os.path.join(MODELS_DIR, 'soil_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_package, f)
    
    print(f"\nModel saved to: {model_path}")
    print("=" * 60)
    
    return {
        'model_type': 'RandomForest',
        'rmse': float(rmse),
        'r2': float(r2),
        'mae': float(mae),
        'n_samples': len(df),
        'training_date': datetime.now().isoformat(),
        'feature_importance': {name: float(imp) for name, imp in zip(feature_names, importances)}
    }

if __name__ == '__main__':
    # Run training
    result = train_model()
    print("\nTraining completed!")
    print(json.dumps(result, indent=2))
