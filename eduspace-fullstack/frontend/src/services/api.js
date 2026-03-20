import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
const API_ORIGIN = API_BASE.replace(/\/api$/i, '');

const resolveFileUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
apiClient.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('auth_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
apiClient.interceptors.response.use((r) => r, (err) => {
  if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
  return Promise.reject(err);
});

const safeArray = (v) => (Array.isArray(v) ? v : []);

const updateLocalUser = (updater) => {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  const user = JSON.parse(raw);
  const next = updater(user) || user;
  localStorage.setItem('auth_user', JSON.stringify(next));
  return next;
};

const normalizeLesson = (l) => ({
  id: l.id,
  title: l.title,
  description: l.description,
  duration: l.duration,
  courseId: l.courseId,
  sectionId: l.sectionId,
  section: l.section?.title || l.section || '',
  videoUrl: resolveFileUrl(l.videoUrl),
  videoType: l.videoType,
  order: l.order ?? 0,
  isFree: !!l.isFree,
  isCompleted: !!l.isCompleted,
  materials: safeArray(l.materials).map((m) => {
    if (typeof m === 'string') return { name: m, fileUrl: null };
    return { id: m.id, name: m.name, fileUrl: resolveFileUrl(m.fileUrl) };
  }).filter((m) => m?.name),
});

const normalizeCourse = (c) => {
  const sections = safeArray(c.sections).map((s) => ({
    ...s,
    lessons: safeArray(s.lessons).map(normalizeLesson),
  }));
  const lessonsCount =
    c.lessonsCount ??
    sections.reduce((sum, s) => sum + safeArray(s.lessons).length, 0) ??
    0;
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    teacher: c.teacher?.name || c.teacherName || c.teacher || 'Unknown',
    teacherId: c.teacher?.id || c.teacherId,
    category: c.category,
    level: c.level,
    duration: c.duration,
    thumbnail: resolveFileUrl(c.thumbnail),
    bgGradient: c.bgGradient || 'from-blue-500 to-indigo-600',
    tags: safeArray(c.tags),
    lessonsCount,
    studentsCount: c.studentsCount ?? 0,
    rating: c.rating ?? 0,
    progress: c.progress ?? 0,
    sections,
  };
};

const extractYoutubeId = (input = '') => {
  if (!input) return '';
  const maybeId = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(maybeId)) return maybeId;
  const match = maybeId.match(/(?:youtu\.be\/|v=|embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (match) return match[1];
  return '';
};

export const authService = {
  async login({ email, password }) {
    const resp = await apiClient.post('/auth/login', { email, password });
    const data = resp.data;
    if (!data?.success || !data?.data?.user || !data?.data?.token) {
      throw new Error(data?.message || 'Login failed');
    }
    return { user: data.data.user, token: data.data.token, refreshToken: data.data.refreshToken };
  },
  async register({ name, email, password, role }) {
    const payload = { name, email, password, role };
    const resp = await apiClient.post('/auth/register', payload);
    const data = resp.data;
    if (!data?.success || !data?.data?.user || !data?.data?.token) {
      throw new Error(data?.message || 'Registration failed');
    }
    const user = data.data.user;
    const token = data.data.token;

    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);

    return { user, token };
  },
  async logout() { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); },
  async getProfile() {
    const resp = await apiClient.get('/auth/me');
    return resp.data?.data || null;
  },
  async updateProfile({ name, email }) {
    const payload = {};
    if (name) payload.name = name;
    if (email) payload.email = email;
    const resp = await apiClient.patch('/auth/me', payload);
    return resp.data?.data || resp.data;
  },
  async googleLogin(credential) {
    const resp = await apiClient.post('/auth/google', { credential });
    const data = resp.data;
    if (!data?.success || !data?.data?.user || !data?.data?.token) {
      throw new Error(data?.message || 'Google login failed');
    }
    return { user: data.data.user, token: data.data.token, refreshToken: data.data.refreshToken };
  },
};

