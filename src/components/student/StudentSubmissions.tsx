import React, { useState } from 'react';
import { Submission } from '../../types';
import Editor from '@monaco-editor/react';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  FileText, 
  X, 
  Calendar, 
  Check, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface StudentSubmissionsProps {
  submissions: Submission[];
  onOpenPractical: (practicalId: number) => void;
}

export const StudentSubmissions: React.FC<StudentSubmissionsProps> = ({
  submissions,
  onOpenPractical
}) => {
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="student-submissions-view">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Practical Submissions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Historical record of your practical submissions, automated test-case performance, and faculty marks.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No submissions recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Complete your practicals in the lab workspace and click "Submit Practical" to see your evaluated submissions here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Practical</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Test Cases</th>
                  <th className="px-6 py-3.5">Auto Score</th>
                  <th className="px-6 py-3.5">Faculty Marks</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {submissions.map(sub => {
                  const isEvaluated = sub.status === 'EVALUATED';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            P{sub.practicalId}
                          </span>
                          <span>{sub.practicalTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-700 font-semibold">
                          {sub.passedTests} / {sub.totalTests} Passed
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {sub.autoScore} / 10
                      </td>
                      <td className="px-6 py-4">
                        {isEvaluated ? (
                          <div className="flex items-center gap-1 font-bold text-emerald-700">
                            <Award className="h-4 w-4" />
                            <span>{sub.finalScore ?? sub.facultyScore} / 10</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEvaluated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="h-3 w-3" />
                            Evaluated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="h-3 w-3" />
                            Submitted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            id={`view-sub-btn-${sub.id}`}
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => onOpenPractical(sub.practicalId)}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                          >
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Practical {selectedSub.practicalId}: {selectedSub.practicalTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Submission ID: {selectedSub.id} • {new Date(selectedSub.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Score breakdown card */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                <div>
                  <span className="text-xs text-slate-500 block uppercase">Test Cases</span>
                  <span className="text-lg font-bold text-slate-900">{selectedSub.passedTests} / {selectedSub.totalTests}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase">Automatic Score</span>
                  <span className="text-lg font-bold text-slate-900">{selectedSub.autoScore} / 10</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase">Final Faculty Marks</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {selectedSub.finalScore !== null ? `${selectedSub.finalScore} / 10` : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              {selectedSub.facultyRemarks && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs">
                  <span className="font-bold text-blue-900 block mb-1">Faculty Remarks:</span>
                  <p className="text-blue-950 italic">"{selectedSub.facultyRemarks}"</p>
                </div>
              )}

              {/* Source Code Viewer */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Submitted Java Source Code</h4>
                <div className="h-64 border border-slate-300 rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    language="java"
                    theme="vs-dark"
                    value={selectedSub.sourceCode}
                    options={{
                      readOnly: true,
                      fontSize: 12,
                      minimap: { enabled: false }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
