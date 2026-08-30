import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Loading FraudLens Analytics...</span>
        </div>
      </div>
    );
  }

  const { summary, status_distribution, risk_distribution, recent_invoices } = data || {};

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#3b82f6', HIGH: '#f59e0b', CRITICAL: '#f43f5e' };
  const currencyMeta = {
    USD: { symbol: '$', rate: 1 },
    INR: { symbol: '₹', rate: 83 },
    EUR: { symbol: '€', rate: 0.92 }
  };

  const formatCurrency = (value) => {
    const selected = currencyMeta[currency] || currencyMeta.USD;
    const converted = (Number(value || 0) * selected.rate).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${selected.symbol}${converted}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Accounts Payable & Fraud Intelligence Hub
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time 3-way matching status, automated OCR extraction, and AI risk analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs text-slate-200">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent font-bold text-white outline-none"
            >
              <option value="USD" className="bg-slate-900">USD</option>
              <option value="INR" className="bg-slate-900">INR</option>
              <option value="EUR" className="bg-slate-900">EUR</option>
            </select>
          </label>
          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Process New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <div className="p-5 glass-panel rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoices</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{summary?.total_invoices || 0}</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">processed</span>
          </div>
        </div>

        {/* Total Invoice Amount */}
        <div className="p-5 glass-panel rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{formatCurrency(summary?.total_invoice_amount || 0)}</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">{currency}</span>
          </div>
        </div>

        {/* High Risk Flagged */}
        <div className="p-5 glass-panel rounded-2xl border border-slate-800 relative overflow-hidden glow-rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk Invoices</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-rose-400">{summary?.high_risk_invoices || 0}</span>
            <span className="text-xs text-rose-400/80 ml-2 font-semibold">Requires Review</span>
          </div>
        </div>

        {/* 3-Way Match Success Rate */}
        <div className="p-5 glass-panel rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">3-Way Match Rate</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-400">{summary?.matching_success_rate || 100}%</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Status Pie Chart */}
        <div className="p-6 glass-card rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Invoice Processing Status Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {status_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Risk Level Bar Chart */}
        <div className="p-6 glass-card rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            AI Fraud Risk Level Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risk_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {risk_distribution?.map((entry, index) => (
                    <Cell key={`risk-${index}`} fill={RISK_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="p-6 glass-card rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Invoices & Fraud Alerts</h3>
            <p className="text-xs text-slate-400">Latest document uploads and automated risk evaluations</p>
          </div>
          <Link to="/invoices" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All Invoices <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Fraud Risk Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recent_invoices?.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 px-4 font-bold text-white">{inv.invoice_number}</td>
                  <td className="py-3 px-4 text-slate-300">{inv.vendor_name}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">${inv.total_amount?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${inv.risk_score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {inv.risk_score}/100
                      </span>
                      <StatusBadge status={inv.risk_level} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 font-bold transition-all inline-flex items-center gap-1"
                    >
                      Investigate <ArrowUpRight className="w-3 h-3" />
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

export default Dashboard;
