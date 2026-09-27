import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  User, 
  AlertTriangle,
  Download
} from 'lucide-react';
import { AuditLog } from '../../types';
import { getAdminAuditLogsApi } from '../../api';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogsApi({
        action: actionFilter,
        role: roleFilter,
        search: searchQuery
      });
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, roleFilter, searchQuery]);

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `tcet_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & Security Audit Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of logins, authorization evaluations, practical submissions, and administrator actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportLogsAsJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Log Archive</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, IP, or details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="PASSWORD_RESET">PASSWORD_RESET</option>
              <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_STATUS_TOGGLED">USER_STATUS_TOGGLED</option>
              <option value="SUBMISSION_CREATED">SUBMISSION_CREATED</option>
              <option value="SUBMISSION_EVALUATED">SUBMISSION_EVALUATED</option>
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="student">Student Events</option>
              <option value="faculty">Faculty Events</option>
              <option value="admin">Administrator Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-5 py-3 text-left">Timestamp</th>
                <th scope="col" className="px-4 py-3 text-left">Action</th>
                <th scope="col" className="px-4 py-3 text-left">User / Principal</th>
                <th scope="col" className="px-5 py-3 text-left">Event Details</th>
                <th scope="col" className="px-4 py-3 text-left">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                      <span>Loading audit entries...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No audit records match the selected query.
                  </td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(l.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        l.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        l.status === 'WARNING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          l.status === 'SUCCESS' ? 'bg-emerald-500' :
                          l.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {l.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{l.userName}</span>
                        <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {l.userRole}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-700 max-w-md">
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {l.details}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {l.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
