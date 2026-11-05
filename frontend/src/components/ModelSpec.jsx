import React from 'react';
import {
  Cpu,
  Database,
  BarChart2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Terminal,
} from 'lucide-react';

export default function ModelSpec() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in text-xs">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Architecture Specification
        </span>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight mt-0.5">
          Machine Learning Pipeline & Alternative Credit Scoring Specifications
        </h1>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          Structural breakdown of the synthetic data distribution, XGBoost classifier,
          SHAP feature contribution matrices, and Ollama LLM integration.
        </p>
      </div>

      {/* Grid of 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1 */}
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                1. Synthetic Unbanked Population Dataset
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">Faker & Pandas Pipeline</span>
            </div>
          </div>
          <p className="text-zinc-600 leading-relaxed text-[11px]">
            Generates 2,000 synthetic records simulating informal gig-economy workers, street merchants,
            and unbanked individuals. Synthesizes digital wallet frequencies, utility delinquency,
            prepaid mobile recharge cadences, and platform ratings with realistic logistic latent risk distributions.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Size: 2,000 rows</span>
            <span>Target: loan_default (0/1)</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                2. XGBoost Classification Model
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">Gradient Boosted Decision Trees</span>
            </div>
          </div>
          <p className="text-zinc-600 leading-relaxed text-[11px]">
            Trained on 6 behavioral alternative data features. Calibrated with log-loss objective function,
            yielding a 0.9656 ROC-AUC and 97.5% classification accuracy on holdout test partitions.
            Exports model weights and baseline thresholds into a persistent pickle pipeline.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-800 font-semibold">
            <span>ROC-AUC: 0.9656</span>
            <span>Accuracy: 97.5%</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                3. SHAP Explainability Engine
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">TreeExplainer Shapley Values</span>
            </div>
          </div>
          <p className="text-zinc-600 leading-relaxed text-[11px]">
            Extracts individual local feature attributions for every applicant. Deconstructs the model's
            black-box prediction into distinct marginal point contributions (positive or negative)
            showing loan officers exactly which telemetry vectors influenced the Trust Score.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Method: TreeExplainer</span>
            <span>Attribution: Exact local additivity</span>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                4. Ollama LLM Underwriting Narrative
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">Qwen 2.5 Coder + CUDA</span>
            </div>
          </div>
          <p className="text-zinc-600 leading-relaxed text-[11px]">
            The FastAPI microservice communicates with local Ollama executing Qwen 2.5 Coder with GPU acceleration.
            Synthesizes raw inputs, SHAP attributions, and the credit tier into a 3-4 sentence plain-English
            underwriting narrative with zero hallucination.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Model: Qwen 2.5 Coder</span>
            <span>Inference: Local Hardware / CUDA</span>
          </div>
        </div>
      </div>

      {/* Alternative Data Features Summary Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50">
          <h3 className="text-xs font-bold text-zinc-900">
            Alternative Feature Engineering Matrix
          </h3>
          <p className="text-[11px] text-zinc-500">
            Mapping non-traditional informal economy signals into quantitative risk variables
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/75 border-b border-zinc-200 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-5">Telemetry Feature</th>
                <th className="py-2.5 px-4">Domain Context</th>
                <th className="py-2.5 px-4">Typical Range</th>
                <th className="py-2.5 px-4">Risk Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="py-2.5 px-5 font-mono font-semibold text-zinc-900">
                  wallet_transaction_frequency
                </td>
                <td className="py-2.5 px-4 text-zinc-600">
                  Monthly digital wallet transactions (payments received, vendor transfers)
                </td>
                <td className="py-2.5 px-4 font-mono text-zinc-500">5 – 120 txns/mo</td>
                <td className="py-2.5 px-4 text-emerald-700 font-semibold">Higher = Lower Default</td>
              </tr>

              <tr>
                <td className="py-2.5 px-5 font-mono font-semibold text-zinc-900">
                  avg_utility_days_late
                </td>
                <td className="py-2.5 px-4 text-zinc-600">
                  Historical delay in clearing municipal power, water, or cooking gas bills
                </td>
                <td className="py-2.5 px-4 font-mono text-zinc-500">0 – 45 days</td>
                <td className="py-2.5 px-4 text-rose-700 font-semibold">Higher = Higher Default</td>
              </tr>

              <tr>
                <td className="py-2.5 px-5 font-mono font-semibold text-zinc-900">
                  prepaid_recharge_regularity
                </td>
                <td className="py-2.5 px-4 text-zinc-600">
                  Cadence consistency percentage in recurring mobile data & phone top-ups
                </td>
                <td className="py-2.5 px-4 font-mono text-zinc-500">10% – 100%</td>
                <td className="py-2.5 px-4 text-emerald-700 font-semibold">Higher = Lower Default</td>
              </tr>

              <tr>
                <td className="py-2.5 px-5 font-mono font-semibold text-zinc-900">
                  gig_platform_rating
                </td>
                <td className="py-2.5 px-4 text-zinc-600">
                  Weighted rating on delivery, rideshare, or freelance artisan marketplaces
                </td>
                <td className="py-2.5 px-4 font-mono text-zinc-500">1.5 – 5.0 ★</td>
                <td className="py-2.5 px-4 text-emerald-700 font-semibold">Higher = Lower Default</td>
              </tr>

              <tr>
                <td className="py-2.5 px-5 font-mono font-semibold text-zinc-900">
                  monthly_income_estimate
                </td>
                <td className="py-2.5 px-4 text-zinc-600">
                  Inferred monthly cash generation from digital footprints & merchant flows
                </td>
                <td className="py-2.5 px-4 font-mono text-zinc-500">$300 – $5,000</td>
                <td className="py-2.5 px-4 text-emerald-700 font-semibold">Higher = Lower Default</td>
              </tr>

              <tr>
                <td className="py-2.5 px-5 font-mono font-semibold text-zinc-900">
                  microloan_repayment_ratio
                </td>
                <td className="py-2.5 px-4 text-zinc-600">
                  On-time fulfillment ratio for peer micro-advances or buy-now-pay-later tokens
                </td>
                <td className="py-2.5 px-4 font-mono text-zinc-500">0.40 – 1.00</td>
                <td className="py-2.5 px-4 text-emerald-700 font-semibold">Higher = Lower Default</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
