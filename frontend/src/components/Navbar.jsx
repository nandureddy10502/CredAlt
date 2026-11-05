import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  LayoutDashboard,
  UserPlus,
  Cpu,
  LogOut,
  User,
  Shield,
  FileText,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isOfficer, isApplicant, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Derive initials from name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs group-hover:bg-zinc-800 transition">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-zinc-900">
                  CredAlt
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded border border-zinc-200 bg-zinc-50 text-zinc-600 font-mono">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block -mt-0.5">
                Alternative Underwriter
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-lg text-xs font-medium">
            {isOfficer && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  isActive('/dashboard')
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Underwriting Console</span>
              </Link>
            )}

            {isApplicant && (
              <Link
                to="/portal"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  isActive('/portal')
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>My Credit Portal</span>
              </Link>
            )}

            <Link
              to="/apply"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                isActive('/apply')
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isOfficer ? 'New Intake' : 'Apply for Loan'}</span>
            </Link>

            <Link
              to="/model"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                isActive('/model')
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Model Specs</span>
            </Link>
          </nav>
        )}

        {/* User Account Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-zinc-900 leading-tight">
                    {user?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isOfficer ? 'bg-indigo-600' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {isOfficer ? 'Loan Officer' : 'Applicant'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 font-medium transition shadow-xs"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
