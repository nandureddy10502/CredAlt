import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import ScoreGauge from './ScoreGauge';
import ShapChart from './ShapChart';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  User,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  Layers,
  Smartphone,
  Star,
  Clock,
  Send,
  Cpu,
} from 'lucide-react';

export default function ApplicationDetail({ application: initialApp, onBack }) {
  const { id } = useParams();
  const { user, token, isOfficer } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(initialApp || null);
  const [loading, setLoading] = useState(!initialApp && !!id);
  const [officerNotes, setOfficerNotes] = useState(initialApp?.officerNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [error, setError] = useState(null);

  const appId = id || initialApp?._id || initialApp?.id;

  // Fetch application by ID if mounted as standalone route /applications/:id
  useEffect(() => {
    if (!initialApp && appId && token) {
      const fetchApp = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch(apiUrl(`/api/applications/${appId}`), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const result = await res.json();
          if (result.success && result.data) {
            setApplication(result.data);
            setOfficerNotes(result.data.officerNotes || '');
          } else {
            setError(result.error || 'Application not found.');
          }
        } catch (err) {
          setError(err.message || 'Error fetching application record.');
        } finally {
          setLoading(false);
        }
      };
      fetchApp();
    }
  }, [appId, initialApp, token]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(isOfficer ? '/dashboard' : '/portal');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!isOfficer) return;
    setIsUpdating(true);
    setActionMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/applications/${appId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes: officerNotes }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to update status.');
      }
      setApplication(result.data);
      setActionMessage({ type: 'success', text: `Status updated to ${newStatus}` });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update status' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 font-medium">Loading underwriting file...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3 bg-white rounded-xl border border-zinc-200">
        <p className="text-xs text-rose-600 font-medium">{error || 'Application file not found.'}</p>
        <button
          onClick={handleBack}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { applicantSnapshot = {}, metrics = {}, aiResults = {}, status = 'PENDING' } = application;
  const trustScore = aiResults.trustScore ?? 50;
  const creditTier = aiResults.creditTier ?? 'FAIR';
  const defaultProb = aiResults.defaultProbability ?? 0.15;
  const shapValues = aiResults.shapValues || [];
  const reportText = aiResults.riskAssessmentReport || 'No AI Risk Assessment narrative recorded.';
  const llmEngine = aiResults.llmModelUsed || 'Ollama Qwen 2.5 Coder';

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Clock className="w-3.5 h-3.5" /> Decision Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                {applicantSnapshot.fullName || 'Applicant Details'}
              </h2>
              {getStatusBadge(status)}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              File Reference: {appId}
            </p>
          </div>
        </div>

        {/* Action Controls for Loan Officer */}
        {isOfficer && (
          <div className="flex items-center gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('APPROVED')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('MANUAL_REVIEW')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-xs disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Flag Review
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('REJECTED')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition shadow-xs disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        )}
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Grid: Left Column (4 cols), Right Column (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <ScoreGauge score={trustScore} tier={creditTier} size={190} />

          {/* Core Risk Metrics Card */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Risk Diagnostics
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Default Probability:</span>
                <span className="font-semibold text-zinc-900 font-mono">
                  {(defaultProb * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Credit Band:</span>
                <span className="font-semibold text-zinc-900">{creditTier}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Requested Quantum:</span>
                <span className="font-semibold text-zinc-900 font-mono">
                  ${Number(applicantSnapshot.requestedLoanAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500">Working Purpose:</span>
                <span className="font-medium text-zinc-800 truncate max-w-[150px]">
                  {applicantSnapshot.loanPurpose || 'Working Capital'}
                </span>
              </div>
            </div>
          </div>

          {/* Applicant Profile Card */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Borrower Profile
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-800">
                <User className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="font-medium">{applicantSnapshot.fullName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-600">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate">{applicantSnapshot.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-600">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{applicantSnapshot.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-600">
                <Briefcase className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="capitalize">
                  {(applicantSnapshot.employmentType || 'gig_worker').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* LLM Risk Assessment Narrative Card */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-800" />
                <h3 className="text-sm font-bold text-zinc-900">
                  AI Underwriting & Risk Assessment Report
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                <Cpu className="w-3 h-3 text-zinc-600" />
                {llmEngine}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100 text-xs leading-relaxed text-zinc-800">
              {reportText}
            </div>
          </div>

          {/* SHAP Feature Contribution Chart Card */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
            <ShapChart shapData={shapValues} />
          </div>

          {/* Alternative Behavioral Data Grid */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Captured Alternative Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">Wallet Activity</span>
                <span className="text-base font-bold font-mono text-zinc-900">
                  {metrics.wallet_transaction_frequency ?? 'N/A'}
                </span>
                <span className="text-[10px] text-zinc-400 block">txns / mo</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">Utility Delinquency</span>
                <span className="text-base font-bold font-mono text-zinc-900">
                  {metrics.avg_utility_days_late ?? 'N/A'}
                </span>
                <span className="text-[10px] text-zinc-400 block">days late on avg</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">Recharge Cadence</span>
                <span className="text-base font-bold font-mono text-zinc-900">
                  {metrics.prepaid_recharge_regularity ?? 'N/A'}%
                </span>
                <span className="text-[10px] text-zinc-400 block">consistency</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">Platform Rating</span>
                <span className="text-base font-bold font-mono text-zinc-900">
                  {metrics.gig_platform_rating ?? 'N/A'} ★
                </span>
                <span className="text-[10px] text-zinc-400 block">customer feedback</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">Inferred Monthly Cash</span>
                <span className="text-base font-bold font-mono text-zinc-900">
                  ${Number(metrics.monthly_income_estimate || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block">cash inflows</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">Micro-credit Track</span>
                <span className="text-base font-bold font-mono text-zinc-900">
                  {((metrics.microloan_repayment_ratio ?? 0.95) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-zinc-400 block">on-time fulfillment</span>
              </div>
            </div>
          </div>

          {/* Underwriter Notes Section (Visible to Officers) */}
          {isOfficer && (
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Underwriter Audit Notes
              </h3>
              <textarea
                rows={3}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Add supervisory verification notes, guarantor requirements, or disbursement conditions..."
                className="w-full text-xs p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
              />
              <div className="flex justify-end">
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(status)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Save Underwriter Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
