import React, { useEffect, useState } from 'react';
import { invoiceAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowUpRight, Search, FileText } from 'lucide-react';

export const ExceptionCenter = () => {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      const res = await invoiceAPI.getAll();
      const flagged = res.data.filter(inv => 
        ['EXCEPTION', 'PENDING_REVIEW', 'REJECTED'].includes(inv.status) || 
        ['WARNING', 'ERROR'].includes(inv.validation_status)
      );
      setExceptions(flagged);
    } catch (err) {
      console.error("Failed to load exceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-rose-500/30 glow-rose">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Exception & Fraud Triage Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">High-risk invoices, quantity mismatches, price inflation alerts, and duplicate submissions requiring human review.</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-xs">
          {exceptions.length} Items Requiring Human Review
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading Exception Workbench...</div>
        ) : exceptions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">No active exception flags. All processed invoices are clean!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Validation Issue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exceptions.map((inv) => (
                  <tr key={inv.id} className="hover:bg-rose-500/5 transition-all">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>{inv.invoice_number}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{inv.vendor_name}</td>
                    <td className="py-3.5 px-4 text-indigo-300 font-mono">{inv.po_number || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400">${inv.total_amount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.validation_status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold transition-all inline-flex items-center gap-1 border border-rose-500/30"
                      >
                        Triage & Review <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionCenter;
