export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'student' | 'faculty' | 'admin';

export function isStudentRole(role?: string): boolean {
  return role?.toUpperCase() === 'STUDENT';
}

export function isFacultyRole(role?: string): boolean {
  return role?.toUpperCase() === 'FACULTY';
}

export function isAdminRole(role?: string): boolean {
  return role?.toUpperCase() === 'ADMIN';
}

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  rollNumber?: string;
  batch?: string;
  division?: string;
  department?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  academicYear: string;
  facultyId: string;
  facultyName: string;
  description: string;
  isActive: boolean;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  division: string;
  facultyId: string;
  facultyName: string;
  studentCount: number;
  academicYear: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILED' 
    | 'LOGOUT' 
    | 'PASSWORD_RESET' 
    | 'PASSWORD_CHANGED'
    | 'USER_CREATED' 
    | 'USER_UPDATED' 
    | 'USER_STATUS_TOGGLED' 
    | 'PRACTICAL_CREATED' 
    | 'PRACTICAL_UPDATED' 
    | 'PRACTICAL_DELETED' 
    | 'SUBMISSION_CREATED' 
    | 'SUBMISSION_EVALUATED'
    | 'COURSE_CREATED'
    | 'COURSE_UPDATED'
    | 'BATCH_CREATED';
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress?: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPracticals: number;
  totalSubmissions: number;
  evaluatedSubmissions: number;
  pendingEvaluations: number;
  systemUptime: number;
  activeSessionsCount: number;
}

export interface TestCase {
  id: string;
  practicalId: number;
  input: string;
  expectedOutput: string;
  marks: number;
  isHidden: boolean;
  orderIndex: number;
}

export interface Practical {
  id: number;
  title: string;
  problemStatement: string;
  requirements: string[];
  instructions: string;
  starterCode: string;
  inputContract: string;
  maxMarks: number;
  timeLimitSeconds: number;
  memoryLimitMb: number;
  allowResubmission: boolean;
  deadline: string;
  testCases?: TestCase[];
  // Status relative to current student
  submissionStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED';
  studentSubmission?: Submission | null;
}

export interface TestExecutionResult {
  testCaseId: string;
  orderIndex: number;
  isHidden: boolean;
  passed: boolean;
  marksAwarded: number;
  maxMarks: number;
  actualOutput?: string;
  expectedOutput?: string;
  input?: string;
  executionTimeMs: number;
  error?: string;
}

export type ExecutionStatus = 
  | 'SUCCESS' 
  | 'COMPILATION_ERROR' 
  | 'RUNTIME_ERROR' 
  | 'TIME_LIMIT_EXCEEDED' 
  | 'WRONG_ANSWER';

export interface ExecutionResponse {
  success: boolean;
  status: ExecutionStatus;
  compilationError?: string;
  runtimeError?: string;
  stdout?: string;
  stderr?: string;
  executionTimeMs: number;
  testResults: TestExecutionResult[];
  totalPassedTests: number;
  totalTests: number;
  autoScore: number;
  maxScore: number;
}

export type SubmissionStatus = 'SUBMITTED' | 'EVALUATED';

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  batch: string;
  division: string;
  practicalId: number;
  practicalTitle: string;
  sourceCode: string;
  status: SubmissionStatus;
  passedTests: number;
  totalTests: number;
  autoScore: number;
  facultyScore: number | null;
  finalScore: number | null;
  facultyRemarks: string | null;
  testResults: TestExecutionResult[];
  submittedAt: string;
  evaluatedAt: string | null;
}

export interface FacultyDashboardStats {
  totalStudents: number;
  totalPracticals: number;
  totalSubmissions: number;
  pendingEvaluations: number;
  practicalStats: {
    practicalId: number;
    title: string;
    totalStudents: number;
    submittedCount: number;
    evaluatedCount: number;
    pendingCount: number;
    averageScore: number;
    maxMarks: number;
  }[];
}

export interface StudentReportRow {
  studentId: string;
  rollNumber: string;
  name: string;
  batch: string;
  scores: Record<number, number | null>; // practicalId -> score
  totalScore: number;
  maxPossibleScore: number;
  averageScore: number;
  completedPracticalsCount: number;
}
