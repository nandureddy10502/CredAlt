"""
Step 1: Synthetic Data Generation, XGBoost Model Training, and SHAP Explainer Export
Alternative Credit Scorer for the Unbanked
"""

import os
import sys

# Ensure UTF-8 output encoding across Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
import numpy as np
import pandas as pd
from faker import Faker
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report

# Try importing shap, otherwise provide custom exact tree attribution fallback
try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

fake = Faker()
Faker.seed(42)
np.random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, "synthetic_applicants.csv")
MODEL_PKL_PATH = os.path.join(MODELS_DIR, "credit_model.pkl")

def generate_synthetic_data(num_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic dataset of unbanked individuals using alternative credit data.
    Features:
      - wallet_transaction_frequency: Monthly mobile wallet payments/transfers (5 - 120)
      - avg_utility_days_late: Days past due on utility bills (0 - 45)
      - prepaid_recharge_regularity: Recharge consistency percentage (10% - 100%)
      - gig_platform_rating: Driver/freelancer/delivery rating (2.5 - 5.0)
      - monthly_income_estimate: Inferred monthly income ($250 - $4,500)
      - microloan_repayment_ratio: Ratio of past micro-loans repaid on time (0.4 - 1.0)
      - target: loan_default (0 = repaid, 1 = defaulted)
    """
    print(f"[*] Generating {num_samples} synthetic applicant records...")

    # Primary required features
    wallet_freq = np.random.gamma(shape=3.5, scale=10.0, size=num_samples).clip(3, 110).round().astype(int)
    utility_late = np.random.exponential(scale=6.5, size=num_samples).clip(0, 48).round(1)
    recharge_reg = np.random.beta(a=5, b=2, size=num_samples) * 100
    recharge_reg = recharge_reg.clip(10, 100).round(1)
    gig_rating = np.random.normal(loc=4.4, scale=0.45, size=num_samples).clip(1.5, 5.0).round(2)

    # Contextual alternative features for enhanced realism
    monthly_income = np.random.lognormal(mean=7.2, sigma=0.55, size=num_samples).clip(300, 5000).round(2)
    microloan_ratio = np.random.beta(a=7, b=1.5, size=num_samples).clip(0.3, 1.0).round(3)
    requested_loan = np.random.uniform(200, 3500, size=num_samples).round(0)

    # Logistic latent risk index calculation
    # Negative weights decrease default risk (good indicators)
    # Positive weights increase default risk (bad indicators)
    z = (
        0.5                                         # baseline bias
        + (utility_late * 0.14)                     # strong risk factor: late utility payments
        - (wallet_freq * 0.045)                     # protective: frequent wallet activity
        - (recharge_reg * 0.035)                    # protective: regular prepaid recharges
        - ((gig_rating - 3.0) * 0.75)               # protective: high gig rating
        - (microloan_ratio * 2.2)                   # protective: historical on-time micro-payments
        + ((requested_loan / (monthly_income + 1)) * 0.85) # debt-to-income stress
        + np.random.normal(0, 0.65, size=num_samples) # idiosyncratic noise
    )

    # Sigmoid function to derive default probabilities
    prob_default = 1.0 / (1.0 + np.exp(-z))
    # Binary target loan_default: 1 if default, 0 if good borrower
    loan_default = (prob_default > 0.48).astype(int)

    # Generate synthetic identity information
    names = [fake.name() for _ in range(num_samples)]
    emails = [fake.email() for _ in range(num_samples)]
    phones = [fake.phone_number() for _ in range(num_samples)]
    employment_types = np.random.choice(
        ['gig_worker', 'street_vendor', 'freelancer', 'artisan', 'daily_wage', 'micro_merchant'],
        size=num_samples,
        p=[0.35, 0.20, 0.15, 0.12, 0.10, 0.08]
    )

    df = pd.DataFrame({
        "applicant_id": [f"UNB-{10000 + i}" for i in range(num_samples)],
        "full_name": names,
        "email": emails,
        "phone": phones,
        "employment_type": employment_types,
        "wallet_transaction_frequency": wallet_freq,
        "avg_utility_days_late": utility_late,
        "prepaid_recharge_regularity": recharge_reg,
        "gig_platform_rating": gig_rating,
        "monthly_income_estimate": monthly_income,
        "microloan_repayment_ratio": microloan_ratio,
        "requested_loan_amount": requested_loan,
        "loan_default": loan_default
    })

    print(f"[OK] Data generated. Total Default Rate: {df['loan_default'].mean():.2%}")
    df.to_csv(CSV_PATH, index=False)
    print(f"[OK] Saved CSV dataset to: {CSV_PATH}")
    return df

def train_and_export_model(df: pd.DataFrame):
    """
    Train an XGBoost Classifier on alternative credit features and export pipeline + explainer.
    """
    feature_columns = [
        "wallet_transaction_frequency",
        "avg_utility_days_late",
        "prepaid_recharge_regularity",
        "gig_platform_rating",
        "monthly_income_estimate",
        "microloan_repayment_ratio"
    ]

    X = df[feature_columns]
    y = df["loan_default"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"[*] Training XGBoost Classifier on {len(X_train)} samples...")
    model = XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)

    auc = roc_auc_score(y_test, y_pred_proba)
    acc = accuracy_score(y_test, y_pred)
    print(f"[OK] Model Performance: ROC-AUC = {auc:.4f}, Accuracy = {acc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Calculate baseline probability for score calibration
    baseline_default_prob = float(y_train.mean())

    # Build SHAP Explainer
    explainer = None
    if HAS_SHAP:
        print("[*] Initializing SHAP TreeExplainer...")
        try:
            explainer = shap.TreeExplainer(model)
            print("[OK] SHAP TreeExplainer initialized successfully.")
        except Exception as e:
            print(f"[!] SHAP TreeExplainer warning: {e}")
            explainer = None

    # Package model artifacts
    pipeline_artifact = {
        "model": model,
        "feature_names": feature_columns,
        "baseline_default_prob": baseline_default_prob,
        "explainer": explainer,
        "feature_ranges": {
            col: {
                "min": float(X[col].min()),
                "max": float(X[col].max()),
                "mean": float(X[col].mean()),
                "std": float(X[col].std())
            }
            for col in feature_columns
        },
        "metadata": {
            "algorithm": "XGBoost Classifier",
            "auc": float(auc),
            "accuracy": float(acc),
            "version": "1.0.0",
            "has_native_shap": HAS_SHAP and (explainer is not None)
        }
    }

    joblib.dump(pipeline_artifact, MODEL_PKL_PATH)
    print(f"[OK] Exported model pipeline to: {MODEL_PKL_PATH}")
    return pipeline_artifact

if __name__ == "__main__":
    dataset = generate_synthetic_data(2000)
    train_and_export_model(dataset)
    print("\n[OK] Step 1 Complete: Model and synthetic data are ready!")
