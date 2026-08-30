import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sliders, Save, ShieldAlert } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState({
    amount_tolerance_pct: 0.5,
    quantity_tolerance_units: 1.0,
    fuzzy_similarity_threshold_pct: 80.0
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getSettings();
      setThresholds({
        amount_tolerance_pct: res.data.amount_tolerance_pct,
        quantity_tolerance_units: res.data.quantity_tolerance_units,
        fuzzy_similarity_threshold_pct: res.data.fuzzy_similarity_threshold_pct
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') {
      alert('Only Admins can modify system thresholds.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await settingsAPI.updateThresholds(thresholds);
      setMessage('Matching tolerance thresholds updated successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="p-6 glass-card rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Sliders className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">3-Way Matching Threshold Configuration</h2>
            <p className="text-xs text-slate-400 mt-0.5">Admin controls to configure financial variance tolerances and fuzzy text comparison thresholds.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            {message}
          </div>
        )}

        {!isAdmin && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Read-Only View. Switch to <strong>Admin Persona</strong> in the top navbar to modify thresholds.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Total Amount Tolerance Window (%)</label>
            <p className="text-slate-500 mb-2">Acceptable percentage difference between Invoice total and Purchase Order expected total.</p>
            <input
              type="number"
              step="0.1"
              disabled={!isAdmin}
              value={thresholds.amount_tolerance_pct}
              onChange={(e) => setThresholds({ ...thresholds, amount_tolerance_pct: parseFloat(e.target.value) })}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Quantity Tolerance Window (Units)</label>
            <p className="text-slate-500 mb-2">Acceptable unit variance between Invoice quantity and Goods Receipt Note (GRN) received quantity.</p>
            <input
              type="number"
              step="0.5"
              disabled={!isAdmin}
              value={thresholds.quantity_tolerance_units}
              onChange={(e) => setThresholds({ ...thresholds, quantity_tolerance_units: parseFloat(e.target.value) })}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Fuzzy String Match Similarity Threshold (%)</label>
            <p className="text-slate-500 mb-2">Minimum Levenshtein similarity score for matching vendor names and item descriptions.</p>
            <input
              type="number"
              disabled={!isAdmin}
              value={thresholds.fuzzy_similarity_threshold_pct}
              onChange={(e) => setThresholds({ ...thresholds, fuzzy_similarity_threshold_pct: parseFloat(e.target.value) })}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold disabled:opacity-50"
            />
          </div>

          {isAdmin && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Save Configuration'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
