import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Users, 
  GraduationCap,
  Calendar,
  Clock
} from 'lucide-react';
import { Course, Batch } from '../../types';
import { 
  getAdminCoursesApi, 
  createAdminCourseApi, 
  updateAdminCourseApi, 
  deleteAdminCourseApi,
  getAdminBatchesApi,
  createAdminBatchApi,
  updateAdminBatchApi,
  deleteAdminBatchApi
} from '../../api';

export const CourseBatchManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'batches'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: 'Computer Engineering',
    semester: 3,
    academicYear: '2026-27',
    facultyName: 'Prof. Amit Sharma',
    facultyId: 'usr-faculty-1',
    description: '',
    isActive: true
  });

  // Batch Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchForm, setBatchForm] = useState({
    name: '',
    courseId: 'course-csc301',
    division: 'A',
    facultyName: 'Prof. Amit Sharma',
    facultyId: 'usr-faculty-1',
    studentCount: 24,
    academicYear: '2026-27'
  });

  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, bRes] = await Promise.all([
        getAdminCoursesApi(),
        getAdminBatchesApi()
      ]);
      setCourses(cRes.courses);
      setBatches(bRes.batches);
    } catch (err) {
      console.error('Failed to load courses or batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingCourse) {
        await updateAdminCourseApi(editingCourse.id, courseForm);
      } else {
        await createAdminCourseApi(courseForm);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (c: Course) => {
    if (!confirm(`Delete course ${c.code} (${c.name})?`)) return;
    try {
      await deleteAdminCourseApi(c.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingBatch) {
        await updateAdminBatchApi(editingBatch.id, batchForm);
      } else {
        await createAdminBatchApi(batchForm);
      }
      setShowBatchModal(false);
      setEditingBatch(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save batch');
    }
  };

  const handleDeleteBatch = async (b: Batch) => {
    if (!confirm(`Delete batch ${b.name}?`)) return;
    try {
      await deleteAdminBatchApi(b.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete batch');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Curriculum & Batch Configurations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure laboratory courses, academic years, sections, and faculty practical assignments.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'courses' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Academic Courses ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'batches' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Lab Batches ({batches.length})</span>
          </button>
        </div>
      </div>

      {/* COURSES VIEW */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Laboratory Courses Catalog</h2>
            <button
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({
                  code: '',
                  name: '',
                  department: 'Computer Engineering',
                  semester: 3,
                  academicYear: '2026-27',
                  facultyName: 'Prof. Amit Sharma',
                  facultyId: 'usr-faculty-1',
                  description: '',
                  isActive: true
                });
                setFormError(null);
                setShowCourseModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {c.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{c.name}</h3>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      Sem {c.semester} • AY {c.academicYear}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {c.description || 'Laboratory programming exercises and algorithmic implementations.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <span>{c.facultyName}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {c.department}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingCourse(c);
                      setCourseForm({
                        code: c.code,
                        name: c.name,
                        department: c.department,
                        semester: c.semester,
                        academicYear: c.academicYear,
                        facultyName: c.facultyName,
                        facultyId: c.facultyId,
                        description: c.description,
                        isActive: c.isActive
                      });
                      setFormError(null);
                      setShowCourseModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit course"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BATCHES VIEW */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Laboratory Practical Batches</h2>
            <button
              onClick={() => {
                setEditingBatch(null);
                setBatchForm({
                  name: '',
                  courseId: courses[0]?.id || 'course-csc301',
                  division: 'A',
                  facultyName: 'Prof. Amit Sharma',
                  facultyId: 'usr-faculty-1',
                  studentCount: 24,
                  academicYear: '2026-27'
                });
                setFormError(null);
                setShowBatchModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Batch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {batches.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {b.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Division {b.division}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Course:</span>
                      <span className="font-semibold text-slate-800">CSC301 (Data Structures)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Allocated Students:</span>
                      <span className="font-bold text-slate-900">{b.studentCount} Students</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Faculty:</span>
                      <span className="text-slate-800 font-medium">{b.facultyName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Academic Year:</span>
                      <span>{b.academicYear}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingBatch(b);
                      setBatchForm({
                        name: b.name,
                        courseId: b.courseId,
                        division: b.division,
                        facultyName: b.facultyName,
                        facultyId: b.facultyId,
                        studentCount: b.studentCount,
                        academicYear: b.academicYear
                      });
                      setFormError(null);
                      setShowBatchModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit batch"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(b)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete batch"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                {editingCourse ? `Edit Course ${editingCourse.code}` : 'Add Academic Course'}
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-3 text-xs">
              {formError && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC301"
                    value={courseForm.code}
                    onChange={e => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={courseForm.semester}
                    onChange={e => setCourseForm({ ...courseForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms Lab"
                  value={courseForm.name}
                  onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Lead Faculty</label>
                <input
                  type="text"
                  required
                  value={courseForm.facultyName}
                  onChange={e => setCourseForm({ ...courseForm, facultyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                {editingBatch ? `Edit Batch ${editingBatch.name}` : 'Configure Lab Batch'}
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="p-6 space-y-3 text-xs">
              {formError && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SE-A1"
                    value={batchForm.name}
                    onChange={e => setBatchForm({ ...batchForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Division</label>
                  <input
                    type="text"
                    required
                    value={batchForm.division}
                    onChange={e => setBatchForm({ ...batchForm, division: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty</label>
                <input
                  type="text"
                  required
                  value={batchForm.facultyName}
                  onChange={e => setBatchForm({ ...batchForm, facultyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enrolled Students Count</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={batchForm.studentCount}
                  onChange={e => setBatchForm({ ...batchForm, studentCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
