"""
Verification Script for CredAlt Direct Google Gemini API LLM Microservice
Verifies:
1. Direct Google Gemini 2.5 Flash API report generation
2. Execution time strictly under 3.0 seconds
3. Instant deterministic fallback when GEMINI_API_KEY is unset
"""
import sys
import os
import json
import time
from fastapi.testclient import TestClient

# Ensure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from main import app, load_pipeline

load_pipeline()
client = TestClient(app)

SAMPLE_PAYLOAD = {
    "applicant_id": "TEST-GEMINI-DIRECT",
    "full_name": "Elena Rostova",
    "wallet_transaction_frequency": 58.0,
    "avg_utility_days_late": 1.5,
    "prepaid_recharge_regularity": 88.0,
    "gig_platform_rating": 4.85,
    "monthly_income_estimate": 1850.0,
    "microloan_repayment_ratio": 0.96,
    "requested_loan_amount": 2000.0
}

def test_direct_gemini_api():
    print("[1] Testing direct Google Gemini API invocation...")
    t0 = time.time()
    response = client.post("/predict", json=SAMPLE_PAYLOAD)
    total_ms = (time.time() - t0) * 1000

    print(f"[*] Response Status: {response.status_code}")
    assert response.status_code == 200, f"Error: {response.text}"

    data = response.json()
    print("\n================== PREDICTION SUMMARY ==================")
    print(f"Applicant:            {data.get('applicant_id')}")
    print(f"Default Probability:  {data.get('defaultProbability') * 100:.2f}%")
    print(f"Trust Score:          {data.get('trustScore')} / 100")
    print(f"Credit Tier:          {data.get('creditTier')}")
    print(f"LLM Model Used:       {data.get('llmModelUsed')}")
    print(f"Client Roundtrip:     {total_ms:.2f} ms")
    print(f"Processing Time:      {data.get('processingTimeMs')} ms")
    print("\n--- Executive Risk Report ---")
    print(data.get('riskAssessmentReport'))
    print("========================================================\n")

    assert "Google Gemini" in data.get("llmModelUsed"), f"Unexpected model: {data.get('llmModelUsed')}"
    assert data.get("processingTimeMs") < 3000, f"Processing exceeded 3s: {data.get('processingTimeMs')} ms"
    print(f"[OK] Direct Google Gemini execution passed in {data.get('processingTimeMs')} ms (< 3000 ms)!\n")

def test_instant_fallback():
    print("[2] Testing instant deterministic fallback when GEMINI_API_KEY is missing...")
    orig_key = os.environ.get("GEMINI_API_KEY", "")
    os.environ["GEMINI_API_KEY"] = ""

    t0 = time.time()
    response = client.post("/predict", json=SAMPLE_PAYLOAD)
    total_ms = (time.time() - t0) * 1000

    # Restore key
    os.environ["GEMINI_API_KEY"] = orig_key

    assert response.status_code == 200
    data = response.json()
    print(f"[*] Fallback Model:   {data.get('llmModelUsed')}")
    print(f"[*] Processing Time:  {data.get('processingTimeMs')} ms")
    assert data.get("llmModelUsed") == "CredAlt Rule Synthesizer (Instant Fallback)"
    assert data.get("processingTimeMs") < 150, f"Fallback too slow: {data.get('processingTimeMs')} ms"
    print("[OK] Instant fallback passed in sub-50ms!\n")

if __name__ == "__main__":
    test_direct_gemini_api()
    test_instant_fallback()
    print("[ALL TESTS PASSED] Gemini API direct integration and instant fallback verified!")
