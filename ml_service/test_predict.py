import asyncio
import sys
from main import app, ApplicantInput, predict_credit_risk

# Ensure UTF-8 output encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def test_predict():
    print("[*] Testing /predict with high creditworthiness unbanked applicant...")
    good_app = ApplicantInput(
        applicant_id="TEST-001",
        full_name="Fatima Zahra (Street Merchant)",
        wallet_transaction_frequency=68.0,
        avg_utility_days_late=1.2,
        prepaid_recharge_regularity=92.0,
        gig_platform_rating=4.85,
        monthly_income_estimate=1850.0,
        microloan_repayment_ratio=0.98,
        requested_loan_amount=1200.0
    )
    result = await predict_credit_risk(good_app)
    print(f"[OK] Trust Score: {result.trustScore}/100 | Tier: {result.creditTier} | Default Prob: {result.defaultProbability:.1%}")
    print(f"[OK] LLM Engine Used: {result.llmModelUsed}")
    print(f"[OK] Narrative Report:\n{result.riskAssessmentReport}\n")
    print("[OK] Top 3 SHAP Drivers:")
    for s in result.shapValues[:3]:
        print(f"   - {s.displayName}: {s.shapValue:+.2f} ({s.impact})")

    print("\n[*] Testing /predict with high risk unbanked applicant...")
    risky_app = ApplicantInput(
        applicant_id="TEST-002",
        full_name="Rashid Khan (Daily Wage Worker)",
        wallet_transaction_frequency=6.0,
        avg_utility_days_late=26.0,
        prepaid_recharge_regularity=25.0,
        gig_platform_rating=3.2,
        monthly_income_estimate=450.0,
        microloan_repayment_ratio=0.55,
        requested_loan_amount=2000.0
    )
    result2 = await predict_credit_risk(risky_app)
    print(f"[OK] Trust Score: {result2.trustScore}/100 | Tier: {result2.creditTier} | Default Prob: {result2.defaultProbability:.1%}")
    print(f"[OK] Narrative Report:\n{result2.riskAssessmentReport}\n")

if __name__ == "__main__":
    asyncio.run(test_predict())

