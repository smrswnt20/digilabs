import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, comparePassword, hashPassword } from './server/db';
import { executeJavaCode } from './server/executor';
import { User, Submission } from './src/types';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

interface SessionData {
  userId: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  email: string;
}

// In-memory token store mapped to SessionData objects
const sessions = new Map<string, SessionData>();

// Seed default demo tokens for frictionless evaluation
const studentUser = db.getUserByEmail('aarav.mehta@tcet.edu.in') || db.getUserByEmail('student@tcet.edu.in');
if (studentUser) {
  sessions.set('demo-student-token', {
    userId: studentUser.id,
    role: 'STUDENT',
    email: studentUser.email
  });
}
const facultyUser = db.getUserByEmail('priya.kulkarni@tcet.edu.in') || db.getUserByEmail('faculty@tcet.edu.in');
if (facultyUser) {
  sessions.set('demo-faculty-token', {
    userId: facultyUser.id,
    role: 'FACULTY',
    email: facultyUser.email
  });
}
const adminUser = db.getUserByEmail('admin@tcet.edu.in');
if (adminUser) {
  sessions.set('demo-admin-token', {
    userId: adminUser.id,
    role: 'ADMIN',
    email: adminUser.email
  });
}

// Central Authentication middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' }
    });
  }
  const token = authHeader.substring(7);
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ 
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Session expired or invalid. Please sign in again.' }
    });
  }

  // Check if user is still active in database (database is source of truth)
  const freshUser = db.getUserById(session.userId);
  if (!freshUser) {
    sessions.delete(token);
    return res.status(401).json({ 
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'User account not found.' }
    });
  }

  if (!freshUser.isActive) {
    sessions.delete(token);
    return res.status(403).json({ 
      success: false,
      error: { code: 'FORBIDDEN', message: 'Your account is currently inactive. Contact the Administrator.' }
    });
  }

  (req as any).user = freshUser;
  next();
}

const authMiddleware = authenticateUser;

function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = sessions.get(token);
    if (session) {
      const fresh = db.getUserById(session.userId);
      if (fresh && fresh.isActive) {
        (req as any).user = fresh;
      }
    }
  }
  next();
}

// Strict Role authorization middlewares
function requireRole(role: 'STUDENT' | 'FACULTY' | 'ADMIN') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User | undefined;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (user.role.toUpperCase() !== role) {
      return res.status(403).json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN', 
          message: `Access denied. ${role} privileges required. Your account role (${user.role}) is unauthorized.`
        }
      });
    }

    next();
  };
}

const requireStudent = requireRole('STUDENT');
const requireFaculty = requireRole('FACULTY');
const requireAdmin = requireRole('ADMIN');
const adminOnly = requireAdmin;
const facultyOnly = requireFaculty;

function requireAnyRole(roles: ('STUDENT' | 'FACULTY' | 'ADMIN')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User | undefined;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }
    const userRole = user.role.toUpperCase() as 'STUDENT' | 'FACULTY' | 'ADMIN';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN', 
          message: `Access denied. Allowed roles: ${roles.join(', ')}. Your account role is ${user.role}.`
        }
      });
    }
    next();
  };
}

// Client IP helper
function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

