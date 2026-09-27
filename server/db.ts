import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  Practical, 
  TestCase, 
  User, 
  Submission, 
  FacultyDashboardStats, 
  StudentReportRow, 
  Course, 
  Batch, 
  AuditLog, 
  AdminDashboardStats 
} from '../src/types';
import { SEED_PRACTICALS, INITIAL_SUBMISSIONS } from './seedData';

export interface DbUser extends User {
  passwordHash: string;
}

interface DbSchema {
  users: DbUser[];
  practicals: Practical[];
  submissions: Submission[];
  courses: Course[];
  batches: Batch[];
  auditLogs: AuditLog[];
  resetTokens: { email: string; token: string; expiresAt: string }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const SALT_ROUNDS = 10;

export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

export function comparePassword(plainText: string, hash: string): boolean {
  try {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compareSync(plainText, hash);
    }
    // Fallback for legacy plaintext during migration
    return plainText === hash;
  } catch (err) {
    return false;
  }
}

const INITIAL_COURSES: Course[] = [
  {
    id: 'course-csc301',
    code: 'CSC301',
    name: 'Data Structures & Algorithms Lab',
    department: 'Computer Engineering',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'usr-faculty-1',
    facultyName: 'Dr. Priya Kulkarni',
    description: 'Core laboratory course covering Stacks, Queues, Linked Lists, Trees, Graphs, Sorting, and Searching implementations in Java.',
    isActive: true
  },
  {
    id: 'course-csc402',
    code: 'CSC402',
    name: 'Analysis of Algorithms Lab',
    department: 'Computer Engineering',
    semester: 4,
    academicYear: '2026-27',
    facultyId: 'usr-faculty-1',
    facultyName: 'Dr. Priya Kulkarni',
    description: 'Advanced algorithmic paradigms including Divide & Conquer, Dynamic Programming, and Greedy approaches.',
    isActive: true
  }
];

const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-se-a1',
    name: 'SE-A1',
    courseId: 'course-csc301',
    division: 'A',
    facultyId: 'usr-faculty-1',
    facultyName: 'Dr. Priya Kulkarni',
    studentCount: 24,
    academicYear: '2026-27'
  },
  {
    id: 'batch-se-a2',
    name: 'SE-A2',
    courseId: 'course-csc301',
    division: 'A',
    facultyId: 'usr-faculty-1',
    facultyName: 'Dr. Priya Kulkarni',
    studentCount: 24,
    academicYear: '2026-27'
  },
  {
    id: 'batch-se-a3',
    name: 'SE-A3',
    courseId: 'course-csc301',
    division: 'A',
    facultyId: 'usr-faculty-1',
    facultyName: 'Dr. Priya Kulkarni',
    studentCount: 24,
    academicYear: '2026-27'
  }
];

