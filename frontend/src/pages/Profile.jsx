import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, ShieldCheck, Mail, Calendar, Key, PencilLine, Save, X, Bell, Briefcase, Building2 } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Profile = () => {
  const { user, switchRoleDemo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user?.full_name || 'Michael Chen',
    email: user?.email || 'analyst@fraudlens.ai',
    role: user?.role || 'AP_ANALYST',
    team: 'Accounts Payable',
    timezone: 'UTC+8',
    notifications: true,
  });

  const initials = useMemo(() => {
    return (profile.full_name || 'User')
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [profile.full_name]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile({
      full_name: user?.full_name || 'Michael Chen',
      email: user?.email || 'analyst@fraudlens.ai',
      role: user?.role || 'AP_ANALYST',
      team: 'Accounts Payable',
      timezone: 'UTC+8',
      notifications: true,
    });
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div className="glass-card rounded-3xl border border-slate-200 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-100 text-xl font-extrabold text-indigo-700">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{profile.full_name}</h2>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-xs text-slate-500">{profile.email}</span>
                <StatusBadge status={profile.role} />
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <PencilLine className="h-4 w-4" />
            {isEditing ? 'Editing' : 'Edit profile'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-card rounded-3xl border border-slate-200 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Account profile</h3>
            {isEditing && (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">
                  <Save className="h-3.5 w-3.5" /> Save changes
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Full name</label>
                <input
                  value={profile.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Email</label>
                <input
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Role</label>
                <select
                  value={profile.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="AP_ANALYST">AP Analyst</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Team</label>
                <input
                  value={profile.team}
                  onChange={(e) => handleChange('team', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Timezone</label>
                <input
                  value={profile.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Security</label>
                <div className="flex h-[46px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <Key className="h-4 w-4 text-indigo-600" /> Password
                  </span>
                  <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-slate-200 p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Quick facts</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
                <span className="text-slate-500 flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-600" /> Email</span>
                <span className="font-semibold text-slate-800">{profile.email}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
                <span className="text-slate-500 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Access</span>
                <span className="font-semibold text-slate-800">{profile.role}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
                <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-600" /> Active since</span>
                <span className="font-semibold text-slate-800">August 2026</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-slate-200 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Preferences</h3>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
              <span className="text-slate-700 flex items-center gap-2"><Bell className="h-4 w-4 text-indigo-600" /> Email notifications</span>
              <button
                onClick={() => handleChange('notifications', !profile.notifications)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${profile.notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                aria-label="Toggle notifications"
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white transition ${profile.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-slate-200 p-6">
            <h3 className="mb-3 text-lg font-bold text-slate-900">Persona switch</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => switchRoleDemo('admin@fraudlens.ai')}
                className={`rounded-xl border px-2 py-2 text-[10px] font-bold transition ${profile.role === 'ADMIN' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Admin
              </button>
              <button
                onClick={() => switchRoleDemo('analyst@fraudlens.ai')}
                className={`rounded-xl border px-2 py-2 text-[10px] font-bold transition ${profile.role === 'AP_ANALYST' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Analyst
              </button>
              <button
                onClick={() => switchRoleDemo('auditor@fraudlens.ai')}
                className={`rounded-xl border px-2 py-2 text-[10px] font-bold transition ${profile.role === 'AUDITOR' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Auditor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
