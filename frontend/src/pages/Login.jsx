import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export default function Login({ initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('applicant');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login, register, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Full name is required.');
        const user = await register(name, email, password, role);
        navigate(user.role === 'loan_officer' ? '/dashboard' : '/portal');
      } else {
        const user = await login(email, password);
        const destination = from || (user.role === 'loan_officer' ? '/dashboard' : '/portal');
        navigate(destination);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Quick Demo Login Handlers
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);
    setSubmitting(true);
    setIsRegister(false);

    try {
      const user = await login(demoEmail, demoPassword);
      navigate(user.role === 'loan_officer' ? '/dashboard' : '/portal');
    } catch (err) {
      setErrorMessage(
        err.message.includes('503') || err.message.includes('Database Service Unavailable')
          ? 'MongoDB is currently offline. To connect live, whitelist your IP in Atlas or start local MongoDB.'
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-zinc-800 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            CredAlt
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-zinc-200 bg-white text-zinc-600">
            v2.0 Hardened
          </span>
        </div>
        <h2 className="text-center text-sm text-zinc-500 font-normal">
          Alternative Credit Intelligence & Autonomous Underwriting
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-zinc-200 sm:rounded-xl sm:px-10 space-y-6">
          {/* Auth Tab Switcher */}
          <div className="flex rounded-lg bg-zinc-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition ${
                !isRegister
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition ${
                isRegister
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {(errorMessage || authError) && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {errorMessage || authError}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sarah Jenkins"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('applicant')}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      role === 'applicant'
                        ? 'border-zinc-900 bg-zinc-50 font-semibold text-zinc-900'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 mb-1 text-zinc-700" />
                    <div>Applicant</div>
                    <div className="text-[10px] text-zinc-400 font-normal">Borrower Portal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('loan_officer')}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      role === 'loan_officer'
                        ? 'border-zinc-900 bg-zinc-50 font-semibold text-zinc-900'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 mb-1 text-zinc-700" />
                    <div>Loan Officer</div>
                    <div className="text-[10px] text-zinc-400 font-normal">Underwriter Console</div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50 shadow-xs"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Credentials */}
          <div className="pt-4 border-t border-zinc-100 space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block text-center">
              1-Click Demo Credentials
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('officer@credalt.io', 'Password123!')}
                className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-900 text-left transition bg-zinc-50/50 hover:bg-white text-xs group"
              >
                <div className="font-semibold text-zinc-900 flex items-center justify-between">
                  <span>Loan Officer</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Demo</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono truncate">officer@credalt.io</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('borrower@credalt.io', 'Password123!')}
                className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-900 text-left transition bg-zinc-50/50 hover:bg-white text-xs group"
              >
                <div className="font-semibold text-zinc-900 flex items-center justify-between">
                  <span>Borrower / Applicant</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Demo</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono truncate">borrower@credalt.io</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

