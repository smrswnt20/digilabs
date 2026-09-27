import { 
  Practical, 
  Submission, 
  ExecutionResponse, 
  FacultyDashboardStats, 
  User, 
  AdminDashboardStats, 
  Course, 
  Batch, 
  AuditLog 
} from './types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('tcet_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ---------------- AUTH API ----------------

export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Authentication failed');
  }
  return res.json();
}

export async function getMeApi(): Promise<{ user: User }> {
  const res = await fetch('/api/auth/me', {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Session invalid');
  }
  return res.json();
}

export async function logoutApi(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders()
  }).catch(() => {});
}

export async function changePasswordApi(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Password update failed');
  }
  return res.json();
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Password recovery failed');
  }
  return data;
}

export async function getFacultyStudentsApi(): Promise<{ students: User[] }> {
  const res = await fetch('/api/faculty/students', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch students list');
  return res.json();
}

export async function getAllUsersApi(): Promise<{ users: User[] }> {
  const res = await fetch('/api/faculty/students', {
    headers: getAuthHeaders()
  });
  if (!res.ok) return { users: [] };
  const data = await res.json();
  return { users: data.students || [] };
}

// ---------------- PRACTICALS & CODE EXECUTION API ----------------

export async function getPracticalsApi(): Promise<{ practicals: Practical[] }> {
  const res = await fetch('/api/practicals', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch practicals');
  return res.json();
}

export async function getPracticalByIdApi(id: number): Promise<{ practical: Practical }> {
  const res = await fetch(`/api/practicals/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch practical details');
  return res.json();
}

export async function runCodeApi(practicalId: number, sourceCode: string, customInput?: string): Promise<{ result: ExecutionResponse }> {
  const res = await fetch(`/api/practicals/${practicalId}/run`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ sourceCode, customInput })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || err.error || 'Code execution failed');
  }
  return res.json();
}

export async function submitPracticalApi(practicalId: number, sourceCode: string): Promise<{ submission: Submission; executionResult: ExecutionResponse }> {
  const res = await fetch(`/api/practicals/${practicalId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ sourceCode })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || err.error || 'Submission failed');
  }
  return res.json();
}

export async function getSubmissionsApi(filters?: { studentId?: string; practicalId?: number }): Promise<{ submissions: Submission[] }> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('studentId', filters.studentId);
  if (filters?.practicalId) params.append('practicalId', filters.practicalId.toString());

  const res = await fetch(`/api/submissions?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
}

export async function getSubmissionByIdApi(id: string): Promise<{ submission: Submission }> {
  const res = await fetch(`/api/submissions/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch submission details');
  return res.json();
}

// ---------------- FACULTY API ----------------

export async function getFacultyDashboardApi(): Promise<{ stats: FacultyDashboardStats }> {
  const res = await fetch('/api/faculty/dashboard', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch faculty stats');
  return res.json();
}

export async function evaluateSubmissionApi(id: string, facultyScore: number, remarks: string): Promise<{ submission: Submission }> {
  const res = await fetch(`/api/faculty/submissions/${id}/evaluate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ facultyScore, remarks })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Evaluation failed');
  }
  return res.json();
}

export async function createPracticalApi(data: any): Promise<{ practical: Practical }> {
  const res = await fetch('/api/faculty/practicals', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create practical');
  return res.json();
}

export async function updatePracticalApi(id: number, data: any): Promise<{ practical: Practical }> {
  const res = await fetch(`/api/faculty/practicals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update practical');
  return res.json();
}

export async function deletePracticalApi(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`/api/faculty/practicals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete practical');
  return res.json();
}

export async function addTestCaseApi(practicalId: number, data: any): Promise<{ testCase: any }> {
  const res = await fetch(`/api/faculty/practicals/${practicalId}/test-cases`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add test case');
  return res.json();
}

export async function updateTestCaseApi(practicalId: number, testCaseId: string, data: any): Promise<{ testCase: any }> {
  const res = await fetch(`/api/faculty/practicals/${practicalId}/test-cases/${testCaseId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update test case');
  return res.json();
}

export async function deleteTestCaseApi(practicalId: number, testCaseId: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/faculty/practicals/${practicalId}/test-cases/${testCaseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete test case');
  return res.json();
}

export async function downloadCsvReport(): Promise<void> {
  const token = localStorage.getItem('tcet_auth_token');
  const res = await fetch('/api/faculty/export/csv', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Failed to export CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tcet_practical_evaluation_report.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ---------------- ADMIN API ----------------

export async function getAdminDashboardApi(): Promise<{ stats: AdminDashboardStats }> {
  const res = await fetch('/api/admin/dashboard', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}

export async function getAdminUsersApi(filters?: { role?: string; batch?: string; status?: string; search?: string }): Promise<{ users: User[] }> {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.batch) params.append('batch', filters.batch);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`/api/admin/users?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user list');
  return res.json();
}

export async function createAdminUserApi(data: Partial<User & { plainPassword?: string }>): Promise<{ user: User }> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create user');
  }
  return res.json();
}

export async function updateAdminUserApi(id: string, data: Partial<User & { plainPassword?: string }>): Promise<{ user: User }> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update user');
  }
  return res.json();
}

export async function deleteAdminUserApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete user');
  }
  return res.json();
}

export async function toggleUserStatusApi(id: string): Promise<{ user: User }> {
  const res = await fetch(`/api/admin/users/${id}/toggle-status`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to toggle status');
  }
  return res.json();
}

export async function resetUserPasswordApi(id: string, newPassword?: string): Promise<{ success: boolean; tempPassword?: string; message: string }> {
  const res = await fetch(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reset password');
  }
  return res.json();
}

export async function getAdminCoursesApi(): Promise<{ courses: Course[] }> {
  const res = await fetch('/api/admin/courses', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function createAdminCourseApi(data: Partial<Course>): Promise<{ course: Course }> {
  const res = await fetch('/api/admin/courses', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create course');
  }
  return res.json();
}

export async function updateAdminCourseApi(id: string, data: Partial<Course>): Promise<{ course: Course }> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update course');
  return res.json();
}

export async function deleteAdminCourseApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete course');
  return res.json();
}

export async function getAdminBatchesApi(): Promise<{ batches: Batch[] }> {
  const res = await fetch('/api/admin/batches', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch batches');
  return res.json();
}

export async function createAdminBatchApi(data: Partial<Batch>): Promise<{ batch: Batch }> {
  const res = await fetch('/api/admin/batches', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create batch');
  }
  return res.json();
}

export async function updateAdminBatchApi(id: string, data: Partial<Batch>): Promise<{ batch: Batch }> {
  const res = await fetch(`/api/admin/batches/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update batch');
  return res.json();
}

export async function deleteAdminBatchApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/batches/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete batch');
  return res.json();
}

export async function getAdminAuditLogsApi(filters?: { action?: string; role?: string; search?: string }): Promise<{ logs: AuditLog[] }> {
  const params = new URLSearchParams();
  if (filters?.action) params.append('action', filters.action);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function getAdminSystemHealthApi(): Promise<{ health: any }> {
  const res = await fetch('/api/admin/system-health', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch system health');
  return res.json();
}
