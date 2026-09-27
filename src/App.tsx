import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { StudentDashboard } from './components/student/StudentDashboard';
import { PracticalWorkspace } from './components/student/PracticalWorkspace';
import { StudentSubmissions } from './components/student/StudentSubmissions';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { FacultySubmissions } from './components/faculty/FacultySubmissions';
import { PracticalEditor } from './components/faculty/PracticalEditor';
import { FacultyReports } from './components/faculty/FacultyReports';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { CourseBatchManagement } from './components/admin/CourseBatchManagement';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { SystemHealthView } from './components/admin/SystemHealthView';
import { Practical, Submission, FacultyDashboardStats, UserRole, isStudentRole, isFacultyRole, isAdminRole } from './types';
import { getPracticalsApi, getSubmissionsApi, getFacultyDashboardApi } from './api';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function MainLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activePracticalId, setActivePracticalId] = useState<number>(1);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [facultyStats, setFacultyStats] = useState<FacultyDashboardStats | null>(null);
  const [practicalFilterForSubmissions, setPracticalFilterForSubmissions] = useState<number | undefined>(undefined);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  const roleLower = user ? (isStudentRole(user.role) ? 'student' : isFacultyRole(user.role) ? 'faculty' : 'admin') : '';

  // Sync URL with current role and tab
  const syncUrl = (tab: string) => {
    if (!user) return;
    let path = `/${roleLower}/dashboard`;
    if (tab === 'practicals') path = `/${roleLower}/practicals`;
    else if (tab === 'workspace') path = `/${roleLower}/workspace`;
    else if (tab === 'submissions') path = `/${roleLower}/submissions`;
    else if (tab === 'evaluation') path = `/${roleLower}/evaluation`;
    else if (tab === 'practical_editor') path = `/${roleLower}/practicals-editor`;
    else if (tab === 'reports') path = `/${roleLower}/reports`;
    else if (tab === 'users') path = `/${roleLower}/users`;
    else if (tab === 'courses_batches') path = `/${roleLower}/courses`;
    else if (tab === 'audit_logs') path = `/${roleLower}/audit-logs`;
    else if (tab === 'system_health') path = `/${roleLower}/system-health`;

    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, '', path);
      setCurrentPath(path);
    }
  };

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      setCurrentPath(pathname);
      if (!user) return;
      if (pathname.includes('/users')) setCurrentTab('users');
      else if (pathname.includes('/courses')) setCurrentTab('courses_batches');
      else if (pathname.includes('/audit-logs')) setCurrentTab('audit_logs');
      else if (pathname.includes('/system-health')) setCurrentTab('system_health');
      else if (pathname.includes('/evaluation')) setCurrentTab('evaluation');
      else if (pathname.includes('/practicals-editor')) setCurrentTab('practical_editor');
      else if (pathname.includes('/reports')) setCurrentTab('reports');
      else if (pathname.includes('/practicals')) setCurrentTab('practicals');
      else if (pathname.includes('/workspace')) setCurrentTab('workspace');
      else if (pathname.includes('/submissions')) setCurrentTab('submissions');
      else setCurrentTab('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Load practicals and submissions
  const refreshData = async () => {
    if (!user) return;
    try {
      if (isFacultyRole(user.role)) {
        const [pRes, sRes, fStats] = await Promise.all([
          getPracticalsApi(),
          getSubmissionsApi(),
          getFacultyDashboardApi().catch(() => ({ stats: null }))
        ]);
        setPracticals(pRes.practicals);
        setSubmissions(sRes.submissions);
        if (fStats.stats) setFacultyStats(fStats.stats);
      } else if (isStudentRole(user.role)) {
        const [pRes, sRes] = await Promise.all([
          getPracticalsApi(),
          getSubmissionsApi({ studentId: user.id })
        ]);
        setPracticals(pRes.practicals);
        setSubmissions(sRes.submissions);
      }
    } catch (err) {
      console.error('Error refreshing academic practicals data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      const p = window.location.pathname;
      setCurrentPath(p);
      // If user navigates to root or /dashboard without role prefix, redirect to role dashboard
      if (p === '/' || p === '/dashboard' || p === '/login') {
        const target = `/${roleLower}/dashboard`;
        window.history.replaceState({}, '', target);
        setCurrentPath(target);
        setCurrentTab('dashboard');
      }
    }
  }, [user?.id, user?.role]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-300">Authenticating TCET Practical Lab Session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show unified Login View at /login
  if (!user) {
    if (window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    return (
      <LoginView
        onSuccessRole={role => {
          const rLower = isStudentRole(role) ? 'student' : isFacultyRole(role) ? 'faculty' : 'admin';
          const p = `/${rLower}/dashboard`;
          window.history.pushState({}, '', p);
          setCurrentPath(p);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // Strict Frontend Route Guard
  const isTargetAdmin = currentPath.startsWith('/admin');
  const isTargetFaculty = currentPath.startsWith('/faculty');
  const isTargetStudent = currentPath.startsWith('/student');

  const hasAccess = 
    (!isTargetAdmin && !isTargetFaculty && !isTargetStudent) ||
    (isTargetAdmin && isAdminRole(user.role)) ||
    (isTargetFaculty && isFacultyRole(user.role)) ||
    (isTargetStudent && isStudentRole(user.role));

  if (!hasAccess) {
    const roleName = user.role.toUpperCase();
    const portalName = isTargetAdmin ? 'Administrator' : isTargetFaculty ? 'Faculty' : 'Student';
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
        <Header currentTab="" onSelectTab={() => {}} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-red-500/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="h-16 w-16 bg-red-950/80 border border-red-500/60 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">403 Forbidden: Access Denied</h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Your authenticated role (<span className="font-mono font-bold text-amber-300">{roleName}</span>) is not authorized to access the {portalName} portal (<span className="font-mono text-slate-400">{currentPath}</span>).
            </p>
            <button
              onClick={() => {
                const target = `/${roleLower}/dashboard`;
                window.history.pushState({}, '', target);
                setCurrentPath(target);
                setCurrentTab('dashboard');
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              id="return-to-authorized-dashboard-btn"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to {roleName} Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    syncUrl(tab);
  };

  const handleOpenPractical = (pId: number) => {
    setActivePracticalId(pId);
    setCurrentTab('workspace');
    syncUrl('workspace');
  };

  const handleSubmitted = (newSub: Submission) => {
    refreshData();
  };

  const handleFacultySelectPracticalSubmissions = (practicalId?: number) => {
    setPracticalFilterForSubmissions(practicalId);
    setCurrentTab('evaluation');
    syncUrl('evaluation');
  };

  const activePractical = practicals.find(p => p.id === activePracticalId) || practicals[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      <main className="flex-1 flex flex-col">
        {/* STUDENT VIEWS */}
        {isStudentRole(user.role) && (
          <>
            {currentTab === 'dashboard' && (
              <StudentDashboard
                practicals={practicals}
                onOpenPractical={handleOpenPractical}
                onViewSubmissions={() => handleSelectTab('submissions')}
              />
            )}

            {currentTab === 'practicals' && (
              <StudentDashboard
                practicals={practicals}
                onOpenPractical={handleOpenPractical}
                onViewSubmissions={() => handleSelectTab('submissions')}
              />
            )}

            {currentTab === 'workspace' && activePractical && (
              <PracticalWorkspace
                practical={activePractical}
                onBack={() => handleSelectTab('dashboard')}
                onSubmitted={handleSubmitted}
              />
            )}

            {currentTab === 'submissions' && (
              <StudentSubmissions
                submissions={submissions}
                onOpenPractical={handleOpenPractical}
              />
            )}
          </>
        )}

        {/* FACULTY VIEWS */}
        {isFacultyRole(user.role) && (
          <>
            {currentTab === 'dashboard' && (
              <FacultyDashboard
                stats={facultyStats}
                onSelectPracticalSubmissions={handleFacultySelectPracticalSubmissions}
                onOpenReports={() => handleSelectTab('reports')}
                onOpenPracticalEditor={() => handleSelectTab('practical_editor')}
              />
            )}

            {currentTab === 'evaluation' && (
              <FacultySubmissions
                submissions={submissions}
                practicals={practicals}
                initialPracticalFilter={practicalFilterForSubmissions}
                onRefresh={refreshData}
              />
            )}

            {currentTab === 'practical_editor' && (
              <PracticalEditor
                practicals={practicals}
                onBack={() => handleSelectTab('dashboard')}
                onRefresh={refreshData}
              />
            )}

            {currentTab === 'reports' && (
              <FacultyReports
                onBack={() => handleSelectTab('dashboard')}
              />
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {isAdminRole(user.role) && (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard
                onNavigateTab={handleSelectTab}
              />
            )}

            {currentTab === 'users' && (
              <UserManagement />
            )}

            {currentTab === 'courses_batches' && (
              <CourseBatchManagement />
            )}

            {currentTab === 'audit_logs' && (
              <AuditLogsView />
            )}

            {currentTab === 'system_health' && (
              <SystemHealthView />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
