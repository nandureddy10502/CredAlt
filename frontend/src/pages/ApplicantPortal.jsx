import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import ScoreGauge from '../components/ScoreGauge';
import ShapChart from '../components/ShapChart';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function ApplicantPortal() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(apiUrl('/api/applications/my'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setApplications(data.data);
          if (data.data.length > 0) {
            setSelectedApp(data.data[0]);
          }
        } else {
          setError(data.error || 'Failed to fetch your applications.');
        }
      } catch (err) {
        setError(err.message || 'Error communicating with backend.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyApplications();
    }
  }, [token]);

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Clock className="w-3.5 h-3.5" /> Decision Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Borrower Underwriting Portal
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
              Applicant View
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Welcome back, <span className="font-semibold text-zinc-800">{user?.name}</span>.
            Review your alternative credit ratings and underwriting decisions below.
          </p>
        </div>

        <Link
          to="/apply"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Credit Application</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-0.5">Database Notice:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-xl border border-zinc-200">
          <div className="w-7 h-7 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Loading your credit files...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">No Applications on Record</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              You haven't submitted an alternative credit application yet. Apply in minutes using your digital wallet, utility, and gig-work traces.
            </p>
          </div>
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Start Application
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Your Applications ({applications.length})
            </div>
            <div className="space-y-2">
              {applications.map((app) => {
                const appId = app._id || app.id;
                const isSelected = selectedApp && (selectedApp._id === appId || selectedApp.id === appId);
                const score = app.aiResults?.trustScore ?? 0;
                const tier = app.aiResults?.creditTier ?? 'FAIR';

                return (
                  <div
                    key={appId}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-xl border transition cursor-pointer text-xs ${
                      isSelected
                        ? 'border-zinc-900 bg-white shadow-xs'
                        : 'border-zinc-200 bg-white/70 hover:bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-zinc-400 text-[11px]">
                        ID: {appId.slice(-6)}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="font-semibold text-zinc-900 text-sm mb-1">
                      ${Number(app.applicantSnapshot?.requestedLoanAmount || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                      <span>{app.applicantSnapshot?.loanPurpose || 'Working Capital'}</span>
                      <span className="font-semibold text-zinc-800">Score: {score}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Application Details (8 cols) */}
          {selectedApp && (
            <div className="lg:col-span-8 space-y-6">
              {/* Score Gauge & Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ScoreGauge
                  score={selectedApp.aiResults?.trustScore ?? 0}
                  tier={selectedApp.aiResults?.creditTier ?? 'FAIR'}
                  size={190}
                />

                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                      Application Overview
                    </span>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-zinc-100">
                        <span className="text-zinc-500">Status:</span>
                        <span>{getStatusBadge(selectedApp.status)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-100">
                        <span className="text-zinc-500">Requested Principal:</span>
                        <span className="font-semibold font-mono text-zinc-900">
                          ${Number(selectedApp.applicantSnapshot?.requestedLoanAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-100">
                        <span className="text-zinc-500">Default Probability:</span>
                        <span className="font-mono text-zinc-800">
                          {((selectedApp.aiResults?.defaultProbability ?? 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-500">Decision Date:</span>
                        <span className="text-zinc-700">
                          {selectedApp.updatedAt ? new Date(selectedApp.updatedAt).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedApp.officerNotes && (
                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 text-[11px]">
                      <span className="font-semibold text-zinc-800 block mb-0.5">Loan Officer Note:</span>
                      <p className="text-zinc-600">{selectedApp.officerNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Risk Assessment Report Card */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Underwriter Risk Assessment Report
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-600">
                    {selectedApp.aiResults?.llmModelUsed || 'Ollama Qwen 2.5 Coder'}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 text-xs leading-relaxed text-zinc-700">
                  {selectedApp.aiResults?.riskAssessmentReport}
                </div>
              </div>

              {/* SHAP Chart */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
                <ShapChart shapData={selectedApp.aiResults?.shapValues || []} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

