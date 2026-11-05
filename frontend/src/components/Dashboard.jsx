import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import {
  Search,
  Filter,
  PlusCircle,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(apiUrl('/api/applications'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.status === 503) {
        setErrorMessage(data.error || 'Database Service Unavailable. MongoDB is disconnected.');
        setApplications([]);
        return;
      }

      if (data.success && Array.isArray(data.data)) {
        setApplications(data.data);
      } else {
        setErrorMessage(data.error || 'Failed to fetch application records.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  const handleSeedDemoData = async () => {
    try {
      setIsSeeding(true);
      setErrorMessage(null);
      const res = await fetch(apiUrl('/api/applications/seed'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApplications((prev) => [...data.data, ...prev]);
      } else {
        setErrorMessage(data.error || 'Failed to seed demo data.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to seed demo data.');
    } finally {
      setIsSeeding(false);
    }
  };

  // KPI Calculations
  const totalApps = applications.length;
  const avgTrustScore =
    totalApps > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.aiResults?.trustScore ?? 0), 0) / totalApps)
      : 0;
  const pendingCount = applications.filter((a) => a.status === 'PENDING' || a.status === 'MANUAL_REVIEW').length;
  const highRiskCount = applications.filter((a) => a.aiResults?.creditTier === 'HIGH_RISK').length;

  // Filter & Search Logic
  const filteredApps = applications.filter((app) => {
    const nameMatch =
      app.applicantSnapshot?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantSnapshot?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || app.status === statusFilter;
    const tierMatch = tierFilter === 'ALL' || app.aiResults?.creditTier === tierFilter;
    return nameMatch && statusMatch && tierMatch;
  });

  // Sorting Logic
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'score_desc') {
      return (b.aiResults?.trustScore ?? 0) - (a.aiResults?.trustScore ?? 0);
    }
    if (sortBy === 'score_asc') {
      return (a.aiResults?.trustScore ?? 0) - (b.aiResults?.trustScore ?? 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getTierBadge = (tier, score) => {
    switch (tier) {
      case 'EXCELLENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {score} • Prime
          </span>
        );
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            {score} • Good
          </span>
        );
      case 'FAIR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            {score} • Fair
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            {score} • High Risk
          </span>
        );
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">
            <XCircle className="w-3 h-3 text-rose-600" /> Declined
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-700">
            <Clock className="w-3 h-3 text-zinc-500" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Loan Officer Underwriting Console
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Strict persistence mode • Alternative credit telemetry evaluation & supervisory decisioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition shadow-xs disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-zinc-500" />
            <span>{isSeeding ? 'Seeding...' : 'Seed MongoDB Profiles'}</span>
          </button>

          <button
            onClick={() => navigate('/apply')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Persistence Notice: {errorMessage}</div>
            <div className="text-[11px] text-amber-800">
              Ephemeral in-memory storage has been removed. The backend strictly requires a live MongoDB connection.
              Check `MONGODB_URI` in `backend/.env` or ensure your Atlas IP Whitelist allows access.
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Evaluated Applicants</span>
            <Database className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {totalApps}
          </div>
          <span className="text-[11px] text-zinc-400">Strict MongoDB Collection</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Portfolio Trust Score</span>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {avgTrustScore}
            <span className="text-xs text-zinc-400 font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-zinc-400">Mean algorithmic rating</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {pendingCount}
          </div>
          <span className="text-[11px] text-zinc-400">Awaiting supervisory action</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>High Risk Flagged</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {highRiskCount}
          </div>
          <span className="text-[11px] text-zinc-400">Default probability &gt; 50%</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by borrower name or email..."
            className="w-full text-xs pl-8 pr-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg text-xs">
            {['ALL', 'PENDING', 'APPROVED', 'MANUAL_REVIEW', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-md font-medium transition ${
                  statusFilter === st
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'MANUAL_REVIEW' ? 'Review' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="recent">Newest Applications</option>
            <option value="score_desc">Highest Trust Score</option>
            <option value="score_asc">Lowest Trust Score</option>
          </select>
        </div>
      </div>

      {/* Main Applications Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">Fetching portfolio from MongoDB...</p>
          </div>
        ) : sortedApps.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">No Applications in Queue</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-0.5">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No records match active search parameters.'
                  : 'Get started by executing a new borrower intake or seed profiles into MongoDB.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Livelihood Type</th>
                  <th className="py-3 px-4">Requested Quantum</th>
                  <th className="py-3 px-4">AI Trust Score</th>
                  <th className="py-3 px-4">Default Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedApps.map((app) => {
                  const appId = app._id || app.id;
                  const snap = app.applicantSnapshot || {};
                  const ai = app.aiResults || {};
                  const trustScore = ai.trustScore ?? 0;
                  const tier = ai.creditTier ?? 'FAIR';
                  const prob = ai.defaultProbability ?? 0;

                  return (
                    <tr
                      key={appId}
                      onClick={() => navigate(`/applications/${appId}`)}
                      className="hover:bg-zinc-50 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900 group-hover:text-zinc-600 transition">
                          {snap.fullName || 'Anonymous Applicant'}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {snap.email || snap.phone}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-600 capitalize">
                        {(snap.employmentType || 'gig_worker').replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">
                        ${Number(snap.requestedLoanAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">{getTierBadge(tier, trustScore)}</td>

                      <td className="py-3 px-4 font-mono text-zinc-600">
                        {(prob * 100).toFixed(1)}%
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(app.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-zinc-900 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">
                          Underwrite <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