function getInitialUsers(): DbUser[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'usr-admin-1',
      name: 'System Administrator',
      fullName: 'System Administrator',
      email: 'admin@tcet.edu.in',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
      department: 'Computer Engineering (Admin)',
      isActive: true,
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: now,
      lastLoginAt: '2026-09-24T09:30:00.000Z',
      failedLoginAttempts: 0
    },
    {
      id: 'usr-faculty-1',
      name: 'Dr. Priya Kulkarni',
      fullName: 'Dr. Priya Kulkarni',
      email: 'priya.kulkarni@tcet.edu.in',
      passwordHash: hashPassword('faculty123'),
      role: 'FACULTY',
      department: 'Department of Computer Engineering',
      isActive: true,
      createdAt: '2026-08-01T08:30:00.000Z',
      updatedAt: now,
      lastLoginAt: '2026-09-24T09:45:00.000Z',
      failedLoginAttempts: 0
    },
    {
      id: 'usr-student-1',
      name: 'Aarav Mehta',
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@tcet.edu.in',
      passwordHash: hashPassword('student123'),
      role: 'STUDENT',
      rollNumber: '42',
      batch: 'SE-A1',
      division: 'A',
      department: 'Computer Engineering',
      isActive: true,
      createdAt: '2026-08-10T10:00:00.000Z',
      updatedAt: now,
      lastLoginAt: '2026-09-24T10:00:00.000Z',
      failedLoginAttempts: 0
    },
    {
      id: 'usr-student-2',
      name: 'Isha Patil',
      fullName: 'Isha Patil',
      email: 'isha.patil@tcet.edu.in',
      passwordHash: hashPassword('student123'),
      role: 'STUDENT',
      rollNumber: '43',
      batch: 'SE-A1',
      division: 'A',
      department: 'Computer Engineering',
      isActive: true,
      createdAt: '2026-08-10T10:05:00.000Z',
      updatedAt: now,
      lastLoginAt: '2026-09-23T14:15:00.000Z',
      failedLoginAttempts: 0
    },
    {
      id: 'usr-student-3',
      name: 'Rohan Deshmukh',
      fullName: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@tcet.edu.in',
      passwordHash: hashPassword('student123'),
      role: 'STUDENT',
      rollNumber: '44',
      batch: 'SE-A2',
      division: 'A',
      department: 'Computer Engineering',
      isActive: true,
      createdAt: '2026-08-10T10:10:00.000Z',
      updatedAt: now,
      lastLoginAt: '2026-09-22T11:00:00.000Z',
      failedLoginAttempts: 0
    }
  ];
}

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    userId: 'usr-admin-1',
    userName: 'Dr. Sanjeev Kumar',
    userRole: 'admin',
    action: 'LOGIN_SUCCESS',
    details: 'System administrator session authenticated via institutional portal',
    status: 'SUCCESS'
  },
  {
    id: 'log-seed-2',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    userId: 'usr-faculty-1',
    userName: 'Prof. Amit Sharma',
    userRole: 'faculty',
    action: 'PRACTICAL_UPDATED',
    details: 'Configured test cases and time limits for Practical 1 (Stack Array)',
    status: 'SUCCESS'
  },
  {
    id: 'log-seed-3',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: 'usr-student-1',
    userName: 'Rahul Sharma',
    userRole: 'student',
    action: 'LOGIN_SUCCESS',
    details: 'Student authenticated from institutional subnet (Batch SE-A1)',
    status: 'SUCCESS'
  },
  {
    id: 'log-seed-4',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'usr-student-1',
    userName: 'Rahul Sharma',
    userRole: 'student',
    action: 'SUBMISSION_CREATED',
    details: 'Submitted Java source code for Practical 1 (Stack Using Array). Automated score: 10/10.',
    status: 'SUCCESS'
  }
];

class DatabaseManager {
  private data: DbSchema = {
    users: [],
    practicals: [],
    submissions: [],
    courses: [],
    batches: [],
    auditLogs: [],
    resetTokens: []
  };
  private isLoaded = false;
  private serverStartTime = Date.now();

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(content);
        
        // Migrate & normalize users
        let users: DbUser[] = (parsed.users || []).map((u: any) => {
          let pHash = u.passwordHash;
          if (!pHash.startsWith('$2a$') && !pHash.startsWith('$2b$')) {
            pHash = hashPassword(pHash);
          }
          return {
            ...u,
            fullName: u.fullName || u.name,
            passwordHash: pHash,
            isActive: u.isActive !== undefined ? u.isActive : true,
            createdAt: u.createdAt || new Date().toISOString(),
            updatedAt: u.updatedAt || new Date().toISOString(),
            lastLoginAt: u.lastLoginAt || null,
            failedLoginAttempts: u.failedLoginAttempts || 0,
            lockedUntil: u.lockedUntil || null
          };
        });

        // Ensure Admin user exists
        const adminExists = users.some(u => u.role?.toLowerCase() === 'admin' || u.email === 'admin@tcet.edu.in');
        if (!adminExists) {
          const defaultUsers = getInitialUsers();
          users.unshift(defaultUsers[0]);
        }

        // Ensure canonical users are present and strict 5-user dataset is maintained
        const hasAarav = users.some(u => u.email.toLowerCase() === 'aarav.mehta@tcet.edu.in');
        const hasPriya = users.some(u => u.email.toLowerCase() === 'priya.kulkarni@tcet.edu.in');
        if (!hasAarav || !hasPriya || users.length !== 5) {
          users = getInitialUsers();
        }