export const coursesService = {
  async getCourses({ category, level, search, page, limit } = {}) {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (level && level !== 'all') params.level = level;
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const resp = await apiClient.get('/courses', { params });
    const data = resp.data?.data || { courses: [], total: 0, page: 1, limit: 12 };
    return {
      ...data,
      courses: safeArray(data.courses).map(normalizeCourse),
    };
  },
  async getCourse(id) {
    const resp = await apiClient.get(`/courses/${id}`);
    return resp.data?.data ? normalizeCourse(resp.data.data) : null;
  },
  async getEnrolledCourses() {
    const resp = await apiClient.get('/courses/enrolled');
    return safeArray(resp.data?.data).map(normalizeCourse);
  },
  async enrollCourse(courseId) {
    await apiClient.post(`/courses/${courseId}/enroll`);
    updateLocalUser((u) => {
      const ids = new Set(u.enrolledCourses || []);
      ids.add(courseId);
      return { ...u, enrolledCourses: Array.from(ids) };
    });
    return { success: true };
  },
  async unenrollCourse(courseId) {
    await apiClient.delete(`/courses/${courseId}/enroll`);
    updateLocalUser((u) => ({
      ...u,
      enrolledCourses: (u.enrolledCourses || []).filter((id) => id !== courseId),
    }));
    return { success: true };
  },
  async createCourse(data) {
    const hasFile = data?.thumbnail instanceof File;
    if (hasFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === 'thumbnail') {
          form.append('thumbnail', value);
          return;
        }
        if (Array.isArray(value) || typeof value === 'object') {
          form.append(key, JSON.stringify(value));
          return;
        }
        form.append(key, value);
      });
      const resp = await apiClient.post('/courses', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return resp.data?.data ? normalizeCourse(resp.data.data) : null;
    }
    const resp = await apiClient.post('/courses', data);
    return resp.data?.data ? normalizeCourse(resp.data.data) : null;
  },
  async updateCourse(id, data) {
    const hasFile = data?.thumbnail instanceof File;
    const removeThumbnail = data?.removeThumbnail === true;
    if (hasFile || removeThumbnail) {
      const form = new FormData();
      Object.entries(data || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === 'thumbnail') {
          form.append('thumbnail', value);
          return;
        }
        if (Array.isArray(value) || typeof value === 'object') {
          form.append(key, JSON.stringify(value));
          return;
        }
        form.append(key, value);
      });
      const resp = await apiClient.patch(`/courses/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return resp.data?.data ? normalizeCourse(resp.data.data) : null;
    }
    const resp = await apiClient.patch(`/courses/${id}`, data);
    return resp.data?.data ? normalizeCourse(resp.data.data) : null;
  },
  async deleteCourse(id) {
    const resp = await apiClient.delete(`/courses/${id}`);
    return resp.data;
  },
  async togglePublish(id) {
    const resp = await apiClient.patch(`/courses/${id}/publish`);
    return resp.data?.data || null;
  },
};

export const lessonsService = {
  async getLessons(courseId) {
    const resp = await apiClient.get(`/courses/${courseId}/lessons`);
    return safeArray(resp.data?.data).map(normalizeLesson);
  },
  async getLesson(id) {
    const resp = await apiClient.get(`/lessons/${id}`);
    return resp.data?.data ? normalizeLesson(resp.data.data) : null;
  },
  async createLesson(data) {
    const payload = {
      title: data.title,
      description: data.description,
      duration: data.duration,
      sectionId: data.sectionId || data.section,
      courseId: data.courseId,
      videoUrl: data.videoUrl,
      videoType: data.videoType || 'youtube',
      order: data.order || 0,
      isFree: data.isFree || false,
    };

    const resp = await apiClient.post('/lessons', payload);
    return resp.data?.data ? normalizeLesson(resp.data.data) : null;
  },
  async uploadMaterial(lessonId, file) {
    const form = new FormData();
    form.append('file', file);
    const resp = await apiClient.post(`/lessons/${lessonId}/materials`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data?.data || null;
  },
  async getLessonsTable() { return []; },
  async markComplete(lessonId) {
    const resp = await apiClient.post(`/lessons/${lessonId}/complete`);
    return resp.data?.data || null;
  },
};

export const progressService = {
  async getProgress(courseId) {
    const resp = await apiClient.get(`/courses/${courseId}/progress`);
    return resp.data?.data || { courseId, completedLessons: 0, totalLessons: 0, percentage: 0 };
  },
  async getAllProgress() {
    const resp = await apiClient.get('/lessons/progress/all');
    return resp.data?.data || {};
  },
};

export const statsService = {
  async getStats(role) {
    if (role === 'admin') {
      const resp = await apiClient.get('/analytics/platform');
      const d = resp.data?.data || {};
      return {
        totalCourses: d.totalCourses ?? 0,
        totalStudents: d.totalStudents ?? 0,
        totalTeachers: d.totalTeachers ?? 0,
        activeEnrollments: d.totalEnrollments ?? 0,
      };
    }
    if (role === 'teacher') {
      return { activeCourses: 0, totalStudents: 0, lessonsCreated: 0, avgRating: 0 };
    }
    const resp = await apiClient.get('/users/stats');
    const d = resp.data?.data || {};
    return {
      enrolledCourses: d.enrolledCourses ?? 0,
      completedLessons: d.completedLessons ?? 0,
      hoursLearned: 0,
      streak: 0,
    };
  },
};

export const notificationsService = {
  async getNotifications() {
    const resp = await apiClient.get('/notifications');
    return safeArray(resp.data?.data).map((n) => ({
      ...n,
      read: !!n.isRead,
      time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
    }));
  },
  async markRead(id) {
    const resp = await apiClient.patch(`/notifications/${id}/read`);
    return resp.data || { success: true };
  },
  async markAllRead() {
    const resp = await apiClient.patch('/notifications/read-all');
    return resp.data || { success: true };
  },
};

export const liveSessionsService = {
  async getSessions() {
    const resp = await apiClient.get('/live');
    return safeArray(resp.data?.data).map((s) => ({
      ...s,
      courseName: s.Course?.title || s.courseName || '',
      teacher: s.teacher?.name || s.teacher || 'Unknown',
    }));
  },
  async getSession(id) {
    const sessions = await liveSessionsService.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },
  async scheduleSession(data) {
    const resp = await apiClient.post('/live', data);
    return resp.data?.data || null;
  },
};

export const studentsService = {
  async getStudents() {
    const resp = await apiClient.get('/users', { params: { role: 'student' } });
    return safeArray(resp.data?.data?.users);
  },
  async getStudent(id) {
    const resp = await apiClient.get(`/users/${id}`);
    return resp.data?.data || null;
  },
  async updateStudent(id, data) {
    const resp = await apiClient.patch(`/users/${id}`, data);
    return resp.data?.data || null;
  },
  async updateStudentStatus(id, isActive) {
    const resp = await apiClient.patch(`/users/${id}/status`, { isActive });
    return resp.data || { success: true };
  },
  async deleteStudent(id) {
    const resp = await apiClient.delete(`/users/${id}`);
    return resp.data || { success: true };
  },
};

export const analyticsService = {
  async getAnalytics() {
    const [platform, engagement, enrollments] = await Promise.all([
      apiClient.get('/analytics/platform'),
      apiClient.get('/analytics/engagement'),
      apiClient.get('/analytics/enrollments'),
    ]);

    const platformStats = platform.data?.data || {};
    const courseEngagement = safeArray(engagement.data?.data).map((r) => {
      const completion = r.students_count > 0 ? Math.round((r.completedUsers / r.students_count) * 100) : 0;
      return {
        name: r.title,
        students: r.students_count ?? 0,
        completion,
        rating: r.rating ?? 0,
      };
    });
    const enrollmentsByMonth = safeArray(enrollments.data?.data).map((r) => ({
      month: r.month ? new Date(`${r.month}-01`).toLocaleString('en-US', { month: 'short' }) : '',
      enrollments: r.count ?? 0,
      completions: 0,
    }));

    return {
      enrollmentsByMonth,
      courseEngagement,
      platformStats: {
        activeUsers: platformStats.totalUsers ?? 0,
        totalRevenue: 'N/A',
        avgSessionTime: 'N/A',
        completionRate: 'N/A',
        newStudentsThisMonth: 0,
        totalCertificates: 0,
      },
      weeklyActivity: [],
    };
  },
};
