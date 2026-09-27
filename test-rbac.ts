/**
 * Automated RBAC Verification Test Suite for TCET Practical Lab
 * Tests all authorization boundaries specified in the prompt.
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

interface TestResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: TestResult[] = [];

function record(name: string, expected: string, actual: string, passed: boolean) {
  results.push({ name, expected, actual, passed });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} | ${name} | Expected: ${expected} | Actual: ${actual}`);
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`Starting TCET Practical Lab RBAC Security Verification`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // Wait for server readiness if needed
  let ready = false;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) { ready = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!ready) {
    console.error('Server is not reachable at ' + BASE_URL);
    process.exit(1);
  }

  // Helper login
  async function login(email: string, pass: string, extraBody?: any) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, ...extraBody })
    });
    const status = res.status;
    const data = await res.json().catch(() => ({}));
    return { status, data, token: data.token as string | undefined, user: data.user };
  }

  // --- TEST 1: Student Login & Boundaries ---
  console.log('\n--- 1. Testing Student Role Boundaries ---');
  const studentAuth = await login('aarav.mehta@tcet.edu.in', 'student123');
  record('Student Login Authentication', 'Status 200', `Status ${studentAuth.status}`, studentAuth.status === 200);

  const studentToken = studentAuth.token || '';

  const sDash = await fetch(`${BASE_URL}/api/student/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('Student -> /api/student/dashboard', '200 OK', `${sDash.status}`, sDash.status === 200);

  const sFacDash = await fetch(`${BASE_URL}/api/faculty/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('Student -> /api/faculty/dashboard', '403 Forbidden', `${sFacDash.status}`, sFacDash.status === 403);

  const sAdmDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('Student -> /api/admin/dashboard', '403 Forbidden', `${sAdmDash.status}`, sAdmDash.status === 403);

  // --- TEST 2: Faculty Login & Boundaries ---
  console.log('\n--- 2. Testing Faculty Role Boundaries ---');
  const facultyAuth = await login('priya.kulkarni@tcet.edu.in', 'faculty123');
  record('Faculty Login Authentication', 'Status 200', `Status ${facultyAuth.status}`, facultyAuth.status === 200);

  const facultyToken = facultyAuth.token || '';

  const fFacDash = await fetch(`${BASE_URL}/api/faculty/dashboard`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  record('Faculty -> /api/faculty/dashboard', '200 OK', `${fFacDash.status}`, fFacDash.status === 200);

  const fStuDash = await fetch(`${BASE_URL}/api/student/dashboard`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  record('Faculty -> /api/student/dashboard', '403 Forbidden', `${fStuDash.status}`, fStuDash.status === 403);

  const fAdmDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  record('Faculty -> /api/admin/dashboard', '403 Forbidden', `${fAdmDash.status}`, fAdmDash.status === 403);

  // --- TEST 3: Admin Login & Boundaries ---
  console.log('\n--- 3. Testing Admin Role Boundaries ---');
  const adminAuth = await login('admin@tcet.edu.in', 'admin123');
  record('Admin Login Authentication', 'Status 200', `Status ${adminAuth.status}`, adminAuth.status === 200);

  const adminToken = adminAuth.token || '';

  const aAdmDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  record('Admin -> /api/admin/dashboard', '200 OK', `${aAdmDash.status}`, aAdmDash.status === 200);

  const aFacDash = await fetch(`${BASE_URL}/api/faculty/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  record('Admin -> /api/faculty/dashboard', '403 Forbidden', `${aFacDash.status}`, aFacDash.status === 403);

  const aStuDash = await fetch(`${BASE_URL}/api/student/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  record('Admin -> /api/student/dashboard', '403 Forbidden', `${aStuDash.status}`, aStuDash.status === 403);

  // --- TEST 4: Faculty Token Accessing Admin APIs ---
  console.log('\n--- 4. Testing Faculty Token vs Admin Endpoints ---');
  const fAdminUsers = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  record('Faculty -> GET /api/admin/users', '403 Forbidden', `${fAdminUsers.status}`, fAdminUsers.status === 403);

  const fAdminCourses = await fetch(`${BASE_URL}/api/admin/courses`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  record('Faculty -> GET /api/admin/courses', '403 Forbidden', `${fAdminCourses.status}`, fAdminCourses.status === 403);

  // --- TEST 5: Student Token Accessing Faculty Mutation APIs ---
  console.log('\n--- 5. Testing Student Token vs Faculty Endpoints ---');
  const sFacCreate = await fetch(`${BASE_URL}/api/faculty/practicals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Hacked Practical',
      problemStatement: 'Attempt unauthorized creation'
    })
  });
  record('Student -> POST /api/faculty/practicals', '403 Forbidden', `${sFacCreate.status}`, sFacCreate.status === 403);

  // --- TEST 6: Student Data Isolation (Student A vs Student B Submission) ---
  console.log('\n--- 6. Testing Student Data Isolation ---');
  // sub-demo-1 belongs to usr-student-2 (Isha Patil). Student A is usr-student-1 (Aarav Mehta).
  const sIsoRes = await fetch(`${BASE_URL}/api/submissions/sub-demo-1`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('Student A -> Student B Submission (/api/submissions/sub-demo-1)', '403 Forbidden', `${sIsoRes.status}`, sIsoRes.status === 403);

  // Student A viewing own submission
  const sOwnRes = await fetch(`${BASE_URL}/api/submissions/sub-demo-3`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('Student A -> Own Submission (/api/submissions/sub-demo-3)', '200 OK', `${sOwnRes.status}`, sOwnRes.status === 200);

  // --- TEST 7: Role Manipulation Attack ---
  console.log('\n--- 7. Testing Role Manipulation in Login Request ---');
  const tamperAuth = await login('priya.kulkarni@tcet.edu.in', 'faculty123', { role: 'ADMIN' });
  const returnedRole = tamperAuth.user?.role;
  record(
    'Role Manipulation: Attempt login with role="ADMIN"',
    'Role = FACULTY',
    `Role = ${returnedRole}`,
    returnedRole === 'FACULTY'
  );

  // --- TEST 8: Database User Distribution Verification ---
  console.log('\n--- 8. Testing Database Role Counts ---');
  const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const usersData = await adminUsersRes.json();
  const allUsers = usersData.users || [];
  const studentsCount = allUsers.filter((u: any) => u.role.toUpperCase() === 'STUDENT').length;
  const facultyCount = allUsers.filter((u: any) => u.role.toUpperCase() === 'FACULTY').length;
  const adminsCount = allUsers.filter((u: any) => u.role.toUpperCase() === 'ADMIN').length;

  record('Database STUDENT count', '3', `${studentsCount}`, studentsCount === 3);
  record('Database FACULTY count', '1', `${facultyCount}`, facultyCount === 1);
  record('Database ADMIN count', '1', `${adminsCount}`, adminsCount === 1);
  record('Database Total Users count', '5', `${allUsers.length}`, allUsers.length === 5);

  console.log('\n======================================================');
  console.log('RBAC TEST RESULTS SUMMARY');
  console.log('======================================================');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Passed: ${passedCount} / ${totalCount}`);

  if (passedCount === totalCount) {
    console.log('\n🎉 ALL 8 RBAC SECURITY SPECIFICATIONS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error(`\n❌ ${totalCount - passedCount} TESTS FAILED.`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
