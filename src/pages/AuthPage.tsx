import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthPageProps {
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onShowToast }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@elevatecrm.io');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<UserRole>('salesperson');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onShowToast('success', 'Logged in successfully. Welcome back!');
      } else if (mode === 'register') {
        await register({ name, email, password, role, phone });
        onShowToast('success', 'Account registered and authenticated.');
      } else {
        onShowToast('info', 'Password reset instructions dispatched to your email.');
        setMode('login');
      }
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (targetRole: UserRole) => {
    setIsSubmitting(true);
    try {
      await switchDemoRole(targetRole);
      onShowToast('success', `Signed in as ${targetRole.replace('_', ' ').toUpperCase()} demo account.`);
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-md">
          <Layers className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">ElevateAI CRM SaaS</h2>
        <p className="text-xs text-slate-400">
          Autonomous Lead Qualification & Engineering Pipeline for Vertical Systems
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-xl space-y-6">
          {/* Mode Switcher */}
          <div className="flex border-b border-slate-800 pb-3 justify-center gap-6 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setEmail('admin@elevatecrm.io');
                setPassword('Password123!');
              }}
              className={`pb-1 transition-colors ${
                mode === 'login' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`pb-1 transition-colors ${
                mode === 'register' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Team Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-200 focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Corporate Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elevatecrm.io"
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-200 font-mono focus:outline-hidden focus:border-amber-500/60"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-200 font-mono focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="salesperson">Salesperson</option>
                    <option value="sales_manager">Sales Manager</option>
                    <option value="admin">Administrator</option>
                    <option value="support">Support Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>
                {isSubmitting
                  ? 'Verifying...'
                  : mode === 'login'
                  ? 'Access ElevateAI Workspace'
                  : mode === 'register'
                  ? 'Create Corporate Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick 1-Click Role Login
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-left transition-colors"
              >
                <div className="font-semibold">Elena Vance</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: Admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sales_manager')}
                className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-left transition-colors"
              >
                <div className="font-semibold">Marcus Chen</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: Sales Manager</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('salesperson')}
                className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-left transition-colors"
              >
                <div className="font-semibold">David Miller</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: Salesperson</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('support')}
                className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-left transition-colors"
              >
                <div className="font-semibold">Sarah Jenkins</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: Support</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
