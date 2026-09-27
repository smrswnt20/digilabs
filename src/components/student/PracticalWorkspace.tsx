import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Practical, ExecutionResponse, Submission } from '../../types';
import { runCodeApi, submitPracticalApi } from '../../api';
import { 
  Play, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Terminal, 
  FileCode, 
  HelpCircle, 
  ArrowLeft,
  Sun,
  Moon,
  ShieldAlert,
  Award
} from 'lucide-react';

interface PracticalWorkspaceProps {
  practical: Practical;
  onBack: () => void;
  onSubmitted: (submission: Submission) => void;
}

export const PracticalWorkspace: React.FC<PracticalWorkspaceProps> = ({
  practical,
  onBack,
  onSubmitted
}) => {
  const [sourceCode, setSourceCode] = useState<string>(() => {
    return practical.studentSubmission?.sourceCode || practical.starterCode;
  });
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'requirements' | 'submission'>('problem');
  const [outputTab, setOutputTab] = useState<'testcases' | 'console' | 'errors'>('testcases');
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    // If student has existing submission, load its code
    if (practical.studentSubmission?.sourceCode) {
      setSourceCode(practical.studentSubmission.sourceCode);
    } else {
      setSourceCode(practical.starterCode);
    }
  }, [practical.id]);

  const handleResetStarter = () => {
    if (window.confirm('Reset code to initial practical template? Any unsaved edits will be cleared.')) {
      setSourceCode(practical.starterCode);
    }
  };

  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setErrorMessage(null);
    try {
      const res = await runCodeApi(practical.id, sourceCode);
      setExecutionResult(res.result);
      if (res.result.compilationError || res.result.runtimeError) {
        setOutputTab('errors');
      } else {
        setOutputTab('testcases');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to execute code');
      setOutputTab('errors');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setShowSubmitModal(false);
    try {
      const res = await submitPracticalApi(practical.id, sourceCode);
      setExecutionResult(res.executionResult);
      setOutputTab('testcases');
      onSubmitted(res.submission);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed');
      setOutputTab('errors');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = practical.submissionStatus === 'SUBMITTED' && !practical.allowResubmission;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-100" id="practical-workspace">
      {/* Workspace top action bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
            id="back-to-practicals-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Practicals</span>
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                P{practical.id}
              </span>
              <h2 className="font-bold text-slate-900 text-sm">{practical.title}</h2>
              {practical.submissionStatus === 'EVALUATED' && (
                <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Marks: {practical.studentSubmission?.finalScore ?? practical.studentSubmission?.autoScore} / {practical.maxMarks}
                </span>
              )}
              {practical.submissionStatus === 'SUBMITTED' && (
                <span className="text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Submitted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors text-xs flex items-center gap-1"
            title="Toggle Editor Theme"
            id="toggle-theme-btn"
          >
            {editorTheme === 'vs-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={handleResetStarter}
            disabled={isRunning || isSubmitting || isLocked}
            className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
            title="Reset code to starter template"
            id="reset-code-btn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            id="run-code-btn"
            title="Run code against visible test cases (Ctrl+Enter)"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            {isRunning ? 'Compiling & Running...' : 'Run Code'}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isRunning || isSubmitting || isLocked}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            id="submit-practical-btn"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmitting ? 'Evaluating...' : 'Submit Practical'}
          </button>
        </div>
      </div>

      {/* Main split area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left column: Problem Details */}
        <div className="w-full md:w-[42%] lg:w-[38%] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'problem'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Problem Statement
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'requirements'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Input Contract & Specs
            </button>
            {practical.studentSubmission && (
              <button
                onClick={() => setActiveTab('submission')}
                className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'submission'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                Submitted Record
              </button>
            )}
          </div>

          {/* Tab contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-800 text-sm leading-relaxed">
            {activeTab === 'problem' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                    Problem Objective
                  </h3>
                  <div className="whitespace-pre-line text-slate-800 font-normal leading-relaxed">
                    {practical.problemStatement}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Implementation Requirements
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                    {practical.requirements.map((req, idx) => (
                      <li key={idx} className="leading-normal">
                        <span className="font-medium text-slate-800">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 text-xs text-blue-900">
                  <p className="font-bold flex items-center gap-1 text-blue-950 mb-1">
                    <ShieldAlert className="h-4 w-4 text-blue-700" />
                    Academic Notice:
                  </p>
                  <p>
                    Ensure your Java program class is named <code>Main</code>. Use standard <code>java.util.Scanner</code> for reading input.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                    Standardized Input/Output Contract
                  </h3>
                  <p className="text-xs text-slate-600 mb-2">
                    Do not print conversational user prompts like <code>"Enter choice:"</code> during automated tests. Print exact numerical outputs.
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre">
                    {practical.inputContract}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Sample Visible Test Cases
                  </h3>
                  <div className="space-y-3">
                    {(practical.testCases || []).filter(tc => !tc.isHidden).map((tc, idx) => (
                      <div key={tc.id} className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                          <span>Test Case #{idx + 1}</span>
                          <span className="text-slate-500 font-mono">{tc.marks} Marks</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mt-1">
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-sans">Input:</span>
                            <pre className="whitespace-pre-wrap">{tc.input.trim()}</pre>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-sans">Expected Output:</span>
                            <pre className="whitespace-pre-wrap">{tc.expectedOutput.trim()}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submission' && practical.studentSubmission && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Submission ID:</span>
                    <span className="font-mono text-slate-800">{practical.studentSubmission.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Submitted At:</span>
                    <span className="text-slate-800">
                      {new Date(practical.studentSubmission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Automatic Score:</span>
                    <span className="font-bold text-slate-800">
                      {practical.studentSubmission.autoScore} / {practical.maxMarks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Final Faculty Marks:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {practical.studentSubmission.finalScore !== null
                        ? `${practical.studentSubmission.finalScore} / ${practical.maxMarks}`
                        : 'Pending Faculty Assessment'}
                    </span>
                  </div>
                  {practical.studentSubmission.facultyRemarks && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block mb-1">Faculty Remarks:</span>
                      <p className="bg-white p-2.5 rounded border border-slate-200 text-slate-800 italic">
                        "{practical.studentSubmission.facultyRemarks}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Monaco Editor + Output Console */}
        <div className="w-full md:w-[58%] lg:w-[62%] flex flex-col overflow-hidden bg-slate-900">
          {/* Monaco Editor */}
          <div className="flex-1 relative min-h-[300px]">
            <Editor
              height="100%"
              language="java"
              theme={editorTheme}
              value={sourceCode}
              onChange={val => setSourceCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
                readOnly: isLocked
              }}
            />
          </div>

          {/* Output Drawer */}
          <div className="h-[240px] bg-slate-950 border-t border-slate-800 flex flex-col overflow-hidden text-slate-200">
            {/* Drawer Tab Headers */}
            <div className="flex items-center justify-between bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOutputTab('testcases')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-medium ${
                    outputTab === 'testcases'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-testcases"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  Test Cases
                  {executionResult && (
                    <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded font-mono">
                      {executionResult.totalPassedTests}/{executionResult.totalTests}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setOutputTab('console')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-medium ${
                    outputTab === 'console'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-console"
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  Console Output
                </button>

                <button
                  onClick={() => setOutputTab('errors')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-medium ${
                    outputTab === 'errors'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-errors"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Compilation & Errors
                  {(executionResult?.compilationError || executionResult?.runtimeError || errorMessage) && (
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                  )}
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{executionResult.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
              {/* 1. Test Cases View */}
              {outputTab === 'testcases' && (
                <div className="space-y-2">
                  {!executionResult && (
                    <div className="text-slate-500 italic text-center py-8">
                      Click <strong className="text-slate-400">"Run Code"</strong> to execute your solution against visible test cases.
                    </div>
                  )}

                  {executionResult && executionResult.testResults.length === 0 && (
                    <div className="text-slate-400 text-center py-6">
                      {executionResult.status === 'COMPILATION_ERROR'
                        ? 'Compilation failed. See "Compilation & Errors" tab for details.'
                        : 'No test case output.'}
                    </div>
                  )}

                  {executionResult && executionResult.testResults.map((tr, idx) => (
                    <div
                      key={tr.testCaseId}
                      className={`p-2.5 rounded border transition-colors ${
                        tr.passed
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-100'
                          : 'bg-red-950/30 border-red-800/60 text-red-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tr.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          )}
                          <span className="font-bold text-xs">
                            {tr.isHidden ? `Test Case ${idx + 1} (Hidden Evaluation Case)` : `Test Case ${idx + 1}`}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80">
                          {tr.marksAwarded} / {tr.maxMarks} Marks
                        </span>
                      </div>

                      {/* Visible test case details */}
                      {!tr.isHidden && tr.input && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Expected:</span>
                            <pre className="text-emerald-300 whitespace-pre-wrap">{tr.expectedOutput?.trim()}</pre>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Actual Output:</span>
                            <pre className={tr.passed ? 'text-emerald-300 whitespace-pre-wrap' : 'text-red-300 whitespace-pre-wrap'}>
                              {tr.actualOutput?.trim() || '(no output)'}
                            </pre>
                          </div>
                        </div>
                      )}

                      {tr.isHidden && !tr.passed && (
                        <p className="mt-1 text-slate-400 text-[11px] italic">
                          Hidden test case did not pass. Detailed input/output is hidden for academic evaluation integrity.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Console View */}
              {outputTab === 'console' && (
                <div>
                  {executionResult?.stdout ? (
                    <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {executionResult.stdout}
                    </pre>
                  ) : (
                    <p className="text-slate-500 italic">No standard console output captured.</p>
                  )}
                </div>
              )}

              {/* 3. Errors View */}
              {outputTab === 'errors' && (
                <div className="space-y-2">
                  {executionResult?.compilationError && (
                    <div className="bg-red-950/40 border border-red-800/80 p-3 rounded text-red-200">
                      <p className="font-bold text-xs text-red-400 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Compilation Error:
                      </p>
                      <pre className="whitespace-pre-wrap text-xs font-mono leading-normal text-red-300">
                        {executionResult.compilationError}
                      </pre>
                    </div>
                  )}

                  {executionResult?.runtimeError && (
                    <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded text-amber-200">
                      <p className="font-bold text-xs text-amber-400 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Runtime Diagnostic:
                      </p>
                      <pre className="whitespace-pre-wrap text-xs font-mono leading-normal text-amber-300">
                        {executionResult.runtimeError}
                      </pre>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="bg-red-950/40 border border-red-800 p-3 rounded text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  {!executionResult?.compilationError && !executionResult?.runtimeError && !errorMessage && (
                    <p className="text-slate-500 italic">No compilation or runtime errors reported.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Final Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Submit Practical {practical.id}?
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Your Java source code will be compiled and executed against all official evaluation test cases (both visible and hidden).
              The resulting automatic score will be recorded and submitted to the faculty for review.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-5">
              <strong>Notice:</strong> Once submitted, your submission will be registered on the faculty dashboard.
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                id="cancel-submit-modal-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                id="confirm-submit-modal-btn"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Evaluating...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
