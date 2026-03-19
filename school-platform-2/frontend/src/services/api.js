import axios from 'axios';

const resolveApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:8080';
  try {
    const url = new URL(envUrl);
    const isDockerHost = url.hostname === 'api-gateway';
    const isLocalBrowser =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isDockerHost && isLocalBrowser) return 'http://localhost:8080';
    return envUrl;
  } catch {
    return envUrl;
  }
};

const API_BASE = resolveApiBase();

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('auth_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

apiClient.interceptors.response.use((r) => r, (err) => {
  if (err.response?.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
  }
  const apiMessage = err.response?.data?.error?.message;
  err.userMessage = apiMessage || err.message || 'Request failed';
  return Promise.reject(err);
});

const normalizeCourse = (c) => ({
  ...c,
  studentsCount: c.enrollmentCount ?? c.studentsCount ?? 0,
});

export const authService = {
  async login({ email, password }) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
  },
  async register({ email, password, role }) {
    const { data } = await apiClient.post('/auth/register', { email, password, role });
    return { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
  },
  async refresh({ refreshToken }) {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
  },
  async logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
  },
};

export const coursesService = {
  async getCourses({ search } = {}) {
    const { data } = await apiClient.get('/courses');
    let courses = (Array.isArray(data) ? data : []).map(normalizeCourse);
    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter((x) =>
        x.title?.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q)
      );
    }
    return { courses, total: courses.length };
  },
  async getCourse(id) {
    const { data } = await apiClient.get(`/courses/${id}`);
    return normalizeCourse(data);
  },
  async enrollCourse({ courseId, studentId }) {
    const { data } = await apiClient.post(`/courses/${courseId}/enroll`, { studentId });
    return data;
  },
  async createCourse(data) {
    const payload = { title: data.title, description: data.description };
    const { data: created } = await apiClient.post('/courses', payload);
    return normalizeCourse(created);
  },
  async deleteCourse(id) {
    await apiClient.delete(`/courses/${id}`);
    return { success: true };
  },
};

export const studentsService = {
  async getStudents({ page = 1, pageSize = 100, q, email } = {}) {
    const params = { page, pageSize };
    if (q) params.q = q;
    if (email) params.email = email;
    const { data } = await apiClient.get('/students', { params });
    return data;
  },
  async getStudent(id) {
    const { data } = await apiClient.get(`/students/${id}`);
    return data;
  },
  async getStudentByEmail(email) {
    const result = await this.getStudents({ page: 1, pageSize: 1, email });
    return result?.items?.[0] || null;
  },
  async createStudent(data) {
    const { data: created } = await apiClient.post('/students', data);
    return created;
  },
  async updateStudent(id, data) {
    const { data: updated } = await apiClient.patch(`/students/${id}`, data);
    return updated;
  },
  async deleteStudent(id) {
    await apiClient.delete(`/students/${id}`);
    return { success: true };
  },
};

export const notificationsService = {
  async getNotifications({ limit = 20 } = {}) {
    const { data } = await apiClient.get('/notifications', { params: { limit } });
    return data;
  },
};
