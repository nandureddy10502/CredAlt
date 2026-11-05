import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import {
  User,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Info,
  DollarSign,
  Star,
  Clock,
  Layers,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Prime Gig Driver',
    description: 'High wallet activity, 4.9 rating, on-time utilities',
    data: {
      fullName: 'Tariq Al-Mansoor',
      email: 'tariq.driver@expressride.me',
      phone: '+1 555-8921',
      employmentType: 'gig_worker',
      city: 'Metro City',
      monthlyIncomeEstimate: 2400,
      requestedLoanAmount: 2000,
      loanPurpose: 'Vehicle EV Battery Upgrade',
      wallet_transaction_frequency: 78,
      avg_utility_days_late: 0.5,
      prepaid_recharge_regularity: 96,
      gig_platform_rating: 4.92,
      microloan_repayment_ratio: 0.98,
    },
  },
  {
    name: 'Street Market Merchant',
    description: 'Steady cashflow, moderate utility delay, 4.6 rating',
    data: {
      fullName: 'Amina Khatun',
      email: 'amina.khatun@bazaartrade.org',
      phone: '+1 555-4312',
      employmentType: 'street_vendor',
      city: 'Old Quarter',
      monthlyIncomeEstimate: 1600,
      requestedLoanAmount: 1200,
      loanPurpose: 'Festive Season Inventory Bulk Purchase',
      wallet_transaction_frequency: 45,
      avg_utility_days_late: 3.2,
      prepaid_recharge_regularity: 84,
      gig_platform_rating: 4.6,
      microloan_repayment_ratio: 0.92,
    },
  },
  {
    name: 'High-Risk Seasonal Hand',
    description: 'Irregular wallet usage, frequent 25+ days late utility bills',
    data: {
      fullName: 'Devraj Patel',
      email: 'devraj.p@workday.net',
      phone: '+1 555-7734',
      employmentType: 'daily_wage',
      city: 'Suburban Outskirts',
      monthlyIncomeEstimate: 520,
      requestedLoanAmount: 1800,
      loanPurpose: 'Emergency Medical & Home Repairs',
      wallet_transaction_frequency: 7,
      avg_utility_days_late: 28.0,
      prepaid_recharge_regularity: 28,
      gig_platform_rating: 3.3,
      microloan_repayment_ratio: 0.52,
    },
  },
];

