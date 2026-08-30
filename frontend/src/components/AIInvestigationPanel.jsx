import React from 'react';
import { Bot, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, FileSearch } from 'lucide-react';

export const AIInvestigationPanel = ({ invoice, fraudAlert, matchingResult }) => {
  const summaryText = fraudAlert?.explainable_summary || "Analysis in progress...";
  const riskLevel = fraudAlert?.risk_level || "LOW";
  let rules = [];
  if (fraudAlert?.rules_triggered) {
    if (typeof fraudAlert.rules_triggered === 'object') {
      rules = fraudAlert.rules_triggered;
    } else {
      try {
        rules = JSON.parse(fraudAlert.rules_triggered);
      } catch (e) {
        rules = [{ rule: 'RISK_ALERT', description: String(fraudAlert.rules_triggered) }];
      }
    }
  }

  const isHighRisk = ['HIGH', 'CRITICAL'].includes(riskLevel);

  return (
    <div className={`p-6 rounded-2xl glass-card border transition-all duration-300 ${
      isHighRisk ? 'border-rose-500/30 glow-rose' : 'border-indigo-500/30 glow-indigo'
    }`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isHighRisk ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI Financial Investigation Assistant
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FraudLens GPT
              </span>
            </h3>
            <p className="text-xs text-slate-400">Automated Audit & Fraud Narrative Synthesizer</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200">
          <div className="flex items-start gap-2.5">
            <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="whitespace-pre-line font-medium text-slate-300">
              {summaryText}
            </div>
          </div>
        </div>

        {rules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-amber-400" />
              Detected Risk Factors ({rules.length})
            </h4>
            <div className="space-y-2">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">{rule.rule.replace(/_/g, ' ')}</span>
                    <p className="text-slate-300 mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInvestigationPanel;
