import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { Building2, DollarSign, FileText } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const VendorAnalytics = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await analyticsAPI.getVendors();
      setVendors(res.data);
    } catch (err) {
      console.error("Failed to load vendor analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 glass-card rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Vendor Performance & Risk Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">Supplier billing volume, historical invoice count, and vendor risk tier assignments.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading Vendor Analytics...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Vendor Name</th>
                  <th className="py-3 px-4">Total Invoices</th>
                  <th className="py-3 px-4">Cumulative Billing Value</th>
                  <th className="py-3 px-4">Assigned Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vendors.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>{v.vendor_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{v.invoice_count} Invoices</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${v.total_amount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.risk_level} />
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

export default VendorAnalytics;
