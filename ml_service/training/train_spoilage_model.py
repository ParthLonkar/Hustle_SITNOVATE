"""
Spoilage Prediction Model Training Script
Train a model to predict crop spoilage based on weather and storage conditions.
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import os
import json
from datetime import datetime

# Model save path
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_sample_data(n_samples=1000):
    """Generate sample training data for spoilage prediction"""
    np.random.seed(42)
    
    # Feature ranges
    temperatures = np.random.uniform(10, 40, n_samples)  # Celsius
    humidity = np.random.uniform(30, 95, n_samples)  # Percentage
    rainfall = np.random.uniform(0, 50, n_samples)  # mm
    storage_temp = np.random.uniform(5, 35, n_samples)
    storage_humidity = np.random.uniform(30, 90, n_samples)
    transit_hours = np.random.uniform(0, 24, n_samples)
    
    # Calculate spoilage risk based on conditions
    spoilage_risks = []
    for i in range(n_samples):
        risk = 0.1  # Base risk
        
        # Temperature impact
        if temperatures[i] > 30:
            risk += 0.25
        elif temperatures[i] > 25:
            risk += 0.15
        elif temperatures[i] < 5:
            risk += 0.1  # Cold damage
        
        # Humidity impact
        if humidity[i] > 85:
            risk += 0.25
        elif humidity[i] > 75:
            risk += 0.15
        
        # Rainfall impact
        if rainfall[i] > 20:
            risk += 0.15
        elif rainfall[i] > 10:
            risk += 0.08
        
        # Storage conditions
        if storage_temp[i] > 25:
            risk += 0.15
        if storage_humidity[i] > 75:
            risk += 0.1
        
        # Transit time
        if transit_hours[i] > 12:
            risk += 0.15
        elif transit_hours[i] > 6:
            risk += 0.08
        
        # Add noise
        risk += np.random.uniform(-0.05, 0.05)
        
        spoilage_risks.append(max(0, min(1, risk)))
    
    # Convert to risk categories
    risk_categories = []
    for risk in spoilage_risks:
        if risk > 0.5:
            risk_categories.append(2)  # High
        elif risk > 0.25:
            risk_categories.append(1)  # Medium
        else:
            risk_categories.append(0)  # Low
    
    # Create DataFrame
    df = pd.DataFrame({
        'temperature': temperatures,
        'humidity': humidity,
        'rainfall': rainfall,
        'storage_temp': storage_temp,
        'storage_humidity': storage_humidity,
        'transit_hours': transit_hours,
        'spoilage_risk': spoilage_risks,
        'risk_category': risk_categories
    })
    
    return df

def create_features(df):
    """Create feature matrix"""
    feature_cols = ['temperature', 'humidity', 'rainfall', 'storage_temp', 'storage_humidity', 'transit_hours']
    X = df[feature_cols].values
    y = df['risk_category'].values
    y_regression = df['spoilage_risk'].values
    return X, y, y_regression

def train_model(training_data=None):
    """
    Main training function
    Args:
        training_data: dict with 'data' key containing list of samples
    Returns:
        dict with training results
    """
    print("=" * 60)
    print("SPOILAGE PREDICTION MODEL TRAINING")
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
    X, y, y_reg = create_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest Classifier
    print("\nTraining Random Forest classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Train Gradient Boosting Classifier
    print("Training Gradient Boosting classifier...")
    gb_model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )
    gb_model.fit(X_train_scaled, y_train)
    
    # Train Regression model for continuous prediction
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    
    print("\nTraining spoilage risk regressor...")
    rf_reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    rf_reg.fit(X_train_scaled, y_train_reg)
    
    gb_reg = GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    gb_reg.fit(X_train_scaled, y_train_reg)
    
    # Evaluate classifiers
    rf_pred = rf_model.predict(X_test_scaled)
    gb_pred = gb_model.predict(X_test_scaled)
    
    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    
    # Random Forest metrics
    rf_accuracy = accuracy_score(y_test, rf_pred)
    rf_precision = precision_score(y_test, rf_pred, average='weighted')
    rf_recall = recall_score(y_test, rf_pred, average='weighted')
    rf_f1 = f1_score(y_test, rf_pred, average='weighted')
    
    print(f"\nRandom Forest Classifier:")
    print(f"  Accuracy: {rf_accuracy:.4f}")
    print(f"  Precision: {rf_precision:.4f}")
    print(f"  Recall: {rf_recall:.4f}")
    print(f"  F1 Score: {rf_f1:.4f}")
    
    # Gradient Boosting metrics
    gb_accuracy = accuracy_score(y_test, gb_pred)
    gb_precision = precision_score(y_test, gb_pred, average='weighted')
    gb_recall = recall_score(y_test, gb_pred, average='weighted')
    gb_f1 = f1_score(y_test, gb_pred, average='weighted')
    
    print(f"\nGradient Boosting Classifier:")
    print(f"  Accuracy: {gb_accuracy:.4f}")
    print(f"  Precision: {gb_precision:.4f}")
    print(f"  Recall: {gb_recall:.4f}")
    print(f"  F1 Score: {gb_f1:.4f}")
    
    # Evaluate regression models
    rf_reg_pred = rf_reg.predict(X_test_scaled)
    gb_reg_pred = gb_reg.predict(X_test_scaled)
    
    from sklearn.metrics import mean_squared_error, r2_score
    
    rf_reg_rmse = np.sqrt(mean_squared_error(y_test_reg, rf_reg_pred))
    rf_reg_r2 = r2_score(y_test_reg, rf_reg_pred)
    
    gb_reg_rmse = np.sqrt(mean_squared_error(y_test_reg, gb_reg_pred))
    gb_reg_r2 = r2_score(y_test_reg, gb_reg_pred)
    
    print(f"\nRandom Forest Regressor:")
    print(f"  RMSE: {rf_reg_rmse:.4f}")
    print(f"  R² Score: {rf_reg_r2:.4f}")
    
    print(f"\nGradient Boosting Regressor:")
    print(f"  RMSE: {gb_reg_rmse:.4f}")
    print(f"  R² Score: {gb_reg_r2:.4f}")
    
    # Select best model (using classifier accuracy)
    if gb_accuracy > rf_accuracy:
        best_classifier = gb_model
        best_regressor = gb_reg
        best_name = "GradientBoosting"
        best_accuracy = gb_accuracy
    else:
        best_classifier = rf_model
        best_regressor = rf_reg
        best_name = "RandomForest"
        best_accuracy = rf_accuracy
    
    print(f"\nBest model: {best_name}")
    
    # Save model package
    model_package = {
        'classifier': best_classifier,
        'regressor': best_regressor,
        'scaler': scaler,
        'feature_names': ['temperature', 'humidity', 'rainfall', 'storage_temp', 'storage_humidity', 'transit_hours'],
        'model_type': best_name,
        'training_date': datetime.now().isoformat(),
        'metrics': {
            'accuracy': float(best_accuracy),
            'rmse': float(gb_reg_rmse if best_name == "GradientBoosting" else rf_reg_rmse),
            'r2': float(gb_reg_r2 if best_name == "GradientBoosting" else rf_reg_r2)
        }
    }
    
    # Save model
    model_path = os.path.join(MODELS_DIR, 'spoilage_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_package, f)
    
    print(f"\nModel saved to: {model_path}")
    print("=" * 60)
    
    return {
        'model_type': best_name,
        'accuracy': float(best_accuracy),
        'rmse': float(gb_reg_rmse if best_name == "GradientBoosting" else rf_reg_rmse),
        'r2': float(gb_reg_r2 if best_name == "GradientBoosting" else rf_reg_r2),
        'n_samples': len(df),
        'training_date': datetime.now().isoformat()
    }

if __name__ == '__main__':
    # Run training
    result = train_model()
    print("\nTraining completed!")
    print(json.dumps(result, indent=2))