        this.data = {
          users,
          practicals: parsed.practicals && parsed.practicals.length > 0 ? parsed.practicals : JSON.parse(JSON.stringify(SEED_PRACTICALS)),
          submissions: parsed.submissions && parsed.submissions.length > 0 ? parsed.submissions : JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)),
          courses: INITIAL_COURSES,
          batches: INITIAL_BATCHES,
          auditLogs: parsed.auditLogs && parsed.auditLogs.length > 0 ? parsed.auditLogs : INITIAL_LOGS,
          resetTokens: parsed.resetTokens || []
        };
        this.persist();
      } else {
        // Seed initial data
        this.data = {
          users: getInitialUsers(),
          practicals: JSON.parse(JSON.stringify(SEED_PRACTICALS)),
          submissions: JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)),
          courses: INITIAL_COURSES,
          batches: INITIAL_BATCHES,
          auditLogs: INITIAL_LOGS,
          resetTokens: []
        };
        this.persist();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error initializing database file, initializing with full seed:', err);
      this.data = {
        users: getInitialUsers(),
        practicals: JSON.parse(JSON.stringify(SEED_PRACTICALS)),
        submissions: JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)),
        courses: INITIAL_COURSES,
        batches: INITIAL_BATCHES,
        auditLogs: INITIAL_LOGS,
        resetTokens: []
      };
      this.persist();
      this.isLoaded = true;
    }
  }

  public seed(): void {
    this.data = {
      users: getInitialUsers(),
      practicals: JSON.parse(JSON.stringify(SEED_PRACTICALS)),
      submissions: JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)),
      courses: INITIAL_COURSES,
      batches: INITIAL_BATCHES,
      auditLogs: INITIAL_LOGS,
      resetTokens: []
    };
    this.persist();
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  // --- USER MANAGEMENT ---

  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  public getRoleCounts(): Record<string, number> {
    const counts: Record<string, number> = { STUDENT: 0, FACULTY: 0, ADMIN: 0 };
    for (const u of this.data.users) {
      const r = u.role.toUpperCase();
      counts[r] = (counts[r] || 0) + 1;
    }
    return counts;
  }

  public getUserByEmail(email: string): DbUser | undefined {
    let clean = email.toLowerCase().trim();
    if (clean === 'student@tcet.edu.in') clean = 'aarav.mehta@tcet.edu.in';
    if (clean === 'faculty@tcet.edu.in') clean = 'priya.kulkarni@tcet.edu.in';
    return this.data.users.find(u => u.email.toLowerCase() === clean);
  }

  public getUserById(id: string): User | undefined {
    const u = this.data.users.find(user => user.id === id);
    if (!u) return undefined;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  }

  public getRawUserById(id: string): DbUser | undefined {
    return this.data.users.find(user => user.id === id);
  }

  public createUser(userData: {
    name: string;
    fullName?: string;
    email: string;
    role: 'student' | 'faculty' | 'admin';
    plainPassword?: string;
    rollNumber?: string;
    batch?: string;
    division?: string;
    department?: string;
  }): { user?: User; error?: string } {
    const emailNorm = userData.email.toLowerCase().trim();
    if (this.getUserByEmail(emailNorm)) {
      return { error: 'A user with this email address already exists in TCET Practical Lab.' };
    }

    const plainPass = userData.plainPassword || (userData.role === 'admin' ? 'admin123' : userData.role === 'faculty' ? 'faculty123' : 'student123');
    const now = new Date().toISOString();
    const id = `usr-${userData.role}-${Date.now().toString(36)}`;

    const newUser: DbUser = {
      id,
      name: userData.name.trim(),
      fullName: userData.fullName?.trim() || userData.name.trim(),
      email: emailNorm,
      passwordHash: hashPassword(plainPass),
      role: userData.role,
      rollNumber: userData.rollNumber?.trim(),
      batch: userData.batch?.trim(),
      division: userData.division?.trim(),
      department: userData.department?.trim() || 'Computer Engineering',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      failedLoginAttempts: 0
    };

    this.data.users.push(newUser);
    this.persist();

    const { passwordHash, ...safeUser } = newUser;
    return { user: safeUser };
  }

  public updateUser(id: string, updates: Partial<User & { plainPassword?: string }>): { user?: User; error?: string } {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return { error: 'User not found' };

    const existing = this.data.users[idx];

    // If updating email, check uniqueness
    if (updates.email && updates.email.toLowerCase().trim() !== existing.email.toLowerCase().trim()) {
      const exists = this.getUserByEmail(updates.email.toLowerCase().trim());
      if (exists && exists.id !== id) {
        return { error: 'Email is already assigned to another user.' };
      }
    }

    let passwordHash = existing.passwordHash;
    if (updates.plainPassword && updates.plainPassword.trim()) {
      passwordHash = hashPassword(updates.plainPassword.trim());
    }

    const updatedUser: DbUser = {
      ...existing,
      ...updates,
      id, // protect ID
      passwordHash,
      updatedAt: new Date().toISOString()
    };

    this.data.users[idx] = updatedUser;
    this.persist();

    const { passwordHash: _, ...safeUser } = updatedUser;
    return { user: safeUser };
  }

  public toggleUserStatus(id: string): { user?: User; error?: string } {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return { error: 'User not found' };

    const user = this.data.users[idx];
    // Safeguard: cannot deactivate last active admin
    if (user.role === 'admin' && user.isActive) {
      const activeAdmins = this.data.users.filter(u => u.role === 'admin' && u.isActive);
      if (activeAdmins.length <= 1) {
        return { error: 'Security constraint: Cannot deactivate the primary system administrator.' };
      }
    }

    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();
    this.persist();

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser };
  }

  public resetUserPassword(id: string, newPlainPassword?: string): { success: boolean; tempPassword?: string; error?: string } {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return { success: false, error: 'User not found' };

    const passToSet = newPlainPassword && newPlainPassword.trim() 
      ? newPlainPassword.trim() 
      : `tcet_${Math.random().toString(36).substring(2, 8)}#26`;

    user.passwordHash = hashPassword(passToSet);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.updatedAt = new Date().toISOString();
    this.persist();

    return { success: true, tempPassword: passToSet };
  }

  public deleteUser(id: string): { success: boolean; error?: string } {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return { success: false, error: 'User not found' };

    if (user.role === 'admin') {
      const adminCount = this.data.users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Security constraint: Cannot delete the only system administrator.' };
      }
    }

    this.data.users = this.data.users.filter(u => u.id !== id);
    this.persist();
    return { success: true };
  }

  // --- LOGIN ATTEMPTS & RATE LIMITING PROTECTION ---

  public recordFailedLogin(email: string): { isLocked: boolean; attempts: number; minutesRemaining?: number } {
    const user = this.getUserByEmail(email);
    if (!user) return { isLocked: false, attempts: 1 };

    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    let isLocked = false;
    let minutesRemaining = 0;

    // Lock account after 5 consecutive failed attempts for 15 minutes
    if (user.failedLoginAttempts >= 5) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.lockedUntil = lockUntil.toISOString();
      isLocked = true;
      minutesRemaining = 15;
    }

    this.persist();
    return { isLocked, attempts: user.failedLoginAttempts, minutesRemaining };
  }

  public checkAccountLock(email: string): { isLocked: boolean; minutesRemaining?: number } {
    const user = this.getUserByEmail(email);
    if (!user || !user.lockedUntil) return { isLocked: false };

    const lockTime = new Date(user.lockedUntil).getTime();
    const now = Date.now();
    if (now < lockTime) {
      const minutesRemaining = Math.ceil((lockTime - now) / 60000);
      return { isLocked: true, minutesRemaining };
    }

    // Lock has expired; reset
    user.lockedUntil = null;
    user.failedLoginAttempts = 0;
    this.persist();
    return { isLocked: false };
  }

  public recordSuccessfulLogin(email: string): void {
    const user = this.getUserByEmail(email);
    if (!user) return;

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date().toISOString();
    this.persist();
  }

  // --- AUDIT LOGS ---

  public recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(newLog);
    // Keep last 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.persist();
    return newLog;
  }

  public getAuditLogs(filters?: { action?: string; role?: string; search?: string }): AuditLog[] {
    let list = [...this.data.auditLogs];
    if (filters?.action) {
      list = list.filter(l => l.action === filters.action);
    }
    if (filters?.role) {
      list = list.filter(l => l.userRole.toLowerCase() === filters.role!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(l => 
        l.userName.toLowerCase().includes(q) || 
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // --- COURSES & BATCHES ---

  public getCourses(): Course[] {
    return this.data.courses || [];
  }

  public createCourse(course: Omit<Course, 'id'>): Course {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now().toString(36)}`
    };
    if (!this.data.courses) this.data.courses = [];
    this.data.courses.push(newCourse);
    this.persist();
    return newCourse;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    if (!this.data.courses) return null;
    const idx = this.data.courses.findIndex(c => c.id === id);
    if (idx === -1) return null;

    this.data.courses[idx] = { ...this.data.courses[idx], ...updates, id };
    this.persist();
    return this.data.courses[idx];
  }

  public deleteCourse(id: string): boolean {
    if (!this.data.courses) return false;
    const len = this.data.courses.length;
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    if (this.data.courses.length !== len) {
      this.persist();
      return true;
    }
    return false;
  }

  public getBatches(): Batch[] {
    return this.data.batches || [];
  }

  public createBatch(batch: Omit<Batch, 'id'>): Batch {
    const newBatch: Batch = {
      ...batch,
      id: `batch-${Date.now().toString(36)}`
    };
    if (!this.data.batches) this.data.batches = [];
    this.data.batches.push(newBatch);
    this.persist();
    return newBatch;
  }

  public updateBatch(id: string, updates: Partial<Batch>): Batch | null {
    if (!this.data.batches) return null;
    const idx = this.data.batches.findIndex(b => b.id === id);
    if (idx === -1) return null;

    this.data.batches[idx] = { ...this.data.batches[idx], ...updates, id };
    this.persist();
    return this.data.batches[idx];
  }

  public deleteBatch(id: string): boolean {
    if (!this.data.batches) return false;
    const len = this.data.batches.length;
    this.data.batches = this.data.batches.filter(b => b.id !== id);
    if (this.data.batches.length !== len) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- ADMIN STATS ---

  public getAdminDashboardStats(activeSessionsCount: number): AdminDashboardStats {
    const users = this.data.users;
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalFaculty = users.filter(u => u.role === 'faculty').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    
    const totalPracticals = this.data.practicals.length;
    const totalSubmissions = this.data.submissions.length;
    const evaluatedSubmissions = this.data.submissions.filter(s => s.status === 'EVALUATED').length;
    const pendingEvaluations = this.data.submissions.filter(s => s.status === 'SUBMITTED').length;
    const systemUptime = Math.floor((Date.now() - this.serverStartTime) / 1000);

    return {
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      totalPracticals,
      totalSubmissions,
      evaluatedSubmissions,
      pendingEvaluations,
      systemUptime,
      activeSessionsCount
    };
  }

  // --- PRACTICALS ---

  public getPracticals(): Practical[] {
    return this.data.practicals;
  }

  public getPracticalById(id: number): Practical | undefined {
    return this.data.practicals.find(p => p.id === id);
  }

  public createPractical(data: Omit<Practical, 'id'>): Practical {
    const nextId = this.data.practicals.length > 0 
      ? Math.max(...this.data.practicals.map(p => p.id)) + 1 
      : 1;
    const newPractical: Practical = {
      ...data,
      id: nextId,
      testCases: data.testCases || []
    };
    this.data.practicals.push(newPractical);
    this.persist();
    return newPractical;
  }

  public updatePractical(id: number, updates: Partial<Practical>): Practical | null {
    const index = this.data.practicals.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.practicals[index] = {
      ...this.data.practicals[index],
      ...updates,
      id // preserve ID
    };
    this.persist();
    return this.data.practicals[index];
  }

  public deletePractical(id: number): boolean {
    const initialLen = this.data.practicals.length;
    this.data.practicals = this.data.practicals.filter(p => p.id !== id);
    if (this.data.practicals.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public addTestCase(practicalId: number, tc: Omit<TestCase, 'id' | 'practicalId'>): TestCase | null {
    const practical = this.data.practicals.find(p => p.id === practicalId);
    if (!practical) return null;

    if (!practical.testCases) practical.testCases = [];
    const newTestCase: TestCase = {
      ...tc,
      id: `tc-${practicalId}-${Date.now().toString(36)}`,
      practicalId,
      orderIndex: practical.testCases.length + 1
    };
    practical.testCases.push(newTestCase);
    this.persist();
    return newTestCase;
  }

  public updateTestCase(practicalId: number, testCaseId: string, updates: Partial<TestCase>): TestCase | null {
    const practical = this.data.practicals.find(p => p.id === practicalId);
    if (!practical || !practical.testCases) return null;

    const tcIndex = practical.testCases.findIndex(tc => tc.id === testCaseId);
    if (tcIndex === -1) return null;

    practical.testCases[tcIndex] = {
      ...practical.testCases[tcIndex],
      ...updates,
      id: testCaseId,
      practicalId
    };
    this.persist();
    return practical.testCases[tcIndex];
  }

  public deleteTestCase(practicalId: number, testCaseId: string): boolean {
    const practical = this.data.practicals.find(p => p.id === practicalId);
    if (!practical || !practical.testCases) return false;

    const initialLen = practical.testCases.length;
    practical.testCases = practical.testCases.filter(tc => tc.id !== testCaseId);
    if (practical.testCases.length !== initialLen) {
      practical.testCases.forEach((tc, idx) => {
        tc.orderIndex = idx + 1;
      });
      this.persist();
      return true;
    }
    return false;
  }

  // --- SUBMISSIONS ---

  public getSubmissions(filters?: { studentId?: string; practicalId?: number }): Submission[] {
    let list = [...this.data.submissions];
    if (filters?.studentId) {
      list = list.filter(s => s.studentId === filters.studentId);
    }
    if (filters?.practicalId !== undefined) {
      list = list.filter(s => s.practicalId === filters.practicalId);
    }
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public getSubmissionById(id: string): Submission | undefined {
    return this.data.submissions.find(s => s.id === id);
  }

  public getLatestStudentSubmission(studentId: string, practicalId: number): Submission | undefined {
    const studentSubs = this.data.submissions
      .filter(s => s.studentId === studentId && s.practicalId === practicalId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return studentSubs[0];
  }

  public saveSubmission(submission: Submission): Submission {
    const idx = this.data.submissions.findIndex(s => s.id === submission.id);
    if (idx !== -1) {
      this.data.submissions[idx] = submission;
    } else {
      this.data.submissions.push(submission);
    }
    this.persist();
    return submission;
  }

  public evaluateSubmission(id: string, facultyScore: number, facultyRemarks: string): Submission | null {
    const sub = this.data.submissions.find(s => s.id === id);
    if (!sub) return null;

    sub.facultyScore = facultyScore;
    sub.finalScore = facultyScore;
    sub.facultyRemarks = facultyRemarks;
    sub.status = 'EVALUATED';
    sub.evaluatedAt = new Date().toISOString();

    this.persist();
    return sub;
  }

  // --- FACULTY STATS & REPORTS ---

  public getFacultyDashboardStats(): FacultyDashboardStats {
    const students = this.data.users.filter(u => u.role === 'student');
    const totalStudents = students.length;
    const totalPracticals = this.data.practicals.length;
    const totalSubmissions = this.data.submissions.length;
    const pendingEvaluations = this.data.submissions.filter(s => s.status === 'SUBMITTED').length;

    const practicalStats = this.data.practicals.map(p => {
      const subs = this.data.submissions.filter(s => s.practicalId === p.id);
      const evaluated = subs.filter(s => s.status === 'EVALUATED');
      const pending = subs.filter(s => s.status === 'SUBMITTED');
      
      const avgScore = evaluated.length > 0
        ? evaluated.reduce((sum, s) => sum + (s.finalScore ?? s.autoScore), 0) / evaluated.length
        : 0;

      return {
        practicalId: p.id,
        title: p.title,
        totalStudents,
        submittedCount: subs.length,
        evaluatedCount: evaluated.length,
        pendingCount: pending.length,
        averageScore: Number(avgScore.toFixed(1)),
        maxMarks: p.maxMarks
      };
    });

    return {
      totalStudents,
      totalPracticals,
      totalSubmissions,
      pendingEvaluations,
      practicalStats
    };
  }

  public getStudentReportRows(): StudentReportRow[] {
    const students = this.data.users.filter(u => u.role === 'student');
    const practicals = this.data.practicals;
    const maxPossibleTotal = practicals.reduce((sum, p) => sum + p.maxMarks, 0);

    return students.map(student => {
      const scores: Record<number, number | null> = {};
      let totalScore = 0;
      let completedCount = 0;

      for (const p of practicals) {
        const sub = this.getLatestStudentSubmission(student.id, p.id);
        if (sub) {
          const score = sub.finalScore !== null ? sub.finalScore : sub.autoScore;
          scores[p.id] = score;
          totalScore += score;
          completedCount++;
        } else {
          scores[p.id] = null;
        }
      }

      const avg = practicals.length > 0 ? totalScore / practicals.length : 0;

      return {
        studentId: student.id,
        rollNumber: student.rollNumber || 'N/A',
        name: student.name,
        batch: student.batch || 'SE-A',
        scores,
        totalScore,
        maxPossibleScore: maxPossibleTotal,
        averageScore: Number(avg.toFixed(1)),
        completedPracticalsCount: completedCount
      };
    });
  }
}

export const db = new DatabaseManager();
