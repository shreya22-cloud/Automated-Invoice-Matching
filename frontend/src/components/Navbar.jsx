import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, ChevronDown, Bell, Search, RefreshCw } from 'lucide-react';
import { seedAPI } from '../services/api';

export const Navbar = () => {
  const { user, logout, switchRoleDemo } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleReseed = async () => {
    setSeeding(true);
    try {
      await seedAPI.triggerSeed();
      window.location.reload();
    } catch (e) {
      console.error("Reseed error:", e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-[#f5f8fb] sticky top-0 z-40 px-6 flex items-center justify-between shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      {/* Brand & Search */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#eff5fb] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
              FraudLens <span className="text-emerald-500 font-bold">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">AP AUTOMATION & FRAUD SHIELD</p>
          </div>
        </div>

        <div className="hidden md:flex items-center relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3" />
          <input
            type="text"
            placeholder="Search invoices, POs, vendors..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleReseed}
          disabled={seeding}
          title="Reset / Seed Demo Financial Dataset"
          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>

        <button className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.full_name || 'Guest User'}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{user?.role || 'AP_ANALYST'}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Switch Persona Demo</p>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => { switchRoleDemo('admin@fraudlens.ai'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${user?.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>System Admin</span>
                  {user?.role === 'ADMIN' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => { switchRoleDemo('analyst@fraudlens.ai'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${user?.role === 'AP_ANALYST' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>AP Analyst</span>
                  {user?.role === 'AP_ANALYST' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => { switchRoleDemo('auditor@fraudlens.ai'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${user?.role === 'AUDITOR' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>Financial Auditor</span>
                  {user?.role === 'AUDITOR' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              </div>

              <div className="pt-1 border-t border-slate-200">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-all font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
