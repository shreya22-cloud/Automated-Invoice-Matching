import React from 'react';

export const RiskScoreGauge = ({ score = 0, level = 'LOW' }) => {
  const getScoreColor = (s) => {
    if (s <= 20) return { stroke: '#10b981', bg: 'text-emerald-400', label: 'Low Risk 🟢' };
    if (s <= 50) return { stroke: '#3b82f6', bg: 'text-blue-400', label: 'Medium Risk 🟡' };
    if (s <= 75) return { stroke: '#f59e0b', bg: 'text-amber-400', label: 'High Risk 🟠' };
    return { stroke: '#f43f5e', bg: 'text-rose-400', label: 'Critical Risk 🔴' };
  };

  const info = getScoreColor(score);
  const strokeDashoffset = 283 - (283 * Math.min(score, 100)) / 100;

  return (
    <div className="flex flex-col items-center justify-center p-4 glass-panel rounded-2xl">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#1e293b"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={info.stroke}
            strokeWidth="10"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{Math.round(score)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">out of 100</span>
        </div>
      </div>
      <div className={`mt-3 font-semibold text-sm ${info.bg}`}>
        {info.label}
      </div>
    </div>
  );
};

export default RiskScoreGauge;