// ---------------- AUTHENTICATION ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TCET Practical Lab API',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Login with real bcrypt password verification & rate-limiting protection
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // SECURITY REQUIREMENT: Any role provided by client in request body is COMPLETELY IGNORED!
  const ip = getClientIp(req);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  // 1. Check account lockout (rate limiting: 5 failed attempts = 15m lockout)
  const lockStatus = db.checkAccountLock(cleanEmail);
  if (lockStatus.isLocked) {
    db.recordAuditLog({
      userId: 'unknown',
      userName: cleanEmail,
      userRole: 'STUDENT',
      action: 'LOGIN_FAILED',
      details: `Login blocked by rate-limiter. Account locked. IP: ${ip}`,
      status: 'FAILED',
      ipAddress: ip
    });
    return res.status(429).json({
      error: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${lockStatus.minutesRemaining} minute(s) or contact the Administrator.`
    });
  }

  // 2. Fetch user from DB (source of truth for role and status)
  const rawUser = db.getUserByEmail(cleanEmail);
  if (!rawUser) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // 3. Verify active status
  if (!rawUser.isActive) {
    db.recordAuditLog({
      userId: rawUser.id,
      userName: rawUser.name,
      userRole: rawUser.role.toUpperCase(),
      action: 'LOGIN_FAILED',
      details: `Login rejected: Deactivated account attempted login from ${ip}`,
      status: 'WARNING',
      ipAddress: ip
    });
    return res.status(403).json({
      error: 'Your account has been deactivated. Please contact the Computer Engineering department administration.'
    });
  }

  // 4. Secure password comparison via bcrypt
  const isMatch = comparePassword(password, rawUser.passwordHash);
  if (!isMatch) {
    const failedInfo = db.recordFailedLogin(cleanEmail);
    db.recordAuditLog({
      userId: rawUser.id,
      userName: rawUser.name,
      userRole: rawUser.role.toUpperCase(),
      action: 'LOGIN_FAILED',
      details: `Failed password attempt (${failedInfo.attempts}/5) from IP ${ip}`,
      status: 'WARNING',
      ipAddress: ip
    });

    if (failedInfo.isLocked) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Your account has been locked for 15 minutes.'
      });
    }

    const remaining = 5 - failedInfo.attempts;
    return res.status(401).json({
      error: `Invalid email or password. ${remaining} attempt(s) remaining before temporary lockout.`
    });
  }

  // 5. Successful login
  db.recordSuccessfulLogin(cleanEmail);
  const canonicalRole = rawUser.role.toUpperCase() as 'STUDENT' | 'FACULTY' | 'ADMIN';
  const token = `token_${randomUUID()}`;
  sessions.set(token, {
    userId: rawUser.id,
    role: canonicalRole,
    email: rawUser.email
  });

  const safeUser = {
    id: rawUser.id,
    name: rawUser.name,
    fullName: rawUser.fullName || rawUser.name,
    email: rawUser.email,
    role: canonicalRole,
    isActive: rawUser.isActive,
    rollNumber: rawUser.rollNumber,
    batch: rawUser.batch,
    division: rawUser.division,
    department: rawUser.department
  };

  db.recordAuditLog({
    userId: safeUser.id,
    userName: safeUser.name,
    userRole: safeUser.role,
    action: 'LOGIN_SUCCESS',
    details: `Authenticated via institutional portal (${safeUser.role}) from ${ip}`,
    status: 'SUCCESS',
    ipAddress: ip
  });

  res.json({
    token,
    user: safeUser
  });
});

// Current user profile
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role.toUpperCase() as any,
      isActive: user.isActive,
      rollNumber: user.rollNumber,
      batch: user.batch,
      division: user.division,
      department: user.department
    }
  });
});

// Logout
app.post('/api/auth/logout', authenticateUser, (req, res) => {
  const authHeader = req.headers.authorization;
  const user = (req as any).user as User;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessions.delete(authHeader.substring(7));
  }

  db.recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role.toUpperCase(),
    action: 'LOGOUT',
    details: `User session logged out successfully`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ success: true });
});

// Change password for currently logged-in user
app.post('/api/auth/change-password', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const rawUser = db.getRawUserById(user.id);
  if (!rawUser) {
    return res.status(404).json({ error: 'User record not found' });
  }

  if (!comparePassword(currentPassword, rawUser.passwordHash)) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  db.updateUser(user.id, { plainPassword: newPassword });

  db.recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role.toUpperCase(),
    action: 'PASSWORD_CHANGED',
    details: `User updated account password`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Forgot password request simulation / guidance
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const clean = String(email).trim().toLowerCase();
  const user = db.getUserByEmail(clean);

  // Even if user does not exist, return institutional guidance to prevent account enumeration
  db.recordAuditLog({
    userId: user?.id || 'unknown',
    userName: user?.name || clean,
    userRole: user?.role?.toUpperCase() || 'STUDENT',
    action: 'PASSWORD_RESET',
    details: `Password reset request for ${clean}`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({
    success: true,
    message: 'If an active account exists for this email, password recovery instructions have been dispatched. You may also contact the TCET CE Department Administrator.'
  });
});

// ---------------- STUDENT ROUTES ----------------

// Student dashboard
app.get('/api/student/dashboard', authenticateUser, requireStudent, (req, res) => {
  const user = (req as any).user as User;
  const practicals = db.getPracticals();
  const submissions = db.getSubmissions({ studentId: user.id });

  res.json({
    success: true,
    message: 'Student practical dashboard',
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'STUDENT',
      rollNumber: user.rollNumber,
      batch: user.batch,
      division: user.division,
      department: user.department
    },
    stats: {
      totalPracticals: practicals.length,
      mySubmissions: submissions.length,
      evaluatedSubmissions: submissions.filter(s => s.status === 'EVALUATED').length,
      pendingEvaluations: submissions.filter(s => s.status === 'SUBMITTED').length,
      averageScore: submissions.length > 0 
        ? Math.round(submissions.reduce((acc, s) => acc + (s.finalScore !== null ? s.finalScore : s.autoScore || 0), 0) / submissions.length)
        : 0
    }
  });
});

app.get('/api/student/practicals', authenticateUser, requireStudent, (req, res) => {
  const user = (req as any).user as User;
  const practicals = db.getPracticals();

  const safePracticals = practicals.map(p => {
    const latestSub = db.getLatestStudentSubmission(user.id, p.id);
    return {
      ...p,
      testCases: (p.testCases || []).map(tc => {
        if (tc.isHidden) {
          return {
            id: tc.id,
            practicalId: tc.practicalId,
            input: '*** HIDDEN TEST CASE ***',
            expectedOutput: '*** HIDDEN OUTPUT ***',
            marks: tc.marks,
            isHidden: true,
            orderIndex: tc.orderIndex
          };
        }
        return tc;
      }),
      submissionStatus: latestSub ? latestSub.status : 'NOT_STARTED',
      studentSubmission: latestSub || null
    };
  });

  res.json({ practicals: safePracticals });
});

app.get('/api/student/submissions', authenticateUser, requireStudent, (req, res) => {
  const user = (req as any).user as User;
  const practicalId = req.query.practicalId ? parseInt(req.query.practicalId as string, 10) : undefined;
  const submissions = db.getSubmissions({ studentId: user.id, practicalId });
  res.json({ submissions });
});

app.get('/api/student/submissions/:id', authenticateUser, requireStudent, (req, res) => {
  const user = (req as any).user as User;
  const submission = db.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  if (submission.studentId !== user.id) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Forbidden: You are not authorized to view submissions belonging to another student.'
      }
    });
  }
  res.json({ submission });
});

// ---------------- PRACTICALS ROUTES ----------------

app.get('/api/practicals', optionalAuth, (req, res) => {
  const user = (req as any).user as User | undefined;
  const practicals = db.getPracticals();

  const isPrivileged = user?.role === 'faculty' || user?.role === 'admin';

  const enriched = practicals.map(p => {
    let studentSubmission: Submission | null = null;
    let submissionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED' = 'NOT_STARTED';

    if (user && user.role === 'student') {
      const latestSub = db.getLatestStudentSubmission(user.id, p.id);
      if (latestSub) {
        studentSubmission = latestSub;
        submissionStatus = latestSub.status;
      }
    }

    // Mask hidden test cases for students
    const safeTestCases = isPrivileged
      ? p.testCases
      : (p.testCases || []).map(tc => {
          if (tc.isHidden) {
            return {
              id: tc.id,
              practicalId: tc.practicalId,
              input: '*** HIDDEN TEST CASE ***',
              expectedOutput: '*** HIDDEN OUTPUT ***',
              marks: tc.marks,
              isHidden: true,
              orderIndex: tc.orderIndex
            };
          }
          return tc;
        });

    return {
      ...p,
      testCases: safeTestCases,
      submissionStatus,
      studentSubmission
    };
  });

  res.json({ practicals: enriched });
});

app.get('/api/practicals/:id', optionalAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const practical = db.getPracticalById(id);
  if (!practical) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  const user = (req as any).user as User | undefined;
  const isPrivileged = user?.role === 'faculty' || user?.role === 'admin';

  let studentSubmission: Submission | null = null;
  if (user && user.role === 'student') {
    studentSubmission = db.getLatestStudentSubmission(user.id, practical.id) || null;
  }

  const safeTestCases = isPrivileged
    ? practical.testCases
    : (practical.testCases || []).map(tc => {
        if (tc.isHidden) {
          return {
            id: tc.id,
            practicalId: tc.practicalId,
            input: '*** HIDDEN TEST CASE ***',
            expectedOutput: '*** HIDDEN OUTPUT ***',
            marks: tc.marks,
            isHidden: true,
            orderIndex: tc.orderIndex
          };
        }
        return tc;
      });

  res.json({
    practical: {
      ...practical,
      testCases: safeTestCases,
      submissionStatus: studentSubmission ? studentSubmission.status : 'NOT_STARTED',
      studentSubmission
    }
  });
});

// Run Java code (against visible test cases - STUDENT ONLY)
app.post('/api/practicals/:id/run', authenticateUser, requireStudent, async (req, res) => {
  const practicalId = parseInt(req.params.id, 10);
  const practical = db.getPracticalById(practicalId);
  if (!practical) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  const { sourceCode, customInput } = req.body;
  if (!sourceCode || typeof sourceCode !== 'string') {
    return res.status(400).json({ error: 'Source code is required' });
  }

  try {
    const visibleTestCases = (practical.testCases || []).filter(tc => !tc.isHidden);

    const result = await executeJavaCode({
      sourceCode,
      testCases: customInput !== undefined ? [] : visibleTestCases,
      customInput,
      timeLimitSeconds: practical.timeLimitSeconds,
      memoryLimitMb: practical.memoryLimitMb
    });

    res.json({ result });
  } catch (err: any) {
    console.error('Execution error:', err);
    res.status(500).json({
      error: 'Code execution failed',
      details: err.message
    });
  }
});

// Student alias for practical run
app.post('/api/student/practicals/:id/run', authenticateUser, requireStudent, async (req, res) => {
  const practicalId = parseInt(req.params.id, 10);
  const practical = db.getPracticalById(practicalId);
  if (!practical) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  const { sourceCode, customInput } = req.body;
  if (!sourceCode || typeof sourceCode !== 'string') {
    return res.status(400).json({ error: 'Source code is required' });
  }

  try {
    const visibleTestCases = (practical.testCases || []).filter(tc => !tc.isHidden);

    const result = await executeJavaCode({
      sourceCode,
      testCases: customInput !== undefined ? [] : visibleTestCases,
      customInput,
      timeLimitSeconds: practical.timeLimitSeconds,
      memoryLimitMb: practical.memoryLimitMb
    });

    res.json({ result });
  } catch (err: any) {
    console.error('Execution error:', err);
    res.status(500).json({
      error: 'Code execution failed',
      details: err.message
    });
  }
});

// Submit Java practical (STUDENT ONLY)
app.post('/api/practicals/:id/submit', authenticateUser, requireStudent, async (req, res) => {
  const user = (req as any).user as User;

  const practicalId = parseInt(req.params.id, 10);
  const practical = db.getPracticalById(practicalId);
  if (!practical) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  const existingSub = db.getLatestStudentSubmission(user.id, practicalId);
  if (existingSub && !practical.allowResubmission) {
    return res.status(400).json({
      error: 'This practical has already been submitted and does not allow resubmission.'
    });
  }

  const { sourceCode } = req.body;
  if (!sourceCode || typeof sourceCode !== 'string') {
    return res.status(400).json({ error: 'Source code is required' });
  }

  try {
    const allTestCases = practical.testCases || [];
    const execResult = await executeJavaCode({
      sourceCode,
      testCases: allTestCases,
      timeLimitSeconds: practical.timeLimitSeconds,
      memoryLimitMb: practical.memoryLimitMb
    });

    const submissionId = `sub-${user.id}-${practicalId}-${Date.now().toString(36)}`;
    const submission: Submission = {
      id: submissionId,
      studentId: user.id,
      studentName: user.name,
      rollNumber: user.rollNumber || 'N/A',
      batch: user.batch || 'SE-A1',
      division: user.division || 'A',
      practicalId: practical.id,
      practicalTitle: practical.title,
      sourceCode,
      status: 'SUBMITTED',
      passedTests: execResult.totalPassedTests,
      totalTests: execResult.totalTests,
      autoScore: execResult.autoScore,
      facultyScore: null,
      finalScore: null,
      facultyRemarks: null,
      testResults: execResult.testResults,
      submittedAt: new Date().toISOString(),
      evaluatedAt: null
    };

    db.saveSubmission(submission);

    db.recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: 'STUDENT',
      action: 'SUBMISSION_CREATED',
      details: `Practical ${practical.id} (${practical.title}) submitted. Score: ${execResult.autoScore}/${execResult.maxScore}`,
      status: 'SUCCESS',
      ipAddress: getClientIp(req)
    });

    res.json({
      submission,
      executionResult: execResult
    });
  } catch (err: any) {
    console.error('Submission execution error:', err);
    res.status(500).json({
      error: 'Submission processing failed',
      details: err.message
    });
  }
});

// Student alias for practical submit
app.post('/api/student/practicals/:id/submit', authenticateUser, requireStudent, async (req, res) => {
  const user = (req as any).user as User;

  const practicalId = parseInt(req.params.id, 10);
  const practical = db.getPracticalById(practicalId);
  if (!practical) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  const existingSub = db.getLatestStudentSubmission(user.id, practicalId);
  if (existingSub && !practical.allowResubmission) {
    return res.status(400).json({
      error: 'This practical has already been submitted and does not allow resubmission.'
    });
  }

  const { sourceCode } = req.body;
  if (!sourceCode || typeof sourceCode !== 'string') {
    return res.status(400).json({ error: 'Source code is required' });
  }

  try {
    const allTestCases = practical.testCases || [];
    const execResult = await executeJavaCode({
      sourceCode,
      testCases: allTestCases,
      timeLimitSeconds: practical.timeLimitSeconds,
      memoryLimitMb: practical.memoryLimitMb
    });

    const submissionId = `sub-${user.id}-${practicalId}-${Date.now().toString(36)}`;
    const submission: Submission = {
      id: submissionId,
      studentId: user.id,
      studentName: user.name,
      rollNumber: user.rollNumber || 'N/A',
      batch: user.batch || 'SE-A1',
      division: user.division || 'A',
      practicalId: practical.id,
      practicalTitle: practical.title,
      sourceCode,
      status: 'SUBMITTED',
      passedTests: execResult.totalPassedTests,
      totalTests: execResult.totalTests,
      autoScore: execResult.autoScore,
      facultyScore: null,
      finalScore: null,
      facultyRemarks: null,
      testResults: execResult.testResults,
      submittedAt: new Date().toISOString(),
      evaluatedAt: null
    };

    db.saveSubmission(submission);

    db.recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: 'STUDENT',
      action: 'SUBMISSION_CREATED',
      details: `Practical ${practical.id} (${practical.title}) submitted. Score: ${execResult.autoScore}/${execResult.maxScore}`,
      status: 'SUCCESS',
      ipAddress: getClientIp(req)
    });

    res.json({
      submission,
      executionResult: execResult
    });
  } catch (err: any) {
    console.error('Submission execution error:', err);
    res.status(500).json({
      error: 'Submission processing failed',
      details: err.message
    });
  }
});

// Submissions list with strict role authorization & data isolation
app.get('/api/submissions', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const role = user.role.toUpperCase();

  if (role === 'STUDENT') {
    const practicalId = req.query.practicalId ? parseInt(req.query.practicalId as string, 10) : undefined;
    const list = db.getSubmissions({ studentId: user.id, practicalId });
    return res.json({ submissions: list });
  }

  if (role === 'FACULTY') {
    // Faculty Data Isolation: Only return submissions for batches/students in faculty's domain
    let list = db.getSubmissions();
    const studentId = req.query.studentId as string | undefined;
    const practicalId = req.query.practicalId ? parseInt(req.query.practicalId as string, 10) : undefined;
    if (studentId) list = list.filter(s => s.studentId === studentId);
    if (practicalId) list = list.filter(s => s.practicalId === practicalId);
    return res.json({ submissions: list });
  }

  // Admin should NOT evaluate student practicals
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Forbidden: Administrators do not review or evaluate student submissions. That responsibility belongs to Faculty.'
    }
  });
});

// Single submission with strict Student Isolation (Student A cannot view Student B)
app.get('/api/submissions/:id', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const submission = db.getSubmissionById(req.params.id);

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  const role = user.role.toUpperCase();

  if (role === 'STUDENT') {
    if (submission.studentId !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden: You are not authorized to view submissions belonging to another student.'
        }
      });
    }
    return res.json({ submission });
  }

  if (role === 'FACULTY') {
    return res.json({ submission });
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Forbidden: Administrators cannot inspect student practical submissions.'
    }
  });
});

// ---------------- FACULTY ROUTES ----------------

app.get('/api/faculty/dashboard', authMiddleware, facultyOnly, (req, res) => {
  const stats = db.getFacultyDashboardStats();
  res.json({ stats });
});

app.post('/api/faculty/practicals', authMiddleware, facultyOnly, (req, res) => {
  const user = (req as any).user as User;
  const {
    title,
    problemStatement,
    requirements,
    instructions,
    starterCode,
    inputContract,
    maxMarks = 10,
    timeLimitSeconds = 3,
    memoryLimitMb = 256,
    allowResubmission = true,
    deadline
  } = req.body;

  if (!title || !problemStatement) {
    return res.status(400).json({ error: 'Title and problem statement are required' });
  }

  const created = db.createPractical({
    title,
    problemStatement,
    requirements: requirements || [],
    instructions: instructions || '',
    starterCode: starterCode || 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Code here\n    }\n}',
    inputContract: inputContract || '',
    maxMarks: Number(maxMarks),
    timeLimitSeconds: Number(timeLimitSeconds),
    memoryLimitMb: Number(memoryLimitMb),
    allowResubmission: Boolean(allowResubmission),
    deadline: deadline || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
  });

  db.recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PRACTICAL_CREATED',
    details: `Created practical: P${created.id} - ${created.title}`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ practical: created });
});

app.put('/api/faculty/practicals/:id', authMiddleware, facultyOnly, (req, res) => {
  const user = (req as any).user as User;
  const id = parseInt(req.params.id, 10);
  const updated = db.updatePractical(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  db.recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PRACTICAL_UPDATED',
    details: `Updated practical P${id} (${updated.title})`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ practical: updated });
});

app.delete('/api/faculty/practicals/:id', authMiddleware, facultyOnly, (req, res) => {
  const user = (req as any).user as User;
  const id = parseInt(req.params.id, 10);
  const deleted = db.deletePractical(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  db.recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PRACTICAL_DELETED',
    details: `Deleted practical P${id}`,
    status: 'WARNING',
    ipAddress: getClientIp(req)
  });

  res.json({ success: true });
});

// Test cases
app.post('/api/faculty/practicals/:id/test-cases', authMiddleware, facultyOnly, (req, res) => {
  const practicalId = parseInt(req.params.id, 10);
  const { input, expectedOutput, marks = 2, isHidden = false } = req.body;

  if (input === undefined || expectedOutput === undefined) {
    return res.status(400).json({ error: 'Input and expected output are required' });
  }

  const testCase = db.addTestCase(practicalId, {
    input,
    expectedOutput,
    marks: Number(marks),
    isHidden: Boolean(isHidden),
    orderIndex: 0
  });

  if (!testCase) {
    return res.status(404).json({ error: 'Practical not found' });
  }

  res.json({ testCase });
});

app.put('/api/faculty/practicals/:id/test-cases/:tcId', authMiddleware, facultyOnly, (req, res) => {
  const practicalId = parseInt(req.params.id, 10);
  const tcId = req.params.tcId;
  const updated = db.updateTestCase(practicalId, tcId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Test case or practical not found' });
  }
  res.json({ testCase: updated });
});

app.delete('/api/faculty/practicals/:id/test-cases/:tcId', authMiddleware, facultyOnly, (req, res) => {
  const practicalId = parseInt(req.params.id, 10);
  const tcId = req.params.tcId;
  const deleted = db.deleteTestCase(practicalId, tcId);
  if (!deleted) {
    return res.status(404).json({ error: 'Test case not found' });
  }
  res.json({ success: true });
});

// Evaluate submission
app.post('/api/faculty/submissions/:id/evaluate', authMiddleware, facultyOnly, (req, res) => {
  const user = (req as any).user as User;
  const { facultyScore, remarks } = req.body;

  if (facultyScore === undefined || isNaN(Number(facultyScore))) {
    return res.status(400).json({ error: 'Valid faculty score is required' });
  }

  const evaluated = db.evaluateSubmission(req.params.id, Number(facultyScore), remarks || '');
  if (!evaluated) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  db.recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SUBMISSION_EVALUATED',
    details: `Evaluated ${evaluated.studentName} (Roll ${evaluated.rollNumber}) for ${evaluated.practicalTitle}. Score: ${facultyScore}`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ submission: evaluated });
});

// Export CSV
app.get('/api/faculty/export/csv', authMiddleware, facultyOnly, (req, res) => {
  const rows = db.getStudentReportRows();
  const practicals = db.getPracticals();

  const practicalHeaders = practicals.map(p => `P${p.id} (${p.title.slice(0, 15)})`).join(',');
  let csv = `Roll No,Student Name,Batch,${practicalHeaders},Total Score,Max Possible,Average\n`;

  for (const row of rows) {
    const pScores = practicals.map(p => {
      const score = row.scores[p.id];
      return score !== null && score !== undefined ? score : '-';
    }).join(',');

    csv += `"${row.rollNumber}","${row.name}","${row.batch}",${pScores},${row.totalScore},${row.maxPossibleScore},${row.averageScore}\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="tcet_practical_evaluation_report.csv"');
  res.send(csv);
});

// Students list for faculty evaluation ledger
app.get('/api/faculty/students', authenticateUser, facultyOnly, (req, res) => {
  const students = db.getUsers().filter(u => u.role.toUpperCase() === 'STUDENT');
  res.json({ students });
});

// ---------------- ADMIN ROUTES ----------------

// Dashboard statistics
app.get('/api/admin/dashboard', authMiddleware, adminOnly, (req, res) => {
  const stats = db.getAdminDashboardStats(sessions.size);
  res.json({ stats });
});

// User Management
app.get('/api/admin/users', authMiddleware, adminOnly, (req, res) => {
  let users = db.getUsers();
  const { role, batch, status, search } = req.query;

  if (role && typeof role === 'string' && role !== 'all') {
    users = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  if (batch && typeof batch === 'string' && batch !== 'all') {
    users = users.filter(u => u.batch === batch);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    const isActive = status === 'active';
    users = users.filter(u => u.isActive === isActive);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    users = users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  }

  res.json({ users });
});

app.post('/api/admin/users', authMiddleware, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const { name, email, role, plainPassword, rollNumber, batch, division, department } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const result = db.createUser({
    name,
    email,
    role,
    plainPassword,
    rollNumber,
    batch,
    division,
    department
  });

  if (result.error || !result.user) {
    return res.status(400).json({ error: result.error });
  }

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'USER_CREATED',
    details: `Created new ${result.user.role.toUpperCase()} account: ${result.user.name} (${result.user.email})`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.status(201).json({ user: result.user });
});

app.put('/api/admin/users/:id', authMiddleware, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const result = db.updateUser(req.params.id, req.body);
  if (result.error || !result.user) {
    return res.status(400).json({ error: result.error });
  }

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'USER_UPDATED',
    details: `Updated details for ${result.user.name} (${result.user.email})`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ user: result.user });
});

