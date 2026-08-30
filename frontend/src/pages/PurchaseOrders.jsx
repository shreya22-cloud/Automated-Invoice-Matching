import React, { useEffect, useState } from 'react';
import { poAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileCheck2, Plus, Upload, Search, DollarSign } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const PurchaseOrders = () => {
  const { user } = useAuth();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  const [newPo, setNewPo] = useState({
    po_number: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    vendor_name: '',
    order_date: new Date().toISOString(),
    subtotal: 5000,
    tax_amount: 500,
    total_amount: 5500,
    items: [
      { item_description: 'Industrial Hardware Equipment', quantity: 2, unit_price: 2500, total_price: 5000 }
    ]
  });

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const res = await poAPI.getAll();
      setPos(res.data);
    } catch (err) {
      console.error("Failed to load POs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await poAPI.create(newPo);
      setShowModal(false);
      fetchPOs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create PO.');
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) return;
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      await poAPI.importCSV(formData);
      setCsvFile(null);
      fetchPOs();
      alert("CSV Purchase Orders imported successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || 'CSV Import failed.');
    }
  };

  const isAuditor = user?.role === 'AUDITOR';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Purchase Orders (PO) Database
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">Master Purchase Order commitments used by 3-way matching engine.</p>
        </div>

        {!isAuditor && (
          <div className="flex items-center space-x-3">
            <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import PO CSV</span>
              <input type="file" accept=".csv" onChange={(e) => { setCsvFile(e.target.files[0]); handleCSVUpload(); }} className="hidden" />
            </label>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Create New PO
            </button>
          </div>
        )}
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading Purchase Orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Line Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{po.po_number}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{po.vendor_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{po.order_date?.substring(0, 10)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${po.total_amount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{po.items?.length || 0} Items</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Create Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">PO Number</label>
                <input
                  type="text"
                  value={newPo.po_number}
                  onChange={(e) => setNewPo({ ...newPo, po_number: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={newPo.vendor_name}
                  onChange={(e) => setNewPo({ ...newPo, vendor_name: e.target.value })}
                  required
                  placeholder="e.g. Apex Tech Solutions"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Total Amount ($)</label>
                <input
                  type="number"
                  value={newPo.total_amount}
                  onChange={(e) => setNewPo({ ...newPo, total_amount: parseFloat(e.target.value) })}
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
