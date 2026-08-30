import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = (str) => {
    switch (str?.toUpperCase()) {
      case 'APPROVED':
      case 'EXACT_MATCH':
      case 'VALID':
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      
      case 'MATCHED':
      case 'ACCEPTABLE_VARIANCE':
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';

      case 'PENDING_REVIEW':
      case 'EXTRACTED':
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';

      case 'EXCEPTION':
      case 'HIGH':
      case 'CRITICAL':
      case 'ERROR':
      case 'REJECTED':
      case 'NO_MATCH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';

      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(status)} transition-all duration-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {status?.replace('_', ' ') || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
