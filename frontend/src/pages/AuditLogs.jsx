import React, { useEffect, useState } from 'react';
import { auditAPI } from '../services/api';
import { History, ShieldCheck, User } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await auditAPI.getLogs();
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 glass-card rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Immutable Compliance Audit Log</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tamper-evident system activity record tracking user logins, document uploads, data edits, approvals, and fraud alerts.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading Audit Trail...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User Persona</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details & Change Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4 text-slate-400 font-sans">{log.timestamp?.substring(0, 19).replace('T', ' ')}</td>
                    <td className="py-3.5 px-4 font-sans text-white font-bold">{log.user_name || 'SYSTEM'} ({log.role})</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-indigo-300">{log.action}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">{log.target_entity} #{log.entity_id}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xl truncate">{log.change_details}</td>
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

export default AuditLogs;
