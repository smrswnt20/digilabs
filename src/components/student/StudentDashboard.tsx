import React from 'react';
import { Practical } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  Code2, 
  Award, 
  ChevronRight, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface StudentDashboardProps {
  practicals: Practical[];
  onOpenPractical: (practicalId: number) => void;
  onViewSubmissions: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  practicals,
  onOpenPractical,
  onViewSubmissions
}) => {
  const { user } = useAuth();

  const completedCount = practicals.filter(
    p => p.submissionStatus === 'SUBMITTED' || p.submissionStatus === 'EVALUATED'
  ).length;

  const evaluatedList = practicals.filter(p => p.submissionStatus === 'EVALUATED' && p.studentSubmission);
  const totalScoreEarned = evaluatedList.reduce(
    (sum, p) => sum + (p.studentSubmission?.finalScore ?? p.studentSubmission?.autoScore ?? 0),
    0
  );
  const maxScorePossible = practicals.reduce((sum, p) => sum + p.maxMarks, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="student-dashboard">
      {/* Student welcome card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md border border-blue-800/50 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Course: Data Structures Laboratory (CSC301)
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Autonomous Curriculum
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-blue-100/90 font-medium">
              <span>Batch: <strong className="text-white">{user?.batch || 'SE-A'}</strong></span>
              <span>•</span>
              <span>Roll No: <strong className="text-white">{user?.rollNumber || '42'}</strong></span>
              <span>•</span>
              <span>Division: <strong className="text-white">{user?.division || 'A'}</strong></span>
              <span>•</span>
              <span>Dept: <strong className="text-white">{user?.department || 'Computer Engineering'}</strong></span>
            </div>
          </div>

          {/* Quick stats banner */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm px-5 py-3.5 rounded-lg border border-white/10">
            <div className="text-center pr-4 border-r border-white/10">
              <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">Progress</p>
              <p className="text-2xl font-black text-white">{completedCount} <span className="text-sm font-normal text-blue-300">/ 10</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">Evaluated Score</p>
              <p className="text-2xl font-black text-emerald-300">
                {totalScoreEarned} <span className="text-sm font-normal text-blue-300">/ {maxScorePossible}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Practicals section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Laboratory Practicals</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Write your Java implementation, verify against visible test cases, and submit for faculty evaluation.
          </p>
        </div>
        <button
          onClick={onViewSubmissions}
          className="text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
          id="view-all-submissions-btn"
        >
          <FileCheck className="h-4 w-4" />
          View My Submissions History
        </button>
      </div>

      {/* Practicals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="practicals-grid">
        {practicals.map(practical => {
          const status = practical.submissionStatus || 'NOT_STARTED';
          const submission = practical.studentSubmission;

          return (
            <div
              key={practical.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              id={`practical-card-${practical.id}`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
                    Practical {practical.id}
                  </span>

                  {status === 'EVALUATED' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Award className="h-3.5 w-3.5" />
                      Evaluated
                    </span>
                  )}
                  {status === 'SUBMITTED' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Submitted
                    </span>
                  )}
                  {status === 'NOT_STARTED' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <Clock className="h-3.5 w-3.5" />
                      Not Started
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">
                  {practical.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {practical.problemStatement}
                </p>

                {/* Requirements highlights */}
                <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Max Marks:</span>
                    <strong className="text-slate-800">{practical.maxMarks}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Limit:</span>
                    <span className="text-slate-800 font-mono">{practical.timeLimitSeconds}s / JVM</span>
                  </div>
                  {submission && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-medium">
                      <span>Assigned Score:</span>
                      <strong className="text-emerald-700 font-bold">
                        {submission.finalScore !== null ? submission.finalScore : submission.autoScore} / {practical.maxMarks}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {practical.testCases?.length || 0} Test Cases
                </span>

                <button
                  onClick={() => onOpenPractical(practical.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    status === 'EVALUATED' || status === 'SUBMITTED'
                      ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                  id={`open-practical-btn-${practical.id}`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  {status === 'EVALUATED' || status === 'SUBMITTED' ? 'Review & Code' : 'Open Practical'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
