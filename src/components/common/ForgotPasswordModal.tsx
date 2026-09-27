import React, { useState } from 'react';
import { X, KeyRound, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { forgotPasswordApi } from '../../api';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email);
      setSuccessMsg(res.message || 'Password reset request recorded.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <KeyRound className="h-5 w-5 text-blue-700" />
            <h3 className="font-bold text-base">Account Recovery & Reset</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMsg ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Reset Request Dispatched</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto mb-4">
                {successMsg}
              </p>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-left text-xs text-slate-600 mb-5">
                <p className="font-semibold text-slate-800 mb-1">Institutional Helpdesk Contact:</p>
                <p>Thakur College of Engineering & Technology</p>
                <p>Computer Engineering Lab Admin: <span className="font-mono text-blue-700">admin@tcet.edu.in</span></p>
                <p>Location: CE Dept Lab 402, 4th Floor</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered TCET institutional email address. In accordance with departmental security policies, password resets can be processed directly by the laboratory administrator.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. student@tcet.edu.in"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs">
                <p className="font-semibold mb-0.5">Quick Evaluation Note:</p>
                <p className="text-[11px] text-amber-800 leading-normal">
                  Demo passwords for review are: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin123</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">faculty123</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">student123</code>.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
