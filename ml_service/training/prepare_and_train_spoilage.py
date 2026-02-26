"""
Mendeley Cold Storage Dataset → Spoilage Model Trainer
Dataset: https://data.mendeley.com/datasets/czz68d9fwj/1
Columns: Fruit, Temp, Humid, Light, CO2, Class

Usage:
    python prepare_and_train_spoilage.py --csv path/to/dataset.csv
    python prepare_and_train_spoilage.py --csv path/to/dataset.csv --augment 5000
"""

import pickle
import numpy as np
import pandas as pd
import argparse
import os
import json
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score,
                             recall_score, f1_score,
                             mean_squared_error, r2_score)

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)


# ─────────────────────────────────────────────
# STEP 1: Load & convert Mendeley CSV
# ─────────────────────────────────────────────
def load_mendeley_dataset(csv_path):
    """
    Load the Mendeley cold storage CSV and map columns to
    the features your spoilage model expects.
    """
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Raw shape: {df.shape}")
    print(f"Columns found: {list(df.columns)}")

    # Normalise column names (strip spaces, lowercase)
    df.columns = [c.strip().lower() for c in df.columns]

    # ── Column mapping ────────────────────────────────────────────────────
    # Mendeley cols: fruit, temp, humid, light, co2, class
    # Model cols   : temperature, humidity, rainfall, storage_temp,
    #                storage_humidity, transit_hours,
    #                spoilage_risk (0-1), risk_category (0/1/2)

    renamed = pd.DataFrame()

    # Ambient temperature  (same sensor = ambient + storage in cold room)
    renamed['temperature']       = df['temp']
    renamed['storage_temp']      = df['temp'] + np.random.uniform(-2, 2, len(df))

    # Humidity
    renamed['humidity']          = df['humid']
    renamed['storage_humidity']  = df['humid'] + np.random.uniform(-3, 3, len(df))

    # Rainfall: estimated from CO2 (high CO2 → possible rain / poor ventilation)
    # Scale CO2 (typical 400-2000 ppm) → rainfall 0-30 mm
    co2_norm = (df['co2'] - df['co2'].min()) / (df['co2'].max() - df['co2'].min() + 1e-9)
    renamed['rainfall'] = co2_norm * 20  # 0-20 mm proxy

    # Transit hours: fruit type influences typical transit distance
    fruit_transit = {
        'orange': 8, 'pineapple': 12, 'banana': 6, 'tomato': 4,
        'mango': 10, 'apple': 7, 'grape': 5
    }
    if 'fruit' in df.columns:
        renamed['transit_hours'] = df['fruit'].str.lower().map(fruit_transit).fillna(6)
        # Add small noise
        renamed['transit_hours'] += np.random.uniform(-1, 3, len(df))
        renamed['transit_hours'] = renamed['transit_hours'].clip(0, 24)
    else:
        renamed['transit_hours'] = np.random.uniform(2, 14, len(df))

    # Target: Class (Good=0 → Low risk, Bad=1 → High risk)
    # Map to 3-class system used by your model
    if 'class' in df.columns:
        class_map = {'good': 0, 'bad': 2}
        binary = df['class'].str.strip().str.lower().map(class_map).fillna(1)
        renamed['risk_category'] = binary.astype(int)

        # Continuous spoilage_risk: Good→0-0.25, Bad→0.5-1.0
        risks = []
        for cat in renamed['risk_category']:
            if cat == 0:
                risks.append(np.random.uniform(0.05, 0.24))
            elif cat == 1:
                risks.append(np.random.uniform(0.25, 0.50))
            else:
                risks.append(np.random.uniform(0.51, 0.95))
        renamed['spoilage_risk'] = risks
    else:
        raise ValueError("No 'class' column found. Check your CSV column names.")

    print(f"Converted shape: {renamed.shape}")
    print(f"Risk category distribution:\n{renamed['risk_category'].value_counts()}")
    return renamed


# ─────────────────────────────────────────────
# STEP 2: Optional synthetic augmentation
# ─────────────────────────────────────────────
def augment_with_synthetic(df, n_extra=5000):
    """Add physics-based synthetic rows to balance & enlarge the dataset."""
    print(f"\nAugmenting with {n_extra} synthetic samples...")
    np.random.seed(0)
    temps       = np.random.uniform(10, 40, n_extra)
    humids      = np.random.uniform(30, 95, n_extra)
    rainfalls   = np.random.uniform(0,  40, n_extra)
    s_temps     = np.random.uniform(5,  35, n_extra)
    s_humids    = np.random.uniform(30, 90, n_extra)
    transits    = np.random.uniform(0,  24, n_extra)

    risks = []
    for i in range(n_extra):
        r = 0.1
        if temps[i]    > 30: r += 0.25
        elif temps[i]  > 25: r += 0.15
        if humids[i]   > 85: r += 0.25
        elif humids[i] > 75: r += 0.15
        if rainfalls[i]> 20: r += 0.15
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
        'rainfall':         rainfalls,
        'storage_temp':     s_temps,
        'storage_humidity': s_humids,
        'transit_hours':    transits,
        'spoilage_risk':    risks,
        'risk_category':    cats
    })

    combined = pd.concat([df, synthetic], ignore_index=True)
    print(f"Final dataset size: {len(combined)} rows")
    return combined


