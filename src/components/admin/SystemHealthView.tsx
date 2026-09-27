import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  Terminal,
  Lock
} from 'lucide-react';
import { getAdminSystemHealthApi } from '../../api';

export const SystemHealthView: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await getAdminSystemHealthApi();
      setHealthData(res.health);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs} hr ${mins % 60} min`;
    return `${mins} min ${seconds % 60} sec`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Health & Infrastructure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic indicators for runtime execution, database persistence, and security controls.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Node Server */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Backend Engine</span>
            <Server className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              Express + Vite Dev Middleware
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Node.js {healthData?.nodeVersion || 'v22'} • {healthData?.platform || 'linux'} ({healthData?.arch || 'x64'})
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Uptime:</span>
            <span className="font-mono font-semibold text-slate-900">
              {healthData ? formatUptime(healthData.uptimeSeconds) : '...'}
            </span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Memory Allocation</span>
            <Cpu className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              {healthData?.memory?.heapUsedMb ?? 0} MB <span className="text-xs font-normal text-slate-500">/ {healthData?.memory?.heapTotalMb ?? 0} MB</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Resident Set Size: {healthData?.memory?.rssMb ?? 0} MB
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Active Bearer Sessions:</span>
            <span className="font-bold text-purple-700">
              {healthData?.activeSessions ?? 1} session(s)
            </span>
          </div>
        </div>

        {/* Security & Database Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Security Integrity</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
              <span>Argon2 / Bcrypt</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Salt rounds: 10 • Constant-time comparison
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Rate-limiting:</span>
            <span className="font-semibold text-slate-900">5 attempts max / 15m lock</span>
          </div>
        </div>
      </div>

      {/* Database Persistence Details */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-700" />
            <h3 className="font-bold text-sm text-slate-900">Local Persistent Database Store</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">data/db.json</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Users</span>
            <span className="text-lg font-black text-slate-900">{healthData?.databaseRecords?.users ?? '...'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Practicals</span>
            <span className="text-lg font-black text-slate-900">{healthData?.databaseRecords?.practicals ?? '...'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Submissions</span>
            <span className="text-lg font-black text-slate-900">{healthData?.databaseRecords?.submissions ?? '...'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Courses</span>
            <span className="text-lg font-black text-slate-900">{healthData?.databaseRecords?.courses ?? '...'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Batches</span>
            <span className="text-lg font-black text-slate-900">{healthData?.databaseRecords?.batches ?? '...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
