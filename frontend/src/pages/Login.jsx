import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#0b1d2d] text-slate-100">
      <div className="flex min-h-screen w-full">
        <section className="relative hidden flex-1 overflow-hidden lg:flex lg:min-w-[58%] lg:max-w-[58%]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(21,101,110,0.28),_rgba(10,24,33,0.96)_60%)]" />
          <div className="absolute inset-0 opacity-80">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7ad8d1]/20" />
            <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7ad8d1]/16" />
            <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7ad8d1]/14" />
          </div>

          <div className="relative z-10 flex h-full w-full flex-col justify-between px-8 pb-8 pt-7">
            <div className="flex items-center gap-4 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9f7ec] text-[2rem] font-bold text-[#0f1f2b] shadow-lg shadow-[#7ad8d1]/20">
                F
              </div>
              <div className="text-2xl font-semibold tracking-tight">FraudLens AI</div>
            </div>

            <div className="mt-10 max-w-[620px]">
              <div className="mb-5 text-[12px] font-semibold uppercase tracking-[0.32em] text-[#7ad8d1]">
                Modern Financial Security
              </div>

              <h1 className="leading-[0.88] text-[4rem] font-black tracking-[-0.06em] text-white" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Every invoice,
                <span className="block text-[#7ad8d1]">intelligently cleared.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                Follow the signal from purchase order to approval with one calm, auditable workflow.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {['Purchase Order', 'Invoice', 'AI Matching', 'Fraud Detection', 'Approval'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="border border-[#9adfd9]/60 bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200">
                      {step}
                    </div>
                    {index < 4 && <div className="text-[#9adfd9]">→</div>}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-8 text-slate-200">
                <div>
                  <div className="text-3xl font-bold text-white">98.7%</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Accuracy</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">₹24.8L</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Fraud Prevented</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">1,842</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Invoices Processed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-[#f2f2f1] px-5 py-10 lg:w-[42%] lg:min-w-[360px]">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#d9f2ea] text-[2.1rem] font-bold text-[#1c3c3f] shadow-sm">
                F
              </div>
            </div>

            <div className="mb-8 text-center">
              <div className="text-[12px] font-semibold uppercase tracking-[0.38em] text-[#2b5351]">Secure Workspace Access</div>
              <h2 className="mt-6 text-5xl font-bold tracking-[-0.06em] text-[#1a1d1f]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Welcome back.
              </h2>
              <p className="mt-4 text-lg text-slate-600">Sign in to continue to FraudLens AI.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Email or employee ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-800 placeholder:text-slate-400 focus:border-[#2c8b84] focus:outline-none"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-base text-slate-800 placeholder:text-slate-400 focus:border-[#2c8b84] focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[#2c8b84]" />
                  Remember me
                </label>
                <button type="button" className="text-sm font-medium text-[#2c8b84] hover:text-[#1d4f4e]">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#111827] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? 'Signing in...' : 'Sign in to workspace'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Need a workspace?{' '}
              <Link to="/register" className="font-semibold text-[#2c8b84] hover:text-[#1d4f4e]">
                Create account
              </Link>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
