import React from 'react';

/**
 * Circular SVG Progress Indicator for AI Trust Score (0-100)
 * Designed to a clean, minimalist Zinc palette without oversized neon glow
 */
export default function ScoreGauge({ score = 0, tier = 'FAIR', size = 200 }) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#10b981'; // Emerald
  let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (normalizedScore >= 80) {
    strokeColor = '#059669'; // Emerald
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (normalizedScore >= 65) {
    strokeColor = '#4f46e5'; // Indigo
    badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (normalizedScore >= 50) {
    strokeColor = '#d97706'; // Amber
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  } else {
    strokeColor = '#e11d48'; // Rose
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-zinc-200 shadow-xs relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center transition-all duration-700 ease-out"
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f4f4f5"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Value Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Trust Score
          </span>
          <div className="flex items-baseline mt-0.5">
            <span className="text-4xl font-extrabold text-zinc-900 tracking-tight font-sans">
              {normalizedScore}
            </span>
            <span className="text-xs font-medium text-zinc-400 ml-0.5">/100</span>
          </div>
          <span
            className={`mt-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded border ${badgeStyle} tracking-wide`}
          >
            {tier}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between w-full max-w-[180px] text-[10px] text-zinc-400 px-1 border-t border-zinc-100 pt-2.5">
        <span>0 Risk</span>
        <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
        <span>50 Fair</span>
        <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
        <span>100 Prime</span>
      </div>
    </div>
  );
}
