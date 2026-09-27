import React, { useState } from 'react';
import { Submission, Practical } from '../../types';
import Editor from '@monaco-editor/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Search, 
  Filter, 
  X, 
  Save, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { evaluateSubmissionApi } from '../../api';

interface FacultySubmissionsProps {
  submissions: Submission[];
  practicals: Practical[];
  initialPracticalFilter?: number;
  onRefresh: () => void;
}

export const FacultySubmissions: React.FC<FacultySubmissionsProps> = ({
  submissions,
  practicals,
  initialPracticalFilter,
  onRefresh
}) => {
  const [selectedPracticalId, setSelectedPracticalId] = useState<number | 'ALL'>(
    initialPracticalFilter || 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'EVALUATED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewSub, setReviewSub] = useState<Submission | null>(null);

  // Evaluation form state
  const [facultyMarks, setFacultyMarks] = useState<number>(0);
  const [facultyRemarks, setFacultyRemarks] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Open review modal
  const handleOpenReview = (sub: Submission) => {
    setReviewSub(sub);
    setFacultyMarks(sub.finalScore !== null ? sub.finalScore : sub.autoScore);
    setFacultyRemarks(sub.facultyRemarks || '');
    setSaveSuccess(false);
  };

  const handleSaveEvaluation = async () => {
    if (!reviewSub) return;
    setIsSaving(true);
    try {
      const res = await evaluateSubmissionApi(reviewSub.id, Number(facultyMarks), facultyRemarks);
      setReviewSub(res.submission);
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save evaluation');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (selectedPracticalId !== 'ALL' && s.practicalId !== selectedPracticalId) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.studentName.toLowerCase().includes(q);
      const matchRoll = s.rollNumber.toLowerCase().includes(q);
      if (!matchName && !matchRoll) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="faculty-submissions-view">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Submissions & Evaluation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review student Java code, inspect automated test outputs, override scores, and provide qualitative feedback.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Practical filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Practical:</span>
            <select
              value={selectedPracticalId}
              onChange={e => setSelectedPracticalId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="filter-practical-select"
            >
              <option value="ALL">All Practicals (1–10)</option>
              {practicals.map(p => (
                <option key={p.id} value={p.id}>
                  P{p.id}: {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="filter-status-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Pending Assessment</option>
              <option value="EVALUATED">Evaluated</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name or roll no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            id="search-student-input"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-semibold text-slate-700">No submissions found matching the criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Practical</th>
                  <th className="px-6 py-3.5">Test Cases</th>
                  <th className="px-6 py-3.5">Auto Marks</th>
                  <th className="px-6 py-3.5">Faculty Marks</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map(sub => {
                  const isEvaluated = sub.status === 'EVALUATED';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        {sub.rollNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{sub.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Batch {sub.batch}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-800">
                        <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mr-1.5">
                          P{sub.practicalId}
                        </span>
                        {sub.practicalTitle}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-700">
                          {sub.passedTests} / {sub.totalTests} passed
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                        {sub.autoScore} / 10
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {isEvaluated ? (
                          <strong className="text-emerald-700 font-bold">
                            {sub.finalScore ?? sub.facultyScore} / 10
                          </strong>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEvaluated ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Evaluated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenReview(sub)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            isEvaluated
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          }`}
                          id={`review-sub-btn-${sub.id}`}
                        >
                          {isEvaluated ? 'Review / Edit' : 'Evaluate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Evaluation Modal (Section 18 specification) */}
      {reviewSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  #{reviewSub.rollNumber}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {reviewSub.studentName} — Practical {reviewSub.practicalId}: {reviewSub.practicalTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Batch: {reviewSub.batch} (Div {reviewSub.division}) • Submitted: {new Date(reviewSub.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Automated Test Suite Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    Automated Test Suite Result
                  </h4>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Auto Score: {reviewSub.autoScore} / 10
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {reviewSub.testResults.map((tr, idx) => (
                    <div
                      key={tr.testCaseId}
                      className={`p-2 rounded border flex items-center justify-between ${
                        tr.passed ? 'bg-white border-emerald-200 text-emerald-900' : 'bg-white border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {tr.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-red-600" />}
                        <span className="font-medium text-xs">
                          {tr.isHidden ? `Hidden Case #${idx + 1}` : `Visible Case #${idx + 1}`}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold">
                        {tr.marksAwarded}/{tr.maxMarks}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Code Viewer */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">
                  Student Source Code (Java)
                </h4>
                <div className="h-72 border border-slate-300 rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    language="java"
                    theme="vs-dark"
                    value={reviewSub.sourceCode}
                    options={{
                      readOnly: true,
                      fontSize: 12,
                      minimap: { enabled: false }
                    }}
                  />
                </div>
              </div>

              {/* Faculty Evaluation Box (Section 18 & 19 specification) */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-blue-950 mb-3 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-blue-700" />
                  Faculty Assessment & Marks Override
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Automated Score (Reference)
                    </label>
                    <div className="px-3 py-2 bg-white border border-slate-200 rounded-md font-mono text-sm font-bold text-slate-700">
                      {reviewSub.autoScore} / 10
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Faculty Marks (Final) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={facultyMarks}
                        onChange={e => setFacultyMarks(Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-white border border-blue-400 rounded-md font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="faculty-marks-input"
                      />
                      <span className="text-sm text-slate-500 font-semibold">/ 10</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Current Evaluation Status
                    </label>
                    <div className="py-2 text-xs font-semibold">
                      {reviewSub.status === 'EVALUATED' ? (
                        <span className="text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded">
                          Evaluated ({new Date(reviewSub.evaluatedAt || '').toLocaleDateString()})
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded">
                          Pending Faculty Grading
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Faculty Remarks & Feedback for Student
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive academic feedback (e.g. Good logic, boundary conditions handled cleanly)..."
                    value={facultyRemarks}
                    onChange={e => setFacultyRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="faculty-remarks-input"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Evaluation saved successfully!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setReviewSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvaluation}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  id="save-evaluation-btn"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Evaluation & Marks'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
