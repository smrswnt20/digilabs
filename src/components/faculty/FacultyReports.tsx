import React, { useState, useEffect } from 'react';
import { Download, Search, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { downloadCsvReport, getSubmissionsApi, getFacultyStudentsApi } from '../../api';
import { Submission, User, isStudentRole } from '../../types';

interface FacultyReportsProps {
  onBack: () => void;
}

export const FacultyReports: React.FC<FacultyReportsProps> = ({ onBack }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsRes, subsRes] = await Promise.all([
          getFacultyStudentsApi(),
          getSubmissionsApi()
        ]);
        setStudents(studentsRes.students.filter(u => isStudentRole(u.role)));
        setSubmissions(subsRes.submissions);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportCsv = async () => {
    try {
      await downloadCsvReport();
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const filteredStudents = students.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.rollNumber || '').includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="faculty-reports-view">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBack}
            className="p-1 text-slate-500 hover:text-slate-800 rounded mb-1 flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grade Ledger & Practical Reports</h1>
          <p className="text-sm text-slate-500">
            Cumulative marks breakdown across all 10 Data Structures practicals for Batch SE-A.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search roll no or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            id="download-ledger-csv-btn"
          >
            <Download className="h-4 w-4" />
            Download Official CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading continuous assessment ledger...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-2 py-3">Batch</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                    <th key={p} className="px-2 py-3">P{p}</th>
                  ))}
                  <th className="px-4 py-3 font-bold text-slate-900 bg-slate-100/80">Total (100)</th>
                  <th className="px-4 py-3 font-bold text-slate-900 bg-slate-100/80">Avg (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const studentSubs = submissions.filter(s => s.studentId === student.id);
                  let total = 0;

                  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pId => {
                    const sub = studentSubs.find(s => s.practicalId === pId);
                    if (!sub) return null;
                    const score = sub.finalScore !== null ? sub.finalScore : sub.autoScore;
                    total += score;
                    return score;
                  });

                  const avg = ((total / 100) * 100).toFixed(1);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-left font-mono font-bold text-slate-900">
                        {student.rollNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-left font-medium text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-2 py-3 font-mono text-slate-500">
                        {student.batch || 'SE-A'}
                      </td>
                      {scores.map((sc, i) => (
                        <td key={i} className="px-2 py-3 font-mono">
                          {sc !== null ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {sc}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 bg-slate-50/50">
                        {total}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 bg-slate-50/50">
                        {avg}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
