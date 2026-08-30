import React, { useEffect, useState } from 'react';
import { grnAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PackageCheck, Plus, Search } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const GRNManagement = () => {
  const { user } = useAuth();
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newGrn, setNewGrn] = useState({
    grn_number: `GRN-${Math.floor(8000 + Math.random() * 1000)}`,
    po_number: 'PO-5001',
    vendor_name: 'Apex Tech Solutions',
    receipt_date: new Date().toISOString(),
    warehouse_location: 'Main Logistics Dock A',
    received_by: 'Logistics Supervisor',
    items: [
      { item_description: 'Enterprise Laptop Workstations', quantity_received: 2.0, quantity_accepted: 2.0, quantity_rejected: 0.0 }
    ]
  });

  useEffect(() => {
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      const res = await grnAPI.getAll();
      setGrns(res.data);
    } catch (err) {
      console.error("Failed to load GRNs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    try {
      await grnAPI.create(newGrn);
      setShowModal(false);
      fetchGRNs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create GRN.');
    }
  };

  const isAuditor = user?.role === 'AUDITOR';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Goods Receipt Notes (GRN) Registry
            <PackageCheck className="w-5 h-5 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">Verified physical warehouse receiving reports used for 3-way quantity matching.</p>
        </div>

        {!isAuditor && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Create GRN Receipt
          </button>
        )}
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading Goods Receipt Notes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">GRN Number</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Receipt Date</th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th className="py-3 px-4">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {grns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{g.grn_number}</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-300">{g.po_number}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{g.vendor_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{g.receipt_date?.substring(0, 10)}</td>
                    <td className="py-3.5 px-4 text-slate-300">{g.warehouse_location || 'Main Dock'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{g.received_by || 'Officer'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create GRN Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Create Goods Receipt Note</h3>
            <form onSubmit={handleCreateGRN} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">GRN Number</label>
                <input
                  type="text"
                  value={newGrn.grn_number}
                  onChange={(e) => setNewGrn({ ...newGrn, grn_number: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Associated PO Number</label>
                <input
                  type="text"
                  value={newGrn.po_number}
                  onChange={(e) => setNewGrn({ ...newGrn, po_number: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={newGrn.vendor_name}
                  onChange={(e) => setNewGrn({ ...newGrn, vendor_name: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  Save GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNManagement;
