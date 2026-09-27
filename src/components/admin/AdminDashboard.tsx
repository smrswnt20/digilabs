import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { AdminDashboardStats, AuditLog } from '../../types';
import { getAdminDashboardApi, getAdminAuditLogsApi } from '../../api';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        getAdminDashboardApi(),
        getAdminAuditLogsApi()
      ]);
      setStats(statsRes.stats);
      setRecentLogs(logsRes.logs.slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60">
              Administrative Control Center
            </span>
            <span className="text-slate-400 text-xs">• Department of Computer Engineering</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">System & Security Operations</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Central management portal for role assignments, user access authorization, courses, practicals, and institutional audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('users')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('users')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalUsers ?? '...'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{stats?.activeUsers ?? 0} active</span>
            <span>•</span>
            <span className="text-slate-400">{stats?.totalStudents ?? 0} students</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('courses_batches')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Faculty & Labs</span>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalFaculty ?? '...'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{stats?.totalPracticals ?? 10} practicals</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">3 active batches</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Evaluations</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.evaluatedSubmissions ?? '...'}/{stats?.totalSubmissions ?? '...'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span className="text-amber-600 font-medium">{stats?.pendingEvaluations ?? 0} pending review</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('system_health')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">System Security</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>Operational</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Uptime: {stats ? formatUptime(stats.systemUptime) : '...'}</span>
          </div>
        </div>
      </div>

      {/* Role Distribution & System Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Roles Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Role-Based Access Breakdown</h3>
            <span className="text-[11px] text-slate-400 font-mono">RBAC</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Students</div>
                  <div className="text-[10px] text-slate-500">SE Computer Engineering</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900">{stats?.totalStudents ?? 0}</span>
                <span className="block text-[10px] text-emerald-600 font-medium">Access: /student/*</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  F
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Faculty</div>
                  <div className="text-[10px] text-slate-500">Professors & Instructors</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900">{stats?.totalFaculty ?? 0}</span>
                <span className="block text-[10px] text-blue-600 font-medium">Access: /faculty/*</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Administrators</div>
                  <div className="text-[10px] text-slate-500">System Management</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900">{stats?.totalAdmins ?? 0}</span>
                <span className="block text-[10px] text-purple-600 font-medium">Access: /admin/*</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Security Enforcement:</span>
            <span className="font-semibold text-slate-800">Strict Server-side RBAC</span>
          </div>
        </div>

        {/* Recent Audit Trail */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Real-Time Audit Activity</h3>
                <p className="text-[11px] text-slate-500">Live security and academic event logging</p>
              </div>
              <button
                onClick={() => onNavigateTab('audit_logs')}
                className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
              >
                <span>View Full Log</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No recorded audit events yet.
                </div>
              ) : (
                recentLogs.map(log => (
                  <div 
                    key={log.id} 
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between text-xs"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500' :
                        log.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-[11px]">{log.action}</span>
                          <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-200 text-slate-700">
                            {log.userRole}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap pl-2 text-right">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Audit retention policy: 1,000 security entries stored</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tamper-evident
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
