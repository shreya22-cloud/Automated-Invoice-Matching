import React, { useEffect, useState } from 'react';
import { fraudAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldAlert, Cpu, BarChart2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const FraudCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [benfordStats, setBenfordStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      const [alertsRes, benfordRes] = await Promise.all([
        fraudAPI.getAlerts(),
        fraudAPI.getBenfordStats()
      ]);
      setAlerts(alertsRes.data);
      setBenfordStats(benfordRes.data);
    } catch (err) {
      console.error("Error loading fraud engine data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 glass-card rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Multi-Layer Fraud Detection Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">Scikit-learn Isolation Forest ML Model + Benford's Law First-Digit Statistical Analysis + Rule-Based Anomaly Scoring.</p>
          </div>
        </div>
      </div>

      {/* Benford's Law Statistical Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Benford's Law First-Digit Frequency Analysis
              </h3>
              <p className="text-xs text-slate-400">Expected logarithmic digit distribution vs actual invoice dataset frequencies</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              Statistical Compliance Check
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benfordStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="digit" stroke="#64748b" fontSize={11} label={{ value: 'First Digit (1-9)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="expected_pct" name="Benford Expected %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_pct" name="Actual Dataset %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Isolation Forest Info Box */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Isolation Forest Anomaly Model</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The Isolation Forest algorithm isolates anomalies by randomly selecting a feature and splitting value. 
            Anomalous billing patterns require fewer splits to isolate, yielding higher risk anomaly scores.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Contamination Ratio</span>
              <span className="font-bold text-white">15.0%</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Evaluated Features</span>
              <span className="font-bold text-indigo-300">Amount, Line Items, Subtotal Ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Risk Alerts Ledger Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Active Fraud Alerts & Explainable Summaries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">ML Isolation Forest</th>
                <th className="py-3 px-4">AI Explainable Narrative</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.map((al) => (
                <tr key={al.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3.5 px-4 font-bold text-white">#{al.invoice_id}</td>
                  <td className="py-3.5 px-4 font-extrabold text-rose-400">{al.risk_score}/100</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={al.risk_level} />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{al.isolation_forest_anomaly}</td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-md truncate">{al.explainable_summary}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/invoices/${al.invoice_id}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 font-bold transition-all inline-flex items-center gap-1"
                    >
                      Investigate <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FraudCenter;
