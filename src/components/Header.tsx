import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './common/ProfileModal';
import { 
  GraduationCap, 
  Terminal, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  LogOut, 
  UserCheck, 
  Layers,
  Users,
  BookOpen,
  History,
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!user) return null;

  const role = user.role?.toUpperCase();
  const isStudent = role === 'STUDENT';
  const isFaculty = role === 'FACULTY';
  const isAdmin = role === 'ADMIN';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xs" id="tcet-main-header">
      {/* Institutional Top Bar */}
      <div className="bg-blue-950 px-4 py-1 text-xs text-blue-200 flex flex-wrap items-center justify-between border-b border-blue-900/60">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-white tracking-wide">THAKUR COLLEGE OF ENGINEERING & TECHNOLOGY</span>
          <span className="text-blue-400">|</span>
          <span className="text-blue-300">Department of Computer Engineering</span>
          <span className="hidden lg:inline text-blue-400">|</span>
          <span className="hidden lg:inline text-blue-300">Autonomous Institute (NAAC 'A' Grade)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-blue-300/80 text-[11px] font-mono hidden sm:inline">
            AY 2026–27
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded text-blue-300 border border-slate-700/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Authenticated Portal ({role})</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Identity */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onSelectTab('dashboard')} 
            id="brand-home-link"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-700 flex items-center justify-center font-bold text-white shadow-inner border border-blue-500/40">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">TCET Practical Lab</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                  isAdmin ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60' :
                  isFaculty ? 'bg-blue-900/60 text-blue-300 border border-blue-700/60' :
                  'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                }`}>
                  {user.role} Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">
                Digital Practical Evaluation Platform
              </p>
            </div>
          </div>

          {/* Dynamic Navigation Items by Role */}
          <nav className="hidden md:flex items-center gap-1" id="role-nav-bar">
            {/* STUDENT NAVIGATION */}
            {isStudent && (
              <>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-student-dashboard"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Dashboard
                </button>
                <button
                  onClick={() => onSelectTab('practicals')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'practicals' || currentTab === 'workspace'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-student-practicals"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Practicals
                </button>
                <button
                  onClick={() => onSelectTab('submissions')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'submissions'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-student-submissions"
                >
                  <FileText className="h-3.5 w-3.5" />
                  My Submissions
                </button>
              </>
            )}

            {/* FACULTY NAVIGATION */}
            {isFaculty && (
              <>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-faculty-dashboard"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Dashboard
                </button>
                <button
                  onClick={() => onSelectTab('evaluation')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'evaluation'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-faculty-evaluation"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  Submissions & Assessment
                </button>
                <button
                  onClick={() => onSelectTab('practical_editor')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'practical_editor'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-faculty-editor"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Practicals & Test Cases
                </button>
                <button
                  onClick={() => onSelectTab('reports')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'reports'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-faculty-reports"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Grade Ledger & Reports
                </button>
              </>
            )}

            {/* ADMIN NAVIGATION */}
            {isAdmin && (
              <>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'dashboard'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-admin-dashboard"
                >
                  <Layers className="h-3.5 w-3.5" />
                  System Overview
                </button>
                <button
                  onClick={() => onSelectTab('users')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'users'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-admin-users"
                >
                  <Users className="h-3.5 w-3.5" />
                  User Management
                </button>
                <button
                  onClick={() => onSelectTab('courses_batches')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'courses_batches'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-admin-courses"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Courses & Batches
                </button>
                <button
                  onClick={() => onSelectTab('audit_logs')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'audit_logs'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-admin-logs"
                >
                  <History className="h-3.5 w-3.5" />
                  Audit Logs
                </button>
                <button
                  onClick={() => onSelectTab('system_health')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'system_health'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-admin-health"
                >
                  <Activity className="h-3.5 w-3.5" />
                  System Health
                </button>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 text-left transition-colors cursor-pointer"
              title="View Account Profile & Change Password"
              id="header-user-profile-button"
            >
              <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-blue-300 shrink-0">
                {isAdmin ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
                ) : isFaculty ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-white leading-tight truncate max-w-[120px]">{user.name}</p>
                <p className="text-slate-400 text-[10px] leading-tight">
                  {isAdmin ? 'System Admin' : isFaculty ? 'Faculty (CE)' : `Roll ${user.rollNumber || '42'} • ${user.batch || 'SE-A1'}`}
                </p>
              </div>
            </button>

            <button
              onClick={logout}
              title="Logout from institutional session"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              id="header-logout-button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};
