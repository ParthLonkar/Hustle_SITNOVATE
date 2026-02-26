"""
Spoilage Prediction Model Training Script
Train a model to predict crop spoilage based on weather and storage conditions.

Usage:
    python train_spoilage_model.py                          # synthetic data only
    python train_spoilage_model.py --csv path/to/data.csv  # real Mendeley dataset
    python train_spoilage_model.py --csv path/to/data.csv --augment 3000
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, mean_squared_error, r2_score)
import os
import json
import argparse
from datetime import datetime

# Model save path
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)


def load_mendeley_csv(csv_path, augment=3000):
    """
    Load the Mendeley cold storage CSV and convert it to the model's expected format.
    Mendeley columns: Fruit, Temp, Humid, Light, CO2, Class
    Model columns:    temperature, humidity, rainfall, storage_temp,
                      storage_humidity, transit_hours, spoilage_risk, risk_category
    """
    print(f"Loading real dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Raw shape: {df.shape}")

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]
    print(f"Columns: {list(df.columns)}")

    converted = pd.DataFrame()

    # Temperature → ambient + storage (slight variation)
    converted['temperature']      = df['temp']
    converted['storage_temp']     = df['temp'] + np.random.uniform(-2, 2, len(df))

    # Humidity → ambient + storage (slight variation)
    converted['humidity']         = df['humid']
    converted['storage_humidity'] = df['humid'] + np.random.uniform(-3, 3, len(df))

    # Rainfall derived from CO2 (high CO2 → poor ventilation/rain proxy)
    co2_min, co2_max = df['co2'].min(), df['co2'].max()
    co2_norm = (df['co2'] - co2_min) / (co2_max - co2_min + 1e-9)
    converted['rainfall'] = co2_norm * 20  # scale to 0–20 mm

    # Transit hours derived from fruit type (realistic Indian logistics)
    fruit_transit = {
        'orange': 8, 'pineapple': 12, 'banana': 6,
        'tomato': 4, 'mango': 10, 'apple': 7, 'grape': 5
    }
    if 'fruit' in df.columns:
        converted['transit_hours'] = (
            df['fruit'].str.strip().str.lower()
                       .map(fruit_transit).fillna(6)
            + np.random.uniform(-1, 3, len(df))
        ).clip(0, 24)
    else:
        converted['transit_hours'] = np.random.uniform(2, 14, len(df))

    # Class → risk_category  (Good=0 Low, Bad=2 High)
    class_map = {'good': 0, 'bad': 2}
    converted['risk_category'] = (
        df['class'].str.strip().str.lower()
                   .map(class_map).fillna(1).astype(int)
    )

    # Continuous spoilage_risk from category
    np.random.seed(42)
    risks = []
    for cat in converted['risk_category']:
        if cat == 0:
            risks.append(np.random.uniform(0.05, 0.24))
        elif cat == 1:
            risks.append(np.random.uniform(0.25, 0.50))
        else:
            risks.append(np.random.uniform(0.51, 0.95))
    converted['spoilage_risk'] = risks

    print(f"Converted shape: {converted.shape}")
    print(f"Risk distribution:\n{converted['risk_category'].value_counts().to_string()}")

    # Optional synthetic augmentation to balance classes
    if augment > 0:
        converted = augment_with_synthetic(converted, n_extra=augment)

    return converted


def augment_with_synthetic(df, n_extra=3000):
    """Add physics-based synthetic rows to enlarge and balance the dataset."""
    print(f"\nAdding {n_extra} synthetic rows for balance...")
    np.random.seed(0)
    temps    = np.random.uniform(10, 40, n_extra)
    humids   = np.random.uniform(30, 95, n_extra)
    rains    = np.random.uniform(0,  40, n_extra)
    s_temps  = np.random.uniform(5,  35, n_extra)
    s_humids = np.random.uniform(30, 90, n_extra)
    transits = np.random.uniform(0,  24, n_extra)

    risks = []
    for i in range(n_extra):
        r = 0.1
        if temps[i]    > 30: r += 0.25
        elif temps[i]  > 25: r += 0.15
        if humids[i]   > 85: r += 0.25
        elif humids[i] > 75: r += 0.15
        if rains[i]    > 20: r += 0.15
        if s_temps[i]  > 25: r += 0.15
        if s_humids[i] > 75: r += 0.10
        if transits[i] > 12: r += 0.15
        elif transits[i]> 6: r += 0.08
        r += np.random.uniform(-0.05, 0.05)
        risks.append(float(np.clip(r, 0, 1)))

    cats = [2 if r > 0.5 else 1 if r > 0.25 else 0 for r in risks]

    synthetic = pd.DataFrame({
        'temperature':      temps,
        'humidity':         humids,
        'rainfall':         rains,
        'storage_temp':     s_temps,
        'storage_humidity': s_humids,
        'transit_hours':    transits,
        'spoilage_risk':    risks,
        'risk_category':    cats
    })

    combined = pd.concat([df, synthetic], ignore_index=True)
    print(f"Total dataset size after augmentation: {len(combined)} rows")
    return combined


def generate_sample_data(n_samples=1000):
    """Generate sample training data for spoilage prediction (fallback)"""
    np.random.seed(42)

    temperatures    = np.random.uniform(10, 40, n_samples)
    humidity        = np.random.uniform(30, 95, n_samples)
    rainfall        = np.random.uniform(0,  50, n_samples)
    storage_temp    = np.random.uniform(5,  35, n_samples)
    storage_humidity= np.random.uniform(30, 90, n_samples)
    transit_hours   = np.random.uniform(0,  24, n_samples)

    spoilage_risks = []
    for i in range(n_samples):
        risk = 0.1
        if temperatures[i]     > 30: risk += 0.25
        elif temperatures[i]   > 25: risk += 0.15
        elif temperatures[i]   <  5: risk += 0.10
        if humidity[i]         > 85: risk += 0.25
        elif humidity[i]       > 75: risk += 0.15
        if rainfall[i]         > 20: risk += 0.15
        elif rainfall[i]       > 10: risk += 0.08
        if storage_temp[i]     > 25: risk += 0.15
        if storage_humidity[i] > 75: risk += 0.10
        if transit_hours[i]    > 12: risk += 0.15
        elif transit_hours[i]  >  6: risk += 0.08
        risk += np.random.uniform(-0.05, 0.05)
        spoilage_risks.append(max(0, min(1, risk)))

    risk_categories = [2 if r > 0.5 else 1 if r > 0.25 else 0 for r in spoilage_risks]

    return pd.DataFrame({
        'temperature':      temperatures,
        'humidity':         humidity,
        'rainfall':         rainfall,
        'storage_temp':     storage_temp,
        'storage_humidity': storage_humidity,
        'transit_hours':    transit_hours,
        'spoilage_risk':    spoilage_risks,
        'risk_category':    risk_categories
    })


def create_features(df):
    """Create feature matrix"""
    feature_cols = ['temperature', 'humidity', 'rainfall',
                    'storage_temp', 'storage_humidity', 'transit_hours']
    X            = df[feature_cols].values
    y            = df['risk_category'].values
    y_regression = df['spoilage_risk'].values
    return X, y, y_regression


def train_model(training_data=None, csv_path=None, augment=3000):
    """
    Main training function.
    Priority: csv_path > training_data dict > synthetic fallback
    """
    print("=" * 60)
    print("SPOILAGE PREDICTION MODEL TRAINING")
    print("=" * 60)

    # ── Data loading priority ─────────────────────────────────────────────
    if csv_path and os.path.exists(csv_path):
        print(f"Using real dataset: {csv_path}")
        df = load_mendeley_csv(csv_path, augment=augment)

    elif training_data and 'data' in training_data:
        print("Using provided training data dict...")
        df = pd.DataFrame(training_data['data'])

    else:
        print("No dataset provided — generating synthetic training data...")
        df = generate_sample_data(n_samples=1000)
        print(f"Generated {len(df)} synthetic samples")

    # ── Features ──────────────────────────────────────────────────────────
    X, y, y_reg = create_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)
    X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(
        X, y_reg, test_size=0.2, random_state=42)

    print(f"\nTraining set : {len(X_train)} samples")
    print(f"Test set     : {len(X_test)} samples")

    scaler         = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    # ── Classifiers ───────────────────────────────────────────────────────
    print("\nTraining Random Forest classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=200, max_depth=12,
        min_samples_split=5, random_state=42, n_jobs=-1)
    rf_model.fit(X_train_scaled, y_train)

    print("Training Gradient Boosting classifier...")
    gb_model = GradientBoostingClassifier(
        n_estimators=200, max_depth=5,
        learning_rate=0.05, random_state=42)
    gb_model.fit(X_train_scaled, y_train)

    # ── Regressors ────────────────────────────────────────────────────────
    print("\nTraining spoilage risk regressor...")
    rf_reg = RandomForestRegressor(
        n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
    rf_reg.fit(X_train_scaled, y_train_reg)

    gb_reg = GradientBoostingRegressor(
        n_estimators=200, max_depth=5,
        learning_rate=0.05, random_state=42)
    gb_reg.fit(X_train_scaled, y_train_reg)

    # ── Evaluate ──────────────────────────────────────────────────────────
    rf_pred = rf_model.predict(X_test_scaled)
    gb_pred = gb_model.predict(X_test_scaled)

    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)

    rf_accuracy  = accuracy_score(y_test, rf_pred)
    rf_precision = precision_score(y_test, rf_pred, average='weighted')
    rf_recall    = recall_score(y_test, rf_pred, average='weighted')
    rf_f1        = f1_score(y_test, rf_pred, average='weighted')

    print(f"\nRandom Forest Classifier:")
    print(f"  Accuracy : {rf_accuracy:.4f}")
    print(f"  Precision: {rf_precision:.4f}")
    print(f"  Recall   : {rf_recall:.4f}")
    print(f"  F1 Score : {rf_f1:.4f}")

    gb_accuracy  = accuracy_score(y_test, gb_pred)
    gb_precision = precision_score(y_test, gb_pred, average='weighted')
    gb_recall    = recall_score(y_test, gb_pred, average='weighted')
    gb_f1        = f1_score(y_test, gb_pred, average='weighted')

    print(f"\nGradient Boosting Classifier:")
    print(f"  Accuracy : {gb_accuracy:.4f}")
    print(f"  Precision: {gb_precision:.4f}")
    print(f"  Recall   : {gb_recall:.4f}")
    print(f"  F1 Score : {gb_f1:.4f}")

    rf_reg_pred = rf_reg.predict(X_test_scaled)
    gb_reg_pred = gb_reg.predict(X_test_scaled)

    rf_reg_rmse = float(np.sqrt(mean_squared_error(y_test_reg, rf_reg_pred)))
    rf_reg_r2   = float(r2_score(y_test_reg, rf_reg_pred))
    gb_reg_rmse = float(np.sqrt(mean_squared_error(y_test_reg, gb_reg_pred)))
    gb_reg_r2   = float(r2_score(y_test_reg, gb_reg_pred))

    print(f"\nRandom Forest Regressor:  RMSE={rf_reg_rmse:.4f}  R²={rf_reg_r2:.4f}")
    print(f"Gradient Boosting Regressor: RMSE={gb_reg_rmse:.4f}  R²={gb_reg_r2:.4f}")

    # ── Select best ───────────────────────────────────────────────────────
    if gb_accuracy > rf_accuracy:
        best_classifier = gb_model
        best_regressor  = gb_reg
        best_name       = "GradientBoosting"
        best_accuracy   = gb_accuracy
        best_rmse       = gb_reg_rmse
        best_r2         = gb_reg_r2
    else:
        best_classifier = rf_model
        best_regressor  = rf_reg
        best_name       = "RandomForest"
        best_accuracy   = rf_accuracy
        best_rmse       = rf_reg_rmse
        best_r2         = rf_reg_r2

    print(f"\n✅ Best model: {best_name}")

    # ── Save ──────────────────────────────────────────────────────────────
    model_package = {
        'classifier':    best_classifier,
        'regressor':     best_regressor,
        'scaler':        scaler,
        'feature_names': ['temperature', 'humidity', 'rainfall',
                          'storage_temp', 'storage_humidity', 'transit_hours'],
        'model_type':    best_name,
        'training_date': datetime.now().isoformat(),
        'metrics': {
            'accuracy': float(best_accuracy),
            'rmse':     float(best_rmse),
            'r2':       float(best_r2)
        }
    }

    model_path = os.path.join(MODELS_DIR, 'spoilage_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_package, f)

    print(f"\nModel saved to: {model_path}")
    print("=" * 60)

    return {
        'model_type':    best_name,
        'accuracy':      float(best_accuracy),
        'rmse':          float(best_rmse),
        'r2':            float(best_r2),
        'n_samples':     len(df),
        'training_date': datetime.now().isoformat()
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv',     type=str, default=None,
                        help='Path to Mendeley CSV dataset')
    parser.add_argument('--augment', type=int, default=3000,
                        help='Synthetic rows to add (default 3000, set 0 to skip)')
    args = parser.parse_args()

    result = train_model(csv_path=args.csv, augment=args.augment)
    print("\nTraining completed!")
    print(json.dumps(result, indent=2))