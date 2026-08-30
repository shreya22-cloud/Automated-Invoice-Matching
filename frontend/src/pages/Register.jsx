import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, ArrowRight, CheckCircle2, Briefcase, Building2 } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'AP_ANALYST'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f4] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div className="grid lg:grid-cols-[1.1fr_1.3fr]">
          <div className="relative hidden lg:block bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.18),_rgba(15,23,42,0.98)_55%)] p-10 text-white">
            <div className="absolute inset-0 opacity-80">
              <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9f2ea] text-2xl font-bold text-[#0f1f2b]">
                  F
                </div>
                <div>
                  <div className="text-2xl font-semibold">FraudLens AI</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-300">Smart AP controls</div>
                </div>
              </div>

              <div>
                <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-300">Create access</div>
                <h1 className="text-5xl font-black leading-none tracking-[-0.06em]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                  Secure your
                  <span className="mt-2 block text-emerald-300">finance ops.</span>
                </h1>
                <p className="mt-4 max-w-sm text-base text-slate-300">
                  Manage approvals, reduce fraud exposure, and keep every invoice audit-ready from day one.
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-200">
                {[
                  'Invoice ingestion with OCR and validation',
                  'AI-powered fraud detection and risk scoring',
                  'Role-based approval and audit visibility'
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 flex justify-center lg:justify-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff3ed] text-2xl font-bold text-[#1c3c3f]">
                  F
                </div>
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Join the platform</div>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-slate-900">Create your account</h2>
              <p className="mt-2 text-sm text-slate-600">Set up your workspace to manage AP, risk, and fraud workflows with confidence.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2c8b84] focus:outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Work email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2c8b84] focus:outline-none"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2c8b84] focus:outline-none"
                    placeholder="Create a secure password"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-10 text-sm text-slate-800 focus:border-[#2c8b84] focus:outline-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="AP_ANALYST">AP Analyst</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                  <Building2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#111827] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? 'Creating account...' : 'Create account'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
              <span>Already have an account?</span>
              <Link to="/login" className="font-semibold text-[#2c8b84] hover:text-[#1d4f4e]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
