'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiEndpoint {
  method: Method;
  path: string;
  desc: string;
  auth?: string;
  payload?: object;
  success: object;
  error: object;
}

interface ApiGroup {
  group: string;
  icon: string;
  color: string;
  endpoints: ApiEndpoint[];
}

const API_BASE = '/api/v1';

const methodColor: Record<Method, string> = {
  GET: '#10b981', POST: '#7c3aed', PUT: '#f59e0b', PATCH: '#06b6d4', DELETE: '#ef4444',
};

// ===================== FULL API DATA =====================
const apiGroups: ApiGroup[] = [
  // ─────────────────────────────────────────────────────
  {
    group: 'Authentication', icon: '🔑', color: '#7c3aed',
    endpoints: [
      {
        method: 'POST', path: `${API_BASE}/auth/login`,
        desc: 'Đăng nhập bằng email & mật khẩu, trả về JWT token',
        payload: { email: 'string', password: 'string', role: 'student|lecturer|admin' },
        success: { token: 'eyJhbGci...', refreshToken: 'eyJhbGci...', user: { id: 1, name: 'Nguyễn Văn A', role: 'student', email: 'sv@hcmus.edu.vn', avatar: null } },
        error: { code: 401, message: 'Email hoặc mật khẩu không đúng' },
      },
      {
        method: 'POST', path: `${API_BASE}/auth/register`,
        desc: 'Đăng ký tài khoản mới (sinh viên / giảng viên)',
        payload: { fullName: 'string', mssv: 'string?', email: 'string', password: 'string', role: 'student|lecturer', major: 'string?' },
        success: { message: 'Đăng ký thành công. Vui lòng xác nhận email.', userId: 42 },
        error: { code: 409, message: 'Email đã tồn tại trong hệ thống' },
      },
      {
        method: 'POST', path: `${API_BASE}/auth/logout`,
        desc: 'Huỷ phiên đăng nhập, invalidate refresh token',
        auth: 'Bearer token',
        payload: { refreshToken: 'string' },
        success: { message: 'Đã đăng xuất thành công' },
        error: { code: 401, message: 'Token không hợp lệ' },
      },
      {
        method: 'POST', path: `${API_BASE}/auth/refresh`,
        desc: 'Làm mới access token bằng refresh token',
        payload: { refreshToken: 'string' },
        success: { token: 'eyJhbGci...', expiresIn: 3600 },
        error: { code: 401, message: 'Refresh token hết hạn' },
      },
      {
        method: 'POST', path: `${API_BASE}/auth/forgot-password`,
        desc: 'Gửi email reset mật khẩu',
        payload: { email: 'string' },
        success: { message: 'Email hướng dẫn đã được gửi' },
        error: { code: 404, message: 'Email không tồn tại trong hệ thống' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Courses & Enrollments', icon: '📚', color: '#06b6d4',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/courses`,
        desc: 'Lấy danh sách khoá học theo học kỳ',
        auth: 'Bearer token',
        payload: { semester: 'string? (query)', page: 'number?', limit: 'number?' },
        success: { courses: [{ id: 1, code: 'CS101', name: 'CTDL & GT', lecturerId: 5, semester: 'HK2-2025', studentCount: 120 }], total: 4 },
        error: { code: 401, message: 'Chưa xác thực' },
      },
      {
        method: 'GET', path: `${API_BASE}/courses/:id/students`,
        desc: 'Lấy danh sách sinh viên trong khoá học',
        auth: 'Lecturer | Admin',
        success: { students: [{ id: 1, name: 'Nguyễn Văn A', mssv: '2151063', email: 'sv@hcmus.edu.vn', progress: 72 }], total: 120 },
        error: { code: 403, message: 'Không có quyền truy cập khoá học này' },
      },
      {
        method: 'POST', path: `${API_BASE}/courses/:id/enroll`,
        desc: 'Đăng ký khoá học cho sinh viên',
        auth: 'Student',
        payload: { courseId: 'number' },
        success: { message: 'Đăng ký thành công', enrollmentId: 88 },
        error: { code: 409, message: 'Sinh viên đã đăng ký khoá học này' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Exercises & Submissions', icon: '📝', color: '#f59e0b',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/exercises`,
        desc: 'Lấy danh sách bài tập theo khoá học',
        auth: 'Bearer token',
        payload: { courseId: 'number (query)', difficulty: 'easy|medium|hard?', tag: 'string?' },
        success: { exercises: [{ id: 1, title: 'BFS Graph', difficulty: 'medium', tags: ['Graph', 'BFS'], score: 10, deadline: '2026-03-15' }] },
        error: { code: 403, message: 'Không có quyền truy cập' },
      },
      {
        method: 'GET', path: `${API_BASE}/exercises/:id`,
        desc: 'Chi tiết bài tập (đề bài, test cases public, hints)',
        auth: 'Bearer token',
        success: { id: 1, title: 'BFS Graph', description: 'Markdown...', examples: [], constraints: [], hints: ['Hint 1'], languages: ['python', 'cpp', 'java'] },
        error: { code: 404, message: 'Bài tập không tồn tại' },
      },
      {
        method: 'POST', path: `${API_BASE}/exercises`,
        desc: 'Giảng viên tạo bài tập mới',
        auth: 'Lecturer',
        payload: { title: 'string', description: 'string (Markdown)', difficulty: 'enum', tags: ['string'], languages: ['string'], score: 'number', testCases: [{ input: 'string', output: 'string', hidden: 'bool' }], hints: ['string'] },
        success: { id: 15, message: 'Tạo bài tập thành công', status: 'draft' },
        error: { code: 400, message: 'Validation error', details: ['title is required'] },
      },
      {
        method: 'PUT', path: `${API_BASE}/exercises/:id`,
        desc: 'Cập nhật bài tập (title, desc, testcases, hints)',
        auth: 'Lecturer (owner)',
        payload: { title: 'string?', description: 'string?', testCases: '[]?', hints: '[]?' },
        success: { message: 'Cập nhật thành công', updatedAt: '2026-03-07T08:00:00Z' },
        error: { code: 403, message: 'Bạn không phải tác giả bài tập này' },
      },
      {
        method: 'POST', path: `${API_BASE}/submissions`,
        desc: 'Nộp code, hệ thống tự chạy trong Docker sandbox',
        auth: 'Student',
        payload: { exerciseId: 'number', language: 'python|cpp|java|js', sourceCode: 'string' },
        success: { submissionId: 301, status: 'queued', message: 'Đã nhận code. Đang chấm...' },
        error: { code: 429, message: 'Quá giới hạn nộp bài. Chờ 30 giây.' },
      },
      {
        method: 'GET', path: `${API_BASE}/submissions/:id/result`,
        desc: 'Lấy kết quả chấm bài (polling hoặc websocket)',
        auth: 'Bearer token',
        success: { status: 'done', score: 80, passed: 4, total: 5, timeCpu: '0.18s', memoryMb: 3.4, testResults: [{ id: 1, status: 'pass', time: '12ms' }], stderr: '' },
        error: { code: 404, message: 'Submission không tồn tại' },
      },
      {
        method: 'GET', path: `${API_BASE}/exercises/:id/submissions`,
        desc: 'Lấy tất cả submissions của một bài (Giảng viên)',
        auth: 'Lecturer',
        payload: { status: 'all|pass|fail?', page: 'number?' },
        success: { submissions: [{ id: 301, studentId: 1, studentName: 'A', score: 80, status: 'done', submittedAt: '...' }], total: 120 },
        error: { code: 403, message: 'Không có quyền' },
      },
      {
        method: 'PATCH', path: `${API_BASE}/submissions/:id/score`,
        desc: 'Giảng viên sửa điểm thủ công',
        auth: 'Lecturer',
        payload: { score: 'number', reason: 'string?' },
        success: { message: 'Đã cập nhật điểm', oldScore: 70, newScore: 85 },
        error: { code: 400, message: 'Điểm phải trong khoảng 0-100' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Plagiarism Detection', icon: '🔍', color: '#ef4444',
    endpoints: [
      {
        method: 'POST', path: `${API_BASE}/plagiarism/check/:exerciseId`,
        desc: 'Chạy phân tích đạo văn cho toàn bộ submission của một bài',
        auth: 'Lecturer',
        payload: { threshold: 'number (0-100, default 40)' },
        success: { jobId: 'plg_88x2', status: 'running', message: 'Đang phân tích 120 submissions...' },
        error: { code: 404, message: 'Bài tập không tồn tại' },
      },
      {
        method: 'GET', path: `${API_BASE}/plagiarism/:exerciseId/results`,
        desc: 'Lấy kết quả phân tích đạo văn',
        auth: 'Lecturer',
        success: { pairs: [{ studentA: { id: 1, name: 'A' }, studentB: { id: 5, name: 'B' }, similarity: 82, matchedBlocks: 14, status: 'flagged' }], analyzedAt: '...' },
        error: { code: 404, message: 'Chưa có kết quả phân tích' },
      },
      {
        method: 'POST', path: `${API_BASE}/plagiarism/flag`,
        desc: 'Đánh dấu cặp đạo văn và thực hiện hành động',
        auth: 'Lecturer',
        payload: { submissionAId: 'number', submissionBId: 'number', action: 'warn|deduct|zero', reason: 'string' },
        success: { message: 'Đã xử lý. Email thông báo đã gửi đến 2 sinh viên.' },
        error: { code: 400, message: 'action phải là warn, deduct, hoặc zero' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Question Bank & Exams', icon: '🗃️', color: '#7c3aed',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/questions`,
        desc: 'Lấy danh sách câu hỏi trong ngân hàng',
        auth: 'Lecturer',
        payload: { difficulty: 'enum?', tag: 'string?', language: 'string?', page: 'number?' },
        success: { questions: [{ id: 1, title: 'BFS', difficulty: 'medium', tags: ['Graph'], usageCount: 5 }], total: 48 },
        error: { code: 401, message: 'Chưa xác thực' },
      },
      {
        method: 'POST', path: `${API_BASE}/exams/generate`,
        desc: 'Tạo đề thi ngẫu nhiên từ ngân hàng câu hỏi',
        auth: 'Lecturer',
        payload: { courseId: 'number', name: 'string', duration: 'number (phút)', rules: [{ difficulty: 'string', count: 'number', score: 'number' }], requiredTags: ['string'], shuffle: 'boolean' },
        success: { examId: 7, questions: [{ id: 1, title: '...' }], totalScore: 45, preview: '/exams/7/preview' },
        error: { code: 400, message: 'Không đủ câu hỏi thoả điều kiện' },
      },
      {
        method: 'GET', path: `${API_BASE}/exams/:id`,
        desc: 'Chi tiết đề thi (dành cho sinh viên vào thi)',
        auth: 'Student (enrolled)',
        success: { id: 7, name: 'Kiểm tra cuối kỳ', duration: 90, startAt: '2026-03-10T07:00:00Z', questions: [{ id: 1, title: '...' }] },
        error: { code: 403, message: 'Chưa đến giờ thi hoặc bạn không được phép dự thi' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Analytics & Dashboard', icon: '📊', color: '#10b981',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/analytics/course/:courseId`,
        desc: 'Dashboard tổng quan: tỷ lệ hoàn thành, sinh viên stuck',
        auth: 'Lecturer',
        success: { totalStudents: 120, avgCompletion: 68, stuckStudents: 28, weeklySubmissions: [12, 18, 24, 30, 15, 8, 6], exerciseBreakdown: [{ id: 1, title: 'BFS', passRate: 72, avgTime: 35, stuckCount: 12 }] },
        error: { code: 403, message: 'Không phải giảng viên khoá học này' },
      },
      {
        method: 'GET', path: `${API_BASE}/analytics/student/:studentId`,
        desc: 'Thống kê cá nhân sinh viên: kỹ năng yếu, tiến độ',
        auth: 'Lecturer | Student (own)',
        success: { solved: 31, passRate: 58, avgTime: 51, weekActivity: [20, 35, 28, 45, 52, 38, 30], stuckExercises: [{ id: 3, name: 'DP', stuckMinutes: 252 }] },
        error: { code: 403, message: 'Không có quyền xem thống kê người dùng khác' },
      },
      {
        method: 'POST', path: `${API_BASE}/notifications/broadcast`,
        desc: 'Giảng viên gửi thông báo đến sinh viên trong lớp',
        auth: 'Lecturer',
        payload: { courseId: 'number', target: 'all|stuck', message: 'string', channels: ['inapp', 'email'] },
        success: { sent: 28, message: 'Thông báo đã được gửi' },
        error: { code: 400, message: 'message không được để trống' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Learning Path & AI', icon: '🗺️', color: '#f59e0b',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/learning-path/me`,
        desc: 'Lấy lộ trình học cá nhân (skill tree + trạng thái)',
        auth: 'Student',
        success: { skills: [{ id: 'binary-search', name: 'Binary Search', status: 'active', progress: 60, prerequisites: ['arrays', 'two-pointers'] }], xp: 1240, level: 5 },
        error: { code: 401, message: 'Chưa xác thực' },
      },
      {
        method: 'GET', path: `${API_BASE}/ai/suggest`,
        desc: 'AI gợi ý bài tập tiếp theo dựa trên kỹ năng yếu',
        auth: 'Student',
        payload: { limit: 'number? (default 5)' },
        success: { suggestions: [{ exerciseId: 15, title: 'Find Peak Element', reason: 'Kỹ năng Binary Search còn 60%', confidence: 0.87 }] },
        error: { code: 503, message: 'AI service tạm thời không khả dụng' },
      },
      {
        method: 'POST', path: `${API_BASE}/ai/hint`,
        desc: 'Yêu cầu AI giải thích lỗi hoặc gợi ý hướng giải',
        auth: 'Student',
        payload: { exerciseId: 'number', submissionId: 'number?', userCode: 'string', question: 'string', language: 'string' },
        success: { hint: 'Bạn đang gặp IndexError tại dòng 8...', relatedConcept: 'Array boundary', followUp: 'Nếu mảng rỗng thì sao?' },
        error: { code: 429, message: 'Giới hạn gọi AI: 20 lần/giờ' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Pair Programming', icon: '👥', color: '#ec4899',
    endpoints: [
      {
        method: 'POST', path: `${API_BASE}/pair-rooms`,
        desc: 'Tạo phòng pair programming',
        auth: 'Student',
        payload: { exerciseId: 'number' },
        success: { roomId: 'A3F2-XK91', joinLink: 'https://codelearn.vn/pair/A3F2-XK91', expiresAt: '2026-03-07T17:00:00Z' },
        error: { code: 400, message: 'Sinh viên đã có phòng đang hoạt động' },
      },
      {
        method: 'POST', path: `${API_BASE}/pair-rooms/:roomId/invite`,
        desc: 'Mời sinh viên khác vào phòng',
        auth: 'Student (room owner)',
        payload: { inviteeIds: ['number'] },
        success: { invited: 2, message: 'Lời mời đã gửi' },
        error: { code: 404, message: 'Phòng không tồn tại hoặc đã hết hạn' },
      },
      {
        method: 'GET', path: `/ws/pair-rooms/:roomId`,
        desc: 'WebSocket: sync code realtime (cursor, typing, chat)',
        auth: 'Bearer token (WS handshake)',
        success: { events: ['code_change', 'cursor_move', 'chat_message', 'user_join', 'user_leave'] },
        error: { code: 403, message: 'Không phải thành viên phòng này' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Code Battle', icon: '⚔️', color: '#ef4444',
    endpoints: [
      {
        method: 'POST', path: `${API_BASE}/battles/challenge`,
        desc: 'Gửi lời thách đấu đến một sinh viên',
        auth: 'Student',
        payload: { opponentId: 'number', duration: '15|30|45 (phút)', topic: 'random|Graph|DP|Sorting' },
        success: { battleId: 55, status: 'pending', message: 'Đã gửi lời mời. Chờ đối thủ chấp nhận.' },
        error: { code: 409, message: 'Đối thủ đang trong trận khác' },
      },
      {
        method: 'POST', path: `${API_BASE}/battles/:id/accept`,
        desc: 'Chấp nhận lời thách đấu',
        auth: 'Student',
        success: { battleId: 55, status: 'active', exercise: { id: 12, title: 'Find Peak Element' }, startsAt: '...' },
        error: { code: 410, message: 'Lời mời đã hết hạn (>60s)' },
      },
      {
        method: 'GET', path: `/ws/battles/:id`,
        desc: 'WebSocket: cập nhật realtime tiến độ trận đấu',
        auth: 'Bearer token (WS handshake)',
        success: { events: ['opponent_progress', 'time_update', 'battle_end', 'submission_result'] },
        error: { code: 403, message: 'Không phải người chơi trong trận này' },
      },
      {
        method: 'GET', path: `${API_BASE}/battles/:id/result`,
        desc: 'Kết quả trận đấu khi kết thúc',
        auth: 'Bearer token',
        success: { winner: { userId: 5, name: 'Phạm Thu Hà' }, ratingChange: { me: -18, opponent: +24 }, comparison: { testsPassed: [13, 16], time: ['11:26', '9:43'] } },
        error: { code: 404, message: 'Trận đấu không tồn tại' },
      },
      {
        method: 'GET', path: `${API_BASE}/leaderboard`,
        desc: 'Bảng xếp hạng toàn cầu / theo khoá học',
        payload: { courseId: 'number? (query)', limit: 'number?', period: 'all|week|month?' },
        success: { rankings: [{ rank: 1, userId: 5, name: 'Phạm Thu Hà', rating: 1850, solved: 87, winRate: 71 }] },
        error: { code: 400, message: 'Tham số không hợp lệ' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Admin — Sandbox', icon: '🐳', color: '#10b981',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/admin/sandbox/jobs`,
        desc: 'Liệt kê container jobs đang chạy',
        auth: 'Admin',
        success: { jobs: [{ id: 'JOB-4823', studentId: 3, exercise: 'DP', language: 'java', cpu: 91, ram: 71, status: 'running', elapsedSec: 4.1 }] },
        error: { code: 403, message: 'Chỉ Admin mới có quyền' },
      },
      {
        method: 'DELETE', path: `${API_BASE}/admin/sandbox/jobs/:jobId`,
        desc: 'Kill container job — bài nộp bị FAILED',
        auth: 'Admin',
        success: { message: 'Job JOB-4823 đã bị dừng. Bài nộp: FAILED' },
        error: { code: 404, message: 'Job không tồn tại hoặc đã hoàn thành' },
      },
      {
        method: 'GET', path: `${API_BASE}/admin/sandbox/config`,
        desc: 'Lấy cấu hình tài nguyên theo ngôn ngữ',
        auth: 'Admin',
        success: { languages: [{ lang: 'python', cpu: '0.5vCPU', ram: '128MB', timeout: 10, enabled: true }] },
        error: { code: 403, message: 'Không có quyền' },
      },
      {
        method: 'PUT', path: `${API_BASE}/admin/sandbox/config`,
        desc: 'Cập nhật giới hạn tài nguyên sandbox',
        auth: 'Admin',
        payload: { language: 'string', cpu: 'number', ram: 'number', timeout: 'number', enabled: 'boolean' },
        success: { message: 'Đã cập nhật cấu hình Python', appliedAt: '2026-03-07T08:00:00Z' },
        error: { code: 400, message: 'cpu phải trong khoảng 0.1–2.0 vCPU' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Admin — Audit Log', icon: '📋', color: '#06b6d4',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/admin/audit-logs`,
        desc: 'Truy vấn log hành động hệ thống',
        auth: 'Admin',
        payload: { action: 'string?', severity: 'info|warning|danger?', userId: 'number?', from: 'date?', to: 'date?', page: 'number?' },
        success: { logs: [{ id: 90, time: '22:38:55', user: 'GV. Trần B', action: 'DELETE_EXAM', target: 'Đề giữa kỳ', ip: '192.168.1.45', severity: 'danger' }], total: 91 },
        error: { code: 403, message: 'Chỉ Admin' },
      },
      {
        method: 'GET', path: `${API_BASE}/admin/audit-logs/:id`,
        desc: 'Chi tiết 1 log entry: before/after, metadata đầy đủ',
        auth: 'Admin',
        success: { id: 90, action: 'DELETE_EXAM', before: { title: 'Giữa kỳ' }, after: null, ip: '192.168.1.45', sessionId: 'sess_K9x', userAgent: 'Chrome 122' },
        error: { code: 404, message: 'Log không tồn tại' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  {
    group: 'Admin — System Config', icon: '🔧', color: '#f59e0b',
    endpoints: [
      {
        method: 'GET', path: `${API_BASE}/admin/languages`,
        desc: 'Danh sách ngôn ngữ lập trình hỗ trợ',
        auth: 'Admin',
        success: { languages: [{ id: 1, name: 'Python', version: 'CPython 3.11', dockerImage: 'python:3.11-slim', enabled: true, allowedLibs: ['math', 'collections'] }] },
        error: { code: 403, message: 'Không có quyền' },
      },
      {
        method: 'POST', path: `${API_BASE}/admin/languages`,
        desc: 'Thêm ngôn ngữ lập trình mới',
        auth: 'Admin',
        payload: { name: 'string', version: 'string', dockerImage: 'string', allowedLibs: ['string'], timeout: 'number', memoryMb: 'number' },
        success: { id: 6, message: 'Đã thêm Go 1.22 thành công' },
        error: { code: 409, message: 'Ngôn ngữ này đã tồn tại' },
      },
      {
        method: 'PATCH', path: `${API_BASE}/admin/languages/:id`,
        desc: 'Bật/tắt hoặc cập nhật cấu hình ngôn ngữ',
        auth: 'Admin',
        payload: { enabled: 'boolean?', allowedLibs: '[]?', timeout: 'number?', memoryMb: 'number?' },
        success: { message: 'Đã cập nhật Go 1.22', updatedAt: '2026-03-07T08:00:00Z' },
        error: { code: 404, message: 'Ngôn ngữ không tồn tại' },
      },
    ],
  },
];

// ===================== DATABASE SCHEMA =====================
const dbTables = [
  {
    name: 'users', icon: '👤', color: '#7c3aed',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'full_name', type: 'VARCHAR(100)', note: '' },
      { name: 'email', type: 'VARCHAR(150)', note: 'UNIQUE NOT NULL' },
      { name: 'mssv', type: 'VARCHAR(20)', note: 'nullable (sinh viên)' },
      { name: 'role', type: "ENUM('student','lecturer','admin')", note: '' },
      { name: 'password_hash', type: 'TEXT', note: 'bcrypt' },
      { name: 'major', type: 'VARCHAR(100)', note: 'nullable' },
      { name: 'avatar_url', type: 'TEXT', note: 'nullable' },
      { name: 'rating', type: 'INTEGER', note: 'DEFAULT 1500, cho battle' },
      { name: 'xp', type: 'INTEGER', note: 'DEFAULT 0' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'courses', icon: '📚', color: '#06b6d4',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'code', type: 'VARCHAR(20)', note: 'VD: CS101' },
      { name: 'name', type: 'VARCHAR(200)', note: '' },
      { name: 'lecturer_id', type: 'FK → users', note: 'NULL khi hệ thống tạo' },
      { name: 'semester', type: 'VARCHAR(20)', note: 'VD: HK2-2025' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: '' },
    ],
  },
  {
    name: 'enrollments', icon: '✅', color: '#10b981',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'student_id', type: 'FK → users', note: '' },
      { name: 'course_id', type: 'FK → courses', note: '' },
      { name: 'enrolled_at', type: 'TIMESTAMPTZ', note: '' },
    ],
    indexes: ['UNIQUE(student_id, course_id)'],
  },
  {
    name: 'exercises', icon: '📝', color: '#f59e0b',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'title', type: 'VARCHAR(200)', note: '' },
      { name: 'description', type: 'TEXT', note: 'Markdown' },
      { name: 'difficulty', type: "ENUM('easy','medium','hard')", note: '' },
      { name: 'tags', type: 'TEXT[]', note: 'pg array' },
      { name: 'score', type: 'INTEGER', note: '' },
      { name: 'languages', type: 'TEXT[]', note: '' },
      { name: 'hints', type: 'JSONB', note: '["hint1","hint2"]' },
      { name: 'status', type: "ENUM('draft','published')", note: '' },
      { name: 'course_id', type: 'FK → courses', note: 'nullable' },
      { name: 'creator_id', type: 'FK → users', note: '' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: '' },
    ],
  },
  {
    name: 'test_cases', icon: '🧪', color: '#7c3aed',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'exercise_id', type: 'FK → exercises', note: '' },
      { name: 'input', type: 'TEXT', note: '' },
      { name: 'expected_output', type: 'TEXT', note: '' },
      { name: 'is_hidden', type: 'BOOLEAN', note: 'DEFAULT false' },
      { name: 'order_idx', type: 'INTEGER', note: 'thứ tự hiển thị' },
    ],
  },
  {
    name: 'submissions', icon: '📤', color: '#ef4444',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'exercise_id', type: 'FK → exercises', note: '' },
      { name: 'student_id', type: 'FK → users', note: '' },
      { name: 'language', type: 'VARCHAR(20)', note: '' },
      { name: 'source_code', type: 'TEXT', note: '' },
      { name: 'status', type: "ENUM('queued','running','done','timeout','error')", note: '' },
      { name: 'score', type: 'NUMERIC(5,2)', note: 'sau chấm xong' },
      { name: 'passed', type: 'INTEGER', note: 'số test pass' },
      { name: 'total', type: 'INTEGER', note: 'tổng test cases' },
      { name: 'cpu_time', type: 'NUMERIC(8,3)', note: 'giây' },
      { name: 'memory_mb', type: 'NUMERIC(8,2)', note: '' },
      { name: 'stderr', type: 'TEXT', note: 'nullable' },
      { name: 'submitted_at', type: 'TIMESTAMPTZ', note: '' },
    ],
    indexes: ['INDEX(exercise_id, student_id)', 'INDEX(status)'],
  },
  {
    name: 'plagiarism_results', icon: '🔍', color: '#ef4444',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'exercise_id', type: 'FK → exercises', note: '' },
      { name: 'submission_a_id', type: 'FK → submissions', note: '' },
      { name: 'submission_b_id', type: 'FK → submissions', note: '' },
      { name: 'similarity', type: 'NUMERIC(5,2)', note: 'phần trăm' },
      { name: 'matched_blocks', type: 'INTEGER', note: '' },
      { name: 'status', type: "ENUM('detected','flagged','cleared')", note: '' },
      { name: 'action', type: "ENUM('warn','deduct','zero')", note: 'nullable' },
      { name: 'analyzed_at', type: 'TIMESTAMPTZ', note: '' },
    ],
  },
  {
    name: 'battles', icon: '⚔️', color: '#f59e0b',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'player_a_id', type: 'FK → users', note: '' },
      { name: 'player_b_id', type: 'FK → users', note: '' },
      { name: 'exercise_id', type: 'FK → exercises', note: '' },
      { name: 'duration', type: 'INTEGER', note: 'phút (15/30/45)' },
      { name: 'status', type: "ENUM('pending','active','done','cancelled')", note: '' },
      { name: 'winner_id', type: 'FK → users', note: 'nullable' },
      { name: 'rating_delta_a', type: 'INTEGER', note: '+/- ELO' },
      { name: 'rating_delta_b', type: 'INTEGER', note: '' },
      { name: 'started_at', type: 'TIMESTAMPTZ', note: '' },
      { name: 'ended_at', type: 'TIMESTAMPTZ', note: 'nullable' },
    ],
  },
  {
    name: 'audit_logs', icon: '📋', color: '#06b6d4',
    columns: [
      { name: 'id', type: 'BIGSERIAL PK', note: '' },
      { name: 'user_id', type: 'FK → users', note: '' },
      { name: 'action', type: 'VARCHAR(50)', note: 'VD: DELETE_EXAM' },
      { name: 'target', type: 'TEXT', note: '' },
      { name: 'before', type: 'JSONB', note: 'nullable' },
      { name: 'after', type: 'JSONB', note: 'nullable' },
      { name: 'ip', type: 'INET', note: '' },
      { name: 'session_id', type: 'VARCHAR(50)', note: '' },
      { name: 'user_agent', type: 'TEXT', note: '' },
      { name: 'severity', type: "ENUM('info','warning','danger')", note: '' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: 'DEFAULT NOW()' },
    ],
    indexes: ['INDEX(user_id)', 'INDEX(action)', 'INDEX(severity)', 'INDEX(created_at DESC)'],
  },
  {
    name: 'learning_path_progress', icon: '🗺️', color: '#10b981',
    columns: [
      { name: 'id', type: 'SERIAL PK', note: '' },
      { name: 'student_id', type: 'FK → users', note: '' },
      { name: 'skill_id', type: 'VARCHAR(50)', note: 'VD: binary-search' },
      { name: 'status', type: "ENUM('locked','active','done')", note: '' },
      { name: 'progress', type: 'INTEGER', note: '0-100 %' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', note: '' },
    ],
    indexes: ['UNIQUE(student_id, skill_id)'],
  },
];

// ===================== COMPONENT =====================
function MethodBadge({ method }: { method: Method }) {
  return (
    <div style={{
      minWidth: 64, textAlign: 'center', padding: '3px 10px', borderRadius: 6,
      background: `${methodColor[method]}22`, border: `1px solid ${methodColor[method]}55`,
      color: methodColor[method], fontWeight: 800, fontSize: 11, fontFamily: 'monospace',
      flexShrink: 0,
    }}>{method}</div>
  );
}

function JsonBlock({ data }: { data: object }) {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 14px', overflow: 'auto', maxHeight: 200, fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        const isKey = /"[^"]+":/.test(line);
        const isStr = /: "/.test(line);
        const isNum = /: \d/.test(line) && !isStr;
        return (
          <div key={i}>
            {line.replace(/"([^"]+)":/g, (_, k) => `"${k}":`).split('').map((ch, ci) => (
              <span key={ci} style={{ color: isKey && ch !== ':' && line.includes(ch) ? '#79c0ff' : isStr ? '#a5d6ff' : isNum ? '#f69d50' : 'var(--text-secondary)' }}>{ch}</span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function EndpointCard({ ep }: { ep: ApiEndpoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header row */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        background: open ? 'var(--bg-tertiary)' : 'var(--bg-card)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
      }}>
        <MethodBadge method={ep.method} />
        <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--accent-cyan-light)', flex: 1 }}>{ep.path}</code>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 2 }}>{ep.desc}</span>
        {ep.auth && <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '2px 8px', color: '#34d399', whiteSpace: 'nowrap' }}>🔒 {ep.auth}</span>}
        <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 8, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
      </button>

      {/* Payload + Response */}
      {open && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'grid', gridTemplateColumns: ep.payload ? '1fr 1fr 1fr' : '1fr 1fr', gap: 14 }}>
          {ep.payload && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-purple-light)', marginBottom: 8 }}>📦 Payload / Params</div>
              <JsonBlock data={ep.payload} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-green)', marginBottom: 8 }}>✅ Success</div>
            <JsonBlock data={ep.success} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-red)', marginBottom: 8 }}>❌ Error</div>
            <JsonBlock data={ep.error} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [activeSection, setActiveSection] = useState<string>('');

  const filtered = apiGroups.map(g => ({
    ...g,
    endpoints: g.endpoints.filter(ep =>
      (methodFilter === 'ALL' || ep.method === methodFilter) &&
      (search === '' || ep.path.toLowerCase().includes(search.toLowerCase()) || ep.desc.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(g => g.endpoints.length > 0);

  const totalEndpoints = apiGroups.reduce((s, g) => s + g.endpoints.length, 0);

  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📡 API Documentation</h1>
            <p className="page-subtitle">CodeLearn REST API v1 — {totalEndpoints} endpoints · Base URL: <code style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4 }}>https://api.codelearn.vn/api/v1</code></p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="badge badge-green">REST API</span>
            <span className="badge badge-cyan">WebSocket</span>
            <span className="badge badge-purple">JWT Auth</span>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
          <input className="input" style={{ flex: 1, minWidth: 240 }} placeholder="🔍 Tìm theo path hoặc mô tả..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
              <button key={m} onClick={() => setMethodFilter(m)} style={{
                padding: '6px 12px', borderRadius: 8, border: `1px solid ${methodFilter === m ? (methodColor[m as Method] ?? 'var(--accent-purple)') : 'var(--border)'}`,
                background: methodFilter === m ? `${(methodColor[m as Method] ?? '#7c3aed')}22` : 'var(--bg-tertiary)',
                color: methodFilter === m ? (methodColor[m as Method] ?? 'var(--accent-purple)') : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s',
              }}>{m}</button>
            ))}
          </div>
        </div>

        {/* Group nav quick-links */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          {apiGroups.map(g => (
            <a key={g.group} href={`#group-${g.group.replace(/\s/g, '')}`} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, textDecoration: 'none',
              background: `${g.color}15`, border: `1px solid ${g.color}40`, color: g.color,
              transition: 'opacity 0.15s',
            }}>{g.icon} {g.group}</a>
          ))}
        </div>

        {/* API Groups */}
        {filtered.map(group => (
          <div key={group.group} id={`group-${group.group.replace(/\s/g, '')}`} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 0', borderBottom: `2px solid ${group.color}40` }}>
              <div style={{ width: 3, height: 24, borderRadius: 2, background: group.color }} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>{group.icon} {group.group}</span>
              <span className="badge" style={{ background: `${group.color}15`, border: `1px solid ${group.color}40`, color: group.color, fontSize: 10 }}>{group.endpoints.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.endpoints.map((ep, i) => <EndpointCard key={i} ep={ep} />)}
            </div>
          </div>
        ))}

        {/* ====== DATABASE SCHEMA ====== */}
        <div style={{ marginTop: 40, borderTop: '2px solid var(--border)', paddingTop: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>🗄️ Database Schema</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              PostgreSQL — {dbTables.length} tables chính · Sử dụng JSONB cho dữ liệu linh hoạt · Timestamp luôn dùng TIMESTAMPTZ (UTC)
            </p>
          </div>

          {/* ER summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
            {dbTables.map(t => (
              <a key={t.name} href={`#table-${t.name}`} style={{
                background: 'var(--bg-card)', border: `1px solid ${t.color}30`,
                borderRadius: 10, padding: '12px 14px', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = t.color}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = `${t.color}30`}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: t.color }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.columns.length} cols</div>
                </div>
              </a>
            ))}
          </div>

          {/* Tables detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {dbTables.map(table => (
              <div key={table.name} id={`table-${table.name}`} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `3px solid ${table.color}` }}>
                <div style={{ padding: '14px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{table.icon}</span>
                  <code style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 16, color: table.color }}>{table.name}</code>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {table.columns.length} columns</span>
                  {'indexes' in table && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {(table as typeof table & { indexes: string[] }).indexes.map(idx => (
                        <span key={idx} style={{ fontSize: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '2px 8px', color: '#fbbf24', fontFamily: 'monospace' }}>{idx}</span>
                      ))}
                    </div>
                  )}
                </div>
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 180 }}>Column</th>
                      <th>Type</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map(col => (
                      <tr key={col.name}>
                        <td>
                          <code style={{ fontFamily: 'monospace', fontSize: 12.5, color: col.name === 'id' ? '#f59e0b' : col.name.endsWith('_id') ? 'var(--accent-cyan)' : 'var(--accent-purple-light)', fontWeight: 700 }}>
                            {col.name}
                          </code>
                        </td>
                        <td><code style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--text-secondary)' }}>{col.type}</code></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: col.note ? 'normal' : 'italic' }}>{col.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Architecture notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
            <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--accent-purple-light)' }}>🏗 Kiến trúc tổng thể</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div>🔷 <strong style={{ color: 'var(--text-primary)' }}>Backend:</strong> NestJS (TypeScript) · REST + WebSocket</div>
                <div>🐘 <strong style={{ color: 'var(--text-primary)' }}>Database:</strong> PostgreSQL 16 · TypeORM</div>
                <div>🔴 <strong style={{ color: 'var(--text-primary)' }}>Cache/Queue:</strong> Redis 7 · BullMQ (submission queue)</div>
                <div>🐳 <strong style={{ color: 'var(--text-primary)' }}>Sandbox:</strong> Docker + gVisor isolation</div>
                <div>☁ <strong style={{ color: 'var(--text-primary)' }}>AI:</strong> Google Gemini API</div>
                <div>📬 <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> SendGrid / Nodemailer</div>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--accent-cyan-light)' }}>🔒 Auth & Security</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div>🗝 <strong style={{ color: 'var(--text-primary)' }}>JWT:</strong> Access token 1h, Refresh token 30d</div>
                <div>🛡 <strong style={{ color: 'var(--text-primary)' }}>RBAC:</strong> student / lecturer / admin guards</div>
                <div>🚦 <strong style={{ color: 'var(--text-primary)' }}>Rate limit:</strong> 100 req/min (auth), 20/h (AI hint)</div>
                <div>🔐 <strong style={{ color: 'var(--text-primary)' }}>Password:</strong> bcrypt salt=12</div>
                <div>📋 <strong style={{ color: 'var(--text-primary)' }}>Audit:</strong> Mọi action nhạy cảm đều log vào audit_logs</div>
                <div>🌐 <strong style={{ color: 'var(--text-primary)' }}>CORS:</strong> Chỉ cho phép domain đã whitelist</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
