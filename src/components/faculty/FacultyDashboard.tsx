import React from 'react';
import { FacultyDashboardStats } from '../../types';
import { 
  Users, 
  FileCode, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Download, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { downloadCsvReport } from '../../api';

interface FacultyDashboardProps {
  stats: FacultyDashboardStats | null;
  onSelectPracticalSubmissions: (practicalId?: number) => void;
  onOpenReports: () => void;
  onOpenPracticalEditor: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  stats,
  onSelectPracticalSubmissions,
  onOpenReports,
  onOpenPracticalEditor
}) => {
  if (!stats) return <div className="p-8 text-center text-slate-500">Loading faculty dashboard statistics...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="faculty-dashboard">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Department of Computer Engineering
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              Course: Data Structures (CSC301)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Assessment Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Evaluate student practical submissions, review automated test results, override marks, and export lab records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPracticalEditor}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50 transition-colors"
            id="manage-practicals-btn"
          >
            Manage Practicals & Tests
          </button>
          <button
            onClick={() => downloadCsvReport()}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            id="export-csv-top-btn"
          >
            <Download className="h-4 w-4" />
            Export CSV Gradebook
          </button>
        </div>
      </div>

      {/* Metric Cards (Section 17 specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalStudents}</p>
          <p className="text-xs text-slate-500 mt-1">Students in Batch SE-A</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Practicals</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <FileCode className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalPracticals}</p>
          <p className="text-xs text-slate-500 mt-1">Data Structures Lab Course</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalSubmissions}</p>
          <p className="text-xs text-slate-500 mt-1">Logged student attempts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Evaluation</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{stats.pendingEvaluations}</p>
          <button
            onClick={() => onSelectPracticalSubmissions()}
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold mt-1 flex items-center gap-0.5"
          >
            Review pending <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Practicals performance breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Practical Performance & Evaluation Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Practical-wise submission completion and score averages.</p>
          </div>
          <button
            onClick={onOpenReports}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            View Full Gradebook
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Practical</th>
                <th className="px-6 py-3.5">Submissions</th>
                <th className="px-6 py-3.5">Evaluated</th>
                <th className="px-6 py-3.5">Pending</th>
                <th className="px-6 py-3.5">Average Score</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.practicalStats.map(ps => (
                <tr key={ps.practicalId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        P{ps.practicalId}
                      </span>
                      <span>{ps.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {ps.submittedCount} / {ps.totalStudents}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {ps.evaluatedCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ps.pendingCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {ps.pendingCount}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">
                    {ps.evaluatedCount > 0 ? `${ps.averageScore} / ${ps.maxMarks}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectPracticalSubmissions(ps.practicalId)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors"
                      id={`view-practical-subs-${ps.practicalId}`}
                    >
                      View Submissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