export default function ApplicationForm() {
  const { user, token, isOfficer } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    nationalId: '',
    employmentType: 'gig_worker',
    city: 'Metro Urban',
    monthlyIncomeEstimate: 1500,
    requestedLoanAmount: 1200,
    loanPurpose: 'Micro-enterprise Working Capital',
    wallet_transaction_frequency: 48,
    avg_utility_days_late: 2.0,
    prepaid_recharge_regularity: 88,
    gig_platform_rating: 4.75,
    microloan_repayment_ratio: 0.95,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) || 0 : value,
    }));
  };

  const applyPreset = (presetData) => {
    setFormData((prev) => ({
      ...prev,
      ...presetData,
      fullName: user?.role === 'applicant' ? user.name : presetData.fullName,
      email: user?.role === 'applicant' ? user.email : presetData.email,
    }));
    setErrorMessage(null);
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return 'Please provide the applicant full name.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Please provide a valid email address.';
    if (!formData.phone.trim()) return 'Please provide a contact phone number.';
    if (formData.requestedLoanAmount <= 0) return 'Requested loan amount must be greater than zero.';
    return null;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
    }
    setErrorMessage(null);
    setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(apiUrl('/api/applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit credit application.');
      }

      const newId = result.data?._id || result.data?.id;
      if (isOfficer && newId) {
        navigate(`/applications/${newId}`);
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Wizard Card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {/* Step Indicator Header */}
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Intake Workflow
            </span>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              {currentStep === 1 && 'Step 1: Borrower Profile & Loan Quantum'}
              {currentStep === 2 && 'Step 2: Alternative Digital Trace Telemetry'}
              {currentStep === 3 && 'Step 3: Pre-Underwriting Review & Model Submission'}
            </h2>
          </div>

          {/* Quick Persona Presets */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-zinc-400 font-medium mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Presets:
            </span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.data)}
                className="text-[11px] px-2 py-0.5 rounded border border-zinc-200 hover:border-zinc-900 text-zinc-700 bg-white font-medium transition"
                title={p.description}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="w-full bg-zinc-100 h-1">
          <div
            className="bg-zinc-900 h-1 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {errorMessage && (
          <div className="m-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: Borrower Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., Sunita Devi"
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sunita@trade.org"
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0192"
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    National ID / Alternate Reference
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    placeholder="VTR-9982-X"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Livelihood Classification
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  >
                    <option value="gig_worker">Gig Courier / Driver (Uber/DoorDash/Swiggy)</option>
                    <option value="street_vendor">Street Food / Produce Merchant</option>
                    <option value="freelancer">Independent Artisan / Handyman</option>
                    <option value="micro_merchant">Micro Retail / Kiosk Owner</option>
                    <option value="daily_wage">Daily Wage Laborer</option>
                    <option value="other">Other Informal Livelihood</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Operating City / District
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Metropolitan Area"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Estimated Monthly Cash Inflow ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">$</span>
                    <input
                      type="number"
                      name="monthlyIncomeEstimate"
                      value={formData.monthlyIncomeEstimate}
                      onChange={handleChange}
                      min={100}
                      className="w-full text-xs pl-7 p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Requested Loan Principal ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">$</span>
                    <input
                      type="number"
                      name="requestedLoanAmount"
                      value={formData.requestedLoanAmount}
                      onChange={handleChange}
                      min={100}
                      required
                      className="w-full text-xs pl-7 p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Working Capital Purpose
                </label>
                <input
                  type="text"
                  name="loanPurpose"
                  value={formData.loanPurpose}
                  onChange={handleChange}
                  placeholder="e.g., Inventory bulk purchase, equipment repair"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Alternative Data Telemetry */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-zinc-700 text-xs">
                <Info className="w-4 h-4 shrink-0 text-zinc-600 mt-0.5" />
                <span>
                  Telemetry vectors substitute for traditional credit bureau files.
                  XGBoost evaluates repayment capacity from transaction velocity and discipline.
                </span>
              </div>

              {/* Metric 1 */}
              <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-zinc-600" />
                    Mobile Wallet Transaction Frequency
                  </span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {formData.wallet_transaction_frequency} txns / month
                  </span>
                </div>
                <input
                  type="range"
                  name="wallet_transaction_frequency"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.wallet_transaction_frequency}
                  onChange={handleChange}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Infrequent (0-10)</span>
                  <span>Moderate (30-50)</span>
                  <span>High Volume (70+)</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Average Utility Days Late
                  </span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {formData.avg_utility_days_late} days late
                  </span>
                </div>
                <input
                  type="range"
                  name="avg_utility_days_late"
                  min="0"
                  max="45"
                  step="0.5"
                  value={formData.avg_utility_days_late}
                  onChange={handleChange}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span className="text-emerald-700 font-medium">On-Time (0-2d)</span>
                  <span>Minor Delay (5-10d)</span>
                  <span className="text-rose-700 font-medium">Delinquent (25d+)</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Mobile Top-Up / Recharge Regularity
                  </span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {formData.prepaid_recharge_regularity}%
                  </span>
                </div>
                <input
                  type="range"
                  name="prepaid_recharge_regularity"
                  min="10"
                  max="100"
                  step="1"
                  value={formData.prepaid_recharge_regularity}
                  onChange={handleChange}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Irregular (10-40%)</span>
                  <span>Consistent (75-90%)</span>
                  <span>Clockwork (95%+)</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Gig / Freelance Customer Rating
                  </span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {Number(formData.gig_platform_rating).toFixed(2)} ★
                  </span>
                </div>
                <input
                  type="range"
                  name="gig_platform_rating"
                  min="2.0"
                  max="5.0"
                  step="0.05"
                  value={formData.gig_platform_rating}
                  onChange={handleChange}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
              </div>

              {/* Metric 5 */}
              <div className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
                    Micro-Credit On-Time Repayment Ratio
                  </span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {(formData.microloan_repayment_ratio * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  name="microloan_repayment_ratio"
                  min="0.4"
                  max="1.0"
                  step="0.01"
                  value={formData.microloan_repayment_ratio}
                  onChange={handleChange}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div>
                    <h3 className="font-bold text-zinc-900">{formData.fullName}</h3>
                    <p className="text-[11px] text-zinc-500 capitalize">
                      {formData.employmentType.replace('_', ' ')} • {formData.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Requested Loan</span>
                    <span className="font-bold text-zinc-900 font-mono text-sm">
                      ${formData.requestedLoanAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Monthly Inflow</span>
                    <span className="font-semibold text-zinc-800 font-mono">
                      ${formData.monthlyIncomeEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Wallet Txns</span>
                    <span className="font-semibold text-zinc-800 font-mono">
                      {formData.wallet_transaction_frequency} / mo
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Utility Delinquency</span>
                    <span className="font-semibold text-zinc-800 font-mono">
                      {formData.avg_utility_days_late} days late
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Recharge Regularity</span>
                    <span className="font-semibold text-zinc-800 font-mono">
                      {formData.prepaid_recharge_regularity}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Gig Rating</span>
                    <span className="font-semibold text-zinc-800 font-mono">
                      {Number(formData.gig_platform_rating).toFixed(2)} ★
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Microloan Ratio</span>
                    <span className="font-semibold text-zinc-800 font-mono">
                      {(formData.microloan_repayment_ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-zinc-700">
                <Sparkles className="w-4 h-4 shrink-0 text-zinc-800 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Submitting executes the trained XGBoost Classifier, computes SHAP attributions,
                  generates the Ollama risk narrative, and writes the application to MongoDB.
                </p>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(isOfficer ? '/dashboard' : '/portal')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-xs"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Scoring with XGBoost & Ollama...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Run AI Credit Underwriter</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