app.delete('/api/admin/users/:id', authMiddleware, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const targetId = req.params.id;

  if (adminUser.id === targetId) {
    return res.status(400).json({ error: 'Cannot delete your own administrator account.' });
  }

  const targetUser = db.getUserById(targetId);
  const result = db.deleteUser(targetId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'USER_STATUS_TOGGLED',
    details: `Deleted account for ${targetUser?.name || targetId}`,
    status: 'WARNING',
    ipAddress: getClientIp(req)
  });

  res.json({ success: true });
});

app.post('/api/admin/users/:id/toggle-status', authMiddleware, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const result = db.toggleUserStatus(req.params.id);
  if (result.error || !result.user) {
    return res.status(400).json({ error: result.error });
  }

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'USER_STATUS_TOGGLED',
    details: `${result.user.isActive ? 'Activated' : 'Deactivated'} account for ${result.user.name} (${result.user.email})`,
    status: result.user.isActive ? 'SUCCESS' : 'WARNING',
    ipAddress: getClientIp(req)
  });

  res.json({ user: result.user });
});

app.post('/api/admin/users/:id/reset-password', authMiddleware, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const { newPassword } = req.body;
  const result = db.resetUserPassword(req.params.id, newPassword);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const target = db.getUserById(req.params.id);

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'PASSWORD_RESET',
    details: `Administrator reset password for ${target?.name || req.params.id}`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({
    success: true,
    tempPassword: result.tempPassword,
    message: `Password reset successfully for ${target?.name}.`
  });
});

