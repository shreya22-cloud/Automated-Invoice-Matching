import React, { useEffect, useState } from 'react';
import { invoiceAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, ArrowUpRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceAPI.getAll({ status: statusFilter || undefined });
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
    (inv.po_number && inv.po_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white">Invoice Ledger & Master Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Complete historical record of processed supplier invoices, 3-way matches, and fraud evaluations.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by invoice # or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all w-60"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="MATCHED">Matched</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="EXCEPTION">Exception</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading Invoice Records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Validation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>{inv.invoice_number}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{inv.vendor_name}</td>
                    <td className="py-3.5 px-4 text-indigo-300 font-mono">{inv.po_number || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${inv.total_amount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.validation_status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-bold transition-all inline-flex items-center gap-1"
                      >
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
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

export default InvoiceList;
