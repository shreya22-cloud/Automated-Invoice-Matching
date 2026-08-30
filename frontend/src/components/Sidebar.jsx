import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  FileCheck2,
  FileText,
  History,
  LayoutDashboard,
  PackageCheck,
  ShieldAlert,
  Sliders,
  UploadCloud,
  UserCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Upload Invoice', path: '/upload', icon: UploadCloud },
    { label: 'Invoice Ledger', path: '/invoices', icon: FileText },
    { label: 'Exception Center', path: '/exceptions', icon: AlertTriangle, badge: 'Flagged' },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: FileCheck2 },
    { label: 'Goods Receipts (GRN)', path: '/grn', icon: PackageCheck },
    { label: 'Fraud Engine', path: '/fraud-center', icon: ShieldAlert },
    { label: 'Vendor Analytics', path: '/vendor-analytics', icon: Building2 },
    { label: 'Audit Trail', path: '/audit-logs', icon: History },
    { label: 'Matching Settings', path: '/settings', icon: Sliders },
    { label: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside className="min-h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-slate-200 bg-[#eaf1f4] p-4 text-slate-700 shadow-[inset_-1px_0_0_rgba(148,163,184,0.2)]">
      <div className="px-2 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Navigation Menu</p>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#d9e7f7] text-slate-900 shadow-sm ring-1 ring-indigo-200'
                    : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-slate-900' : 'text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="rounded-md bg-[#f45b5b] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
