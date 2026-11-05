import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from 'recharts';

/**
 * Custom Minimalist Tooltip for SHAP Feature Contributions
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.shapValue >= 0;

    return (
      <div className="bg-zinc-900 text-white p-3 rounded-lg shadow-lg text-xs border border-zinc-800 max-w-xs">
        <div className="font-semibold text-xs mb-1 text-zinc-100">{data.displayName}</div>
        <div className="text-zinc-300 mb-1 text-[11px]">
          Applicant Telemetry: <span className="font-mono text-white font-medium">{String(data.featureValue)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-zinc-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isPositive ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span className="font-medium text-[11px]">
            Score Impact: {isPositive ? '+' : ''}{data.shapValue.toFixed(2)} pts
          </span>
        </div>
        <div className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
          {data.description}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Recharts Bar Chart mapping SHAP feature attributions
 */
export default function ShapChart({ shapData = [] }) {
  if (!shapData || shapData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400 text-xs">
        No SHAP attribution telemetry available for this application.
      </div>
    );
  }

  const chartData = shapData.map((item) => ({
    feature: item.feature,
    displayName: item.displayName || item.feature,
    featureValue: item.featureValue,
    shapValue: Number(item.shapValue),
    impact: item.impact,
    description: item.description,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-zinc-100 gap-2">
        <div>
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Feature Attribution (SHAP Contributions)
          </h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Marginal point impact on AI Trust Score computed by TreeExplainer
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-xs bg-emerald-600"></span>
            Boosts Score
          </span>
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2 h-2 rounded-xs bg-rose-600"></span>
            Elevates Risk
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
            <XAxis
              type="number"
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}`}
              stroke="#e4e4e7"
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={150}
              tick={{ fontSize: 11, fill: '#27272a', fontWeight: 500 }}
              stroke="#e4e4e7"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(244, 244, 245, 0.6)' }} />
            <ReferenceLine x={0} stroke="#a1a1aa" strokeWidth={1} />
            <Bar dataKey="shapValue" radius={[2, 2, 2, 2]} barSize={18}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shapValue >= 0 ? '#059669' : '#e11d48'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-[11px] text-zinc-600">
        <span className="font-semibold text-zinc-800">Interpretation:</span>
        <span className="ml-1">
          Positive contributions (green, right) decrease default probability and elevate the score,
          whereas negative contributions (rose, left) penalize the credit trust baseline.
        </span>
      </div>
    </div>
  );
}