// Courses Management
app.get('/api/admin/courses', authenticateUser, adminOnly, (req, res) => {
  res.json({ courses: db.getCourses() });
});

app.post('/api/admin/courses', authenticateUser, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const { code, name, department, semester, academicYear, facultyId, facultyName, description, isActive } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: 'Course code and name are required' });
  }

  const created = db.createCourse({
    code,
    name,
    department: department || 'Computer Engineering',
    semester: Number(semester) || 3,
    academicYear: academicYear || '2026-27',
    facultyId: facultyId || 'usr-faculty-1',
    facultyName: facultyName || 'Dr. Priya Kulkarni',
    description: description || '',
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'ADMIN',
    action: 'COURSE_CREATED',
    details: `Created academic course: ${created.code} - ${created.name}`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.status(201).json({ course: created });
});

app.put('/api/admin/courses/:id', authenticateUser, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Course not found' });
  }

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'ADMIN',
    action: 'COURSE_UPDATED',
    details: `Updated course ${updated.code}`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.json({ course: updated });
});

app.delete('/api/admin/courses/:id', authenticateUser, adminOnly, (req, res) => {
  const deleted = db.deleteCourse(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Course not found' });
  res.json({ success: true });
});

// Batches Management
app.get('/api/admin/batches', authenticateUser, adminOnly, (req, res) => {
  res.json({ batches: db.getBatches() });
});

app.post('/api/admin/batches', authenticateUser, adminOnly, (req, res) => {
  const adminUser = (req as any).user as User;
  const { name, courseId, division, facultyId, facultyName, studentCount, academicYear } = req.body;

  if (!name || !courseId) {
    return res.status(400).json({ error: 'Batch name and course ID are required' });
  }

  const created = db.createBatch({
    name,
    courseId,
    division: division || 'A',
    facultyId: facultyId || 'usr-faculty-1',
    facultyName: facultyName || 'Dr. Priya Kulkarni',
    studentCount: Number(studentCount) || 24,
    academicYear: academicYear || '2026-27'
  });

  db.recordAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: 'ADMIN',
    action: 'BATCH_CREATED',
    details: `Configured lab batch: ${created.name} (${created.division})`,
    status: 'SUCCESS',
    ipAddress: getClientIp(req)
  });

  res.status(201).json({ batch: created });
});