# ─────────────────────────────────────────────
# STEP 3: Train
# ─────────────────────────────────────────────
def train(df):
    FEATURE_COLS = ['temperature', 'humidity', 'rainfall',
                    'storage_temp', 'storage_humidity', 'transit_hours']

    X     = df[FEATURE_COLS].values
    y_cat = df['risk_category'].values
    y_reg = df['spoilage_risk'].values

    X_tr, X_te, yc_tr, yc_te = train_test_split(X, y_cat, test_size=0.2, random_state=42)
    _,    _,    yr_tr, yr_te = train_test_split(X, y_reg, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_tr_s = scaler.fit_transform(X_tr)
    X_te_s = scaler.transform(X_te)

    print(f"\nTraining on {len(X_tr)} samples, validating on {len(X_te)}")

    # ── Classifiers ──────────────────────────────────────────────────────
    print("Training Random Forest classifier...")
    rf_clf = RandomForestClassifier(n_estimators=200, max_depth=12,
                                    min_samples_split=5, random_state=42, n_jobs=-1)
    rf_clf.fit(X_tr_s, yc_tr)

    print("Training Gradient Boosting classifier...")
    gb_clf = GradientBoostingClassifier(n_estimators=200, max_depth=5,
                                        learning_rate=0.05, random_state=42)
    gb_clf.fit(X_tr_s, yc_tr)

    # ── Regressors ───────────────────────────────────────────────────────
    print("Training Random Forest regressor...")
    rf_reg = RandomForestRegressor(n_estimators=200, max_depth=12,
                                   random_state=42, n_jobs=-1)
    rf_reg.fit(X_tr_s, yr_tr)

    print("Training Gradient Boosting regressor...")
    gb_reg = GradientBoostingRegressor(n_estimators=200, max_depth=5,
                                       learning_rate=0.05, random_state=42)
    gb_reg.fit(X_tr_s, yr_tr)

    # ── Evaluate ─────────────────────────────────────────────────────────
    rf_acc = accuracy_score(yc_te, rf_clf.predict(X_te_s))
    gb_acc = accuracy_score(yc_te, gb_clf.predict(X_te_s))

    rf_rmse = float(np.sqrt(mean_squared_error(yr_te, rf_reg.predict(X_te_s))))
    gb_rmse = float(np.sqrt(mean_squared_error(yr_te, gb_reg.predict(X_te_s))))
    rf_r2   = float(r2_score(yr_te, rf_reg.predict(X_te_s)))
    gb_r2   = float(r2_score(yr_te, gb_reg.predict(X_te_s)))

    print(f"\n{'='*50}")
    print(f"Random Forest   → Accuracy: {rf_acc:.4f}  RMSE: {rf_rmse:.4f}  R²: {rf_r2:.4f}")
    print(f"Gradient Boost  → Accuracy: {gb_acc:.4f}  RMSE: {gb_rmse:.4f}  R²: {gb_r2:.4f}")

    # Pick best
    if gb_acc >= rf_acc:
        best_clf, best_reg, best_name = gb_clf, gb_reg, "GradientBoosting"
        best_acc, best_rmse, best_r2  = gb_acc, gb_rmse, gb_r2
    else:
        best_clf, best_reg, best_name = rf_clf, rf_reg, "RandomForest"
        best_acc, best_rmse, best_r2  = rf_acc, rf_rmse, rf_r2

    print(f"\n✅ Best model: {best_name}")

    # ── Save ─────────────────────────────────────────────────────────────
    model_package = {
        'classifier':    best_clf,
        'regressor':     best_reg,
        'scaler':        scaler,
        'feature_names': FEATURE_COLS,
        'model_type':    best_name,
        'training_date': datetime.now().isoformat(),
        'metrics': {
            'accuracy': float(best_acc),
            'rmse':     float(best_rmse),
            'r2':       float(best_r2)
        }
    }

    model_path = os.path.join(MODELS_DIR, 'spoilage_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_package, f)

    print(f"Model saved → {model_path}")

    return {
        'model_type':    best_name,
        'accuracy':      float(best_acc),
        'rmse':          float(best_rmse),
        'r2':            float(best_r2),
        'n_samples':     len(df),
        'training_date': datetime.now().isoformat()
    }


# ─────────────────────────────────────────────
# CLI entry point
# ─────────────────────────────────────────────
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train spoilage model from Mendeley dataset')
    parser.add_argument('--csv',     required=True, help='Path to downloaded CSV file')
    parser.add_argument('--augment', type=int, default=3000,
                        help='Extra synthetic rows to add (default: 3000, set 0 to skip)')
    args = parser.parse_args()

    # Load real data
    df = load_mendeley_dataset(args.csv)

    # Optionally augment
    if args.augment > 0:
        df = augment_with_synthetic(df, n_extra=args.augment)

    # Train
    result = train(df)

    print("\n" + "="*50)
    print("TRAINING COMPLETE")
    print(json.dumps(result, indent=2))