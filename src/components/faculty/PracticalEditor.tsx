import React, { useState } from 'react';
import { Practical, TestCase } from '../../types';
import Editor from '@monaco-editor/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Eye, 
  EyeOff, 
  Save, 
  ArrowLeft,
  Settings,
  HelpCircle,
  FileCode
} from 'lucide-react';
import { updatePracticalApi, addTestCaseApi, deleteTestCaseApi } from '../../api';

interface PracticalEditorProps {
  practicals: Practical[];
  onBack: () => void;
  onRefresh: () => void;
}

export const PracticalEditor: React.FC<PracticalEditorProps> = ({
  practicals,
  onBack,
  onRefresh
}) => {
  const [selectedPracticalId, setSelectedPracticalId] = useState<number>(practicals[0]?.id || 1);
  const activePractical = practicals.find(p => p.id === selectedPracticalId) || practicals[0];

  // Practical form fields
  const [title, setTitle] = useState(activePractical.title);
  const [problemStatement, setProblemStatement] = useState(activePractical.problemStatement);
  const [inputContract, setInputContract] = useState(activePractical.inputContract);
  const [maxMarks, setMaxMarks] = useState(activePractical.maxMarks);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(activePractical.timeLimitSeconds);
  const [allowResubmission, setAllowResubmission] = useState(activePractical.allowResubmission);
  const [starterCode, setStarterCode] = useState(activePractical.starterCode);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // New test case state
  const [showAddTc, setShowAddTc] = useState(false);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcMarks, setNewTcMarks] = useState(2);
  const [newTcIsHidden, setNewTcIsHidden] = useState(false);

  // Synchronize when practical changes
  const handleSelectPractical = (p: Practical) => {
    setSelectedPracticalId(p.id);
    setTitle(p.title);
    setProblemStatement(p.problemStatement);
    setInputContract(p.inputContract);
    setMaxMarks(p.maxMarks);
    setTimeLimitSeconds(p.timeLimitSeconds);
    setAllowResubmission(p.allowResubmission);
    setStarterCode(p.starterCode);
    setSaveMessage(null);
    setShowAddTc(false);
  };

  const handleSavePractical = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updatePracticalApi(activePractical.id, {
        title,
        problemStatement,
        inputContract,
        maxMarks: Number(maxMarks),
        timeLimitSeconds: Number(timeLimitSeconds),
        allowResubmission,
        starterCode
      });
      setSaveMessage('Practical updated successfully!');
      onRefresh();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update practical');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTestCase = async () => {
    if (!newTcInput || !newTcOutput) {
      alert('Input and expected output are required');
      return;
    }
    try {
      await addTestCaseApi(activePractical.id, {
        input: newTcInput,
        expectedOutput: newTcOutput,
        marks: Number(newTcMarks),
        isHidden: newTcIsHidden
      });
      setShowAddTc(false);
      setNewTcInput('');
      setNewTcOutput('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add test case');
    }
  };

  const handleDeleteTestCase = async (tcId: string) => {
    if (!window.confirm('Delete this test case?')) return;
    try {
      await deleteTestCaseApi(activePractical.id, tcId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete test case');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="practical-editor-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Practical & Test Case Management</h1>
            <p className="text-xs text-slate-500">Configure problem specifications, starter code, and test cases.</p>
          </div>
        </div>

        <button
          onClick={handleSavePractical}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          id="save-practical-specs-btn"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Practical Settings'}
        </button>
      </div>

      {saveMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          {saveMessage}
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar: Practical list */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
            Practicals (1–10)
          </span>
          {practicals.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectPractical(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                p.id === selectedPracticalId
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">P{p.id}: {p.title}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {p.testCases?.length || 0} tests
              </span>
            </button>
          ))}
        </div>

        {/* Right editor: Settings & Test cases */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Config Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Settings className="h-4 w-4 text-slate-600" />
              Practical Configuration (P{activePractical.id})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Practical Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={e => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Time Limit (Sec)</label>
                  <input
                    type="number"
                    value={timeLimitSeconds}
                    onChange={e => setTimeLimitSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Problem Statement</label>
              <textarea
                rows={3}
                value={problemStatement}
                onChange={e => setProblemStatement(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-slate-900 font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Input / Output Contract</label>
              <textarea
                rows={3}
                value={inputContract}
                onChange={e => setInputContract(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-slate-900 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Starter Code Template</label>
              <div className="h-48 border border-slate-300 rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  language="java"
                  theme="vs-dark"
                  value={starterCode}
                  onChange={val => setStarterCode(val || '')}
                  options={{ fontSize: 11, minimap: { enabled: false } }}
                />
              </div>
            </div>
          </div>

          {/* Test Cases Editor (Section 21 specification) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Evaluation Test Cases ({activePractical.testCases?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Visible tests are displayed to students. Hidden tests are kept confidential to prevent hard-coding.
                </p>
              </div>
              <button
                onClick={() => setShowAddTc(!showAddTc)}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                id="add-test-case-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Test Case
              </button>
            </div>

            {/* Add test case drawer/form */}
            {showAddTc && (
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Test Case</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Input Sequence</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 1 10\n1 20\n3\n4\n"
                      value={newTcInput}
                      onChange={e => setNewTcInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Output</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 20 10"
                      value={newTcOutput}
                      onChange={e => setNewTcOutput(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-slate-700">Marks:</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newTcMarks}
                        onChange={e => setNewTcMarks(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTcIsHidden}
                        onChange={e => setNewTcIsHidden(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                      <span>Mark as Hidden Test Case</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddTc(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddTestCase}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Save Test Case
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of existing test cases */}
            <div className="space-y-3">
              {(activePractical.testCases || []).map((tc, idx) => (
                <div
                  key={tc.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        {tc.isHidden ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800">
                            <EyeOff className="h-3 w-3" /> Hidden Case
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Eye className="h-3 w-3" /> Visible Case
                          </span>
                        )}
                        <span className="font-mono text-slate-700 font-semibold">{tc.marks} Marks</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600 font-mono">
                        <span>Input: <code>{tc.input.trim().replace(/\n/g, ' ')}</code></span>
                        <span className="mx-2">•</span>
                        <span>Expected: <code>{tc.expectedOutput.trim().replace(/\n/g, ' ')}</code></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTestCase(tc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete test case"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