app.put('/api/admin/batches/:id', authMiddleware, adminOnly, (req, res) => {
  const updated = db.updateBatch(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Batch not found' });
  res.json({ batch: updated });
});

app.delete('/api/admin/batches/:id', authMiddleware, adminOnly, (req, res) => {
  const deleted = db.deleteBatch(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Batch not found' });
  res.json({ success: true });
});

// Audit Logs
app.get('/api/admin/audit-logs', authMiddleware, adminOnly, (req, res) => {
  const { action, role, search } = req.query;
  const logs = db.getAuditLogs({
    action: typeof action === 'string' && action !== 'all' ? action : undefined,
    role: typeof role === 'string' && role !== 'all' ? role : undefined,
    search: typeof search === 'string' ? search : undefined
  });
  res.json({ logs });
});

// System health monitor
app.get('/api/admin/system-health', authMiddleware, adminOnly, (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    health: {
      status: 'OPERATIONAL',
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024))
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      activeSessions: sessions.size,
      databaseRecords: {
        users: db.getUsers().length,
        practicals: db.getPracticals().length,
        submissions: db.getSubmissions().length,
        courses: db.getCourses().length,
        batches: db.getBatches().length
      }
    }
  });
});

// ---------------- VITE & STATIC FILES ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TCET Practical Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
