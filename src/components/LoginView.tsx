import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordModal } from './common/ForgotPasswordModal';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginViewProps {
  onSuccessRole?: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessRole }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (onSuccessRole) {
        onSuccessRole(user.role);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid institutional credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (role: 'student' | 'faculty' | 'admin') => {
    setError(null);
    if (role === 'student') {
      setEmail('aarav.mehta@tcet.edu.in');
      setPassword('student123');
    } else if (role === 'faculty') {
      setEmail('priya.kulkarni@tcet.edu.in');
      setPassword('faculty123');
    } else if (role === 'admin') {
      setEmail('admin@tcet.edu.in');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Background subtle watermark texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="h-14 w-14 bg-blue-700 rounded-xl flex items-center justify-center mx-auto shadow-md border border-blue-500/30 mb-3">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            TCET Practical Lab
          </h1>
          <p className="mt-1 text-xs text-blue-300 font-medium tracking-wide">
            Digital Practical Evaluation Platform
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Thakur College of Engineering & Technology • Autonomous
          </p>
        </div>

        {/* Central unified card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-9 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold block">Authentication Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. student@tcet.edu.in or username"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 placeholder:text-slate-400"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 placeholder:text-slate-400"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
              id="login-submit-button"
            >
              {submitting ? 'Verifying Credentials...' : 'Login'}
              {!submitting && <ArrowRight className="h-3.5 w-3.5" />}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline focus:outline-none"
                id="forgot-password-link"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Quick evaluation shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Demo Accounts
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('student')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/50 transition-colors group"
                id="demo-student-fill"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-blue-700">
                  <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  Student
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Aarav (Roll 42)</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('faculty')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors group"
                id="demo-faculty-fill"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Faculty
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Dr. Priya</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:border-purple-400 hover:bg-purple-50/50 transition-colors group"
                id="demo-admin-fill"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-purple-700">
                  <ShieldAlert className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  Admin
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Sys Admin</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Encrypted with bcrypt &bull; Rate-limited login protection active</span>
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};
