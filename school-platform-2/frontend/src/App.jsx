import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const NAV_CONFIG = {
  ADMIN: [
    { section: 'Үндсэн', items: [
      { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
      { id: 'students', icon: '👥', label: 'Сурагчид' },
      { id: 'courses', icon: '📚', label: 'Хичээлүүд' },
      { id: 'notifications', icon: '🔔', label: 'Мэдэгдэл' },
    ]},
    { section: 'Систем', items: [
      { id: 'settings', icon: '⚙️', label: 'Тохиргоо' },
    ]},
  ],
  TEACHER: [
    { section: 'Үндсэн', items: [
      { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
      { id: 'courses', icon: '📚', label: 'Миний хичээл' },
      { id: 'students', icon: '👥', label: 'Сурагчид' },
    ]},
  ],
  STUDENT: [
    { section: 'Үндсэн', items: [
      { id: 'dashboard', icon: '⊞', label: 'Миний самбар' },
      { id: 'courses', icon: '📚', label: 'Хичээлүүд' },
      { id: 'notifications', icon: '🔔', label: 'Мэдэгдэл' },
    ]},
  ],
};

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  students: 'Сурагчид',
  courses: 'Хичээлүүд',
  notifications: 'Мэдэгдэл',
  settings: 'Тохиргоо',
};

const COURSE_COLORS = ['#f0b429', '#38bdf8', '#4ade80', '#c084fc', '#fb923c', '#f472b6'];
const COURSE_EMOJIS = ['⚡️', '🔧', '🗄', '⚛️', '🐳', '🐍', '🎯', '🚀', '💡', '🛡'];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPass, setLoginPass] = useState('Admin123!');

  const [toastItems, setToastItems] = useState([]);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', email: '', age: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });

  const role = user?.role || 'STUDENT';
  const canManage = role === 'ADMIN' || role === 'TEACHER';

  useEffect(() => {
    if (!token) return;
    loadAll();
  }, [token]);

  async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `Request failed: ${res.status}`);
    }
    return res.json();
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [studentsRes, coursesRes, notifRes] = await Promise.allSettled([
        apiFetch('/students', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/courses', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/notifications', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const studentsData = studentsRes.status === 'fulfilled' ? studentsRes.value : {};
      const coursesData = coursesRes.status === 'fulfilled' ? coursesRes.value : [];
      const notifData = notifRes.status === 'fulfilled' ? notifRes.value : {};

      setStudents(studentsData.items || []);
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData.items || []);
      setNotifications(notifData.items || []);
    } catch (err) {
      pushToast('Өгөгдөл ачааллахад алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function doLogin() {
    if (!loginEmail || !loginPass) {
      pushToast('Имэйл болон нууц үгээ оруулна уу', 'error');
      return;
    }
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      setToken(data.accessToken);
      setUser({
        id: data.user?.id,
        email: data.user?.email || loginEmail,
        role: data.user?.role || 'STUDENT',
        name: data.user?.email ? data.user.email.split('@')[0] : loginEmail.split('@')[0],
      });
      setLoggedIn(true);
      setCurrentPage('dashboard');
      pushToast(`Тавтай морил, ${loginEmail.split('@')[0]}`, 'success');
    } catch (err) {
      pushToast('Нэвтрэх амжилтгүй. Имэйл эсвэл нууц үг буруу байна.', 'error');
    }
  }

  function logout() {
    setLoggedIn(false);
    setUser(null);
    setToken(null);
    setCurrentPage('dashboard');
    setStudents([]);
    setCourses([]);
    setNotifications([]);
    pushToast('Амжилттай гарлаа', 'info');
  }

  function pushToast(message, type = 'info') {
    const id = Date.now();
    setToastItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToastItems((prev) => prev.filter((t) => t.id !== id)), 3100);
  }

  function openStudentDetail(student) {
    setSelectedStudent(student);
    setDetailOpen(true);
  }

  async function createStudent() {
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.email || !studentForm.age) {
      pushToast('Бүх талбарыг бөглөнө үү', 'error');
      return;
    }
    try {
      const name = `${studentForm.lastName} ${studentForm.firstName}`.trim();
      const payload = { name, email: studentForm.email, age: Number(studentForm.age) };
      await apiFetch('/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setStudentModalOpen(false);
      setStudentForm({ firstName: '', lastName: '', email: '', age: '' });
      pushToast('Сурагч нэмэгдлээ', 'success');
      loadAll();
    } catch (err) {
      pushToast('Сурагч нэмэхэд алдаа гарлаа', 'error');
    }
  }

  async function deleteStudent(id) {
    try {
      await apiFetch(`/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      pushToast('Сурагч устгагдлаа', 'info');
      setDetailOpen(false);
      loadAll();
    } catch {
      pushToast('Сурагч устгахад алдаа гарлаа', 'error');
    }
  }

  async function createCourse() {
    if (!courseForm.title) {
      pushToast('Хичээлийн нэр оруулна уу', 'error');
      return;
    }
    try {
      await apiFetch('/courses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: courseForm.title, description: courseForm.description }),
      });
      setCourseModalOpen(false);
      setCourseForm({ title: '', description: '' });
      pushToast('Хичээл нэмэгдлээ', 'success');
      loadAll();
    } catch (err) {
      pushToast('Хичээл нэмэхэд алдаа гарлаа', 'error');
    }
  }

  async function deleteCourse(id) {
    try {
      await apiFetch(`/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      pushToast('Хичээл устгагдлаа', 'info');
      loadAll();
    } catch {
      pushToast('Хичээл устгахад алдаа гарлаа', 'error');
    }
  }

  const navConfig = NAV_CONFIG[role] || NAV_CONFIG.STUDENT;
  const totalStudents = students.length;
  const totalCourses = courses.length;

  const computedCourses = useMemo(() => (
    courses.map((c, idx) => ({
      ...c,
      color: COURSE_COLORS[idx % COURSE_COLORS.length],
      emoji: COURSE_EMOJIS[idx % COURSE_EMOJIS.length],
      enrolled: c.enrollmentCount ?? 0,
      maxStudents: 30,
    }))
  ), [courses]);

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-bg">
          <div className="login-bg-circle" style={{ width: 500, height: 500, background: '#f0b429', top: -100, right: -100 }} />
          <div className="login-bg-circle" style={{ width: 400, height: 400, background: '#38bdf8', bottom: -80, left: -80 }} />
        </div>
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">🎓</div>
            <h1 className="login-title">EduCore</h1>
            <p className="login-sub">Сургалтын удирдлагын систем</p>
          </div>
          <div className="login-card">
            <div className="form-group">
              <label className="form-label">Имэйл хаяг</label>
              <input
                type="email"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Нууц үг</label>
              <input
                type="password"
                className="form-input"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="login-btn" onClick={doLogin}>
              Нэвтрэх
            </button>
            <div className="login-divider">Хурдан нэвтрэх</div>
            <div className="quick-login-grid">
              <div className="quick-login-btn" onClick={() => { setLoginEmail('admin@example.com'); setLoginPass('Admin123!'); }}>
                <div>👑 Admin</div>
                <div className="quick-login-role">admin@example.com</div>
              </div>
              <div className="quick-login-btn" onClick={() => { setLoginEmail('teacher@example.com'); setLoginPass('Teacher123!'); }}>
                <div>📚 Teacher</div>
                <div className="quick-login-role">teacher@example.com</div>
              </div>
              <div className="quick-login-btn" onClick={() => { setLoginEmail('student@example.com'); setLoginPass('Student123!'); }}>
                <div>🎒 Student</div>
                <div className="quick-login-role">student@example.com</div>
              </div>
            </div>
          </div>
        </div>

        <div id="toast">
          {toastItems.map((t) => (
            <div key={t.id} className={`toast-item ${t.type}`}>
              <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ️'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="app">
        <aside className={`sidebar ${currentPage === 'mobile-open' ? 'open' : ''}`} id="sidebar">
          <div className="logo">
            <div className="logo-icon">🎓</div>
            <span className="logo-text">Edu<span>Core</span></span>
          </div>
          <nav id="nav-links">
            {navConfig.map((section) => (
              <div className="nav-section" key={section.section}>
                <div className="nav-label">{section.section}</div>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.id === 'students' ? <span className="nav-badge">{totalStudents}</span> : null}
                    {item.id === 'courses' ? <span className="nav-badge">{totalCourses}</span> : null}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip" onClick={logout}>
              <div className="user-avatar" style={{ background: '#f0b429', color: '#0d1117' }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{role === 'ADMIN' ? 'Администратор' : role === 'TEACHER' ? 'Багш' : 'Сурагч'}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 12 }}>⏻</span>
            </div>
          </div>
        </aside>

        <div className="main-content">
          <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="page-title">{PAGE_TITLES[currentPage] || 'Dashboard'}</h1>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn notif-dot" onClick={() => setCurrentPage('notifications')}>🔔</button>
              <button className="topbar-btn" onClick={() => setCurrentPage('settings')}>⚙️</button>
            </div>
          </header>

          <div className="page-content" id="page-content">
            {currentPage === 'dashboard' && (
              <div className="fade-in">
                <div className="stats-grid fade-in fade-in-1">
                  <div className="stat-card gold">
                    <div className="stat-icon">👥</div>
                    <div className="stat-label">Нийт сурагч</div>
                    <div className="stat-value">{totalStudents}</div>
                    <div className="stat-sub">Идэвхтэй жагсаалт</div>
                  </div>
                  <div className="stat-card teal">
                    <div className="stat-icon">📚</div>
                    <div className="stat-label">Нийт хичээл</div>
                    <div className="stat-value">{totalCourses}</div>
                    <div className="stat-sub">Системд бүртгэлтэй</div>
                  </div>
                  <div className="stat-card green">
                    <div className="stat-icon">🔔</div>
                    <div className="stat-label">Мэдэгдэл</div>
                    <div className="stat-value">{notifications.length}</div>
                    <div className="stat-sub">Сүүлийн 24 цаг</div>
                  </div>
                  <div className="stat-card red">
                    <div className="stat-icon">✅</div>
                    <div className="stat-label">Статус</div>
                    <div className="stat-value">{loading ? '...' : 'OK'}</div>
                    <div className="stat-sub">API холболт</div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'students' && (
              <div className="fade-in">
                <div className="section-header">
                  <div className="section-actions">
                    <div className="search-wrap">
                      <span className="search-icon">🔍</span>
                      <input type="text" className="search-input" placeholder="Хайх..." />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>{totalStudents} сурагч</span>
                    {role === 'ADMIN' && (
                      <button className="btn btn-primary btn-sm" onClick={() => setStudentModalOpen(true)}>＋ Нэмэх</button>
                    )}
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Нэр</th>
                        <th>Имэйл</th>
                        <th>Нас</th>
                        <th>Үүссэн</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="5">
                            <div className="empty-state">
                              <div className="empty-state-icon">🔍</div>
                              <div className="empty-state-title">Олдсонгүй</div>
                            </div>
                          </td>
                        </tr>
                      ) : students.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div className="avatar" style={{ background: '#f0b429', color: '#0d1117' }}>{(s.name || 'S')[0]}</div>
                              <div>
                                <div style={{ fontWeight: 500 }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{s.email}</td>
                          <td>{s.age}</td>
                          <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openStudentDetail(s)}>👁</button>
                              {role === 'ADMIN' && (
                                <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(s.id)}>Устгах</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentPage === 'courses' && (
              <div className="fade-in">
                <div className="section-header">
                  <div className="section-title">Хичээлүүд</div>
                  {canManage && (
                    <button className="btn btn-primary btn-sm" onClick={() => setCourseModalOpen(true)}>＋ Хичээл нэмэх</button>
                  )}
                </div>
                <div className="course-grid">
                  {computedCourses.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                      <div className="empty-state-icon">📚</div>
                      <div className="empty-state-title">Хичээл олдсонгүй</div>
                    </div>
                  ) : computedCourses.map((c) => (
                    <div key={c.id} className="course-card">
                      <div className="course-thumb" style={{ background: `${c.color}22` }}>
                        <span style={{ fontSize: 40 }}>{c.emoji}</span>
                      </div>
                      <div className="course-body">
                        <div className="course-title">{c.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.description || 'Тайлбаргүй'}</div>
                        <div style={{ marginTop: 10 }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(100, (c.enrolled / c.maxStudents) * 100)}%`, background: c.color }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{c.enrolled}/{c.maxStudents} сурагч</div>
                        </div>
                        {canManage && (
                          <div style={{ marginTop: 10 }}>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>Устгах</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'notifications' && (
              <div className="fade-in">
                <div className="section-header">
                  <div className="section-title">Мэдэгдлүүд</div>
                </div>
                <div className="card">
                  {notifications.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🔔</div>
                      <div className="empty-state-title">Мэдэгдэл алга</div>
                    </div>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 36, height: 36, background: 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{n.type}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{n.message}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'settings' && (
              <div className="fade-in">
                <div className="card">
                  <div className="section-title" style={{ marginBottom: 12 }}>Тохиргоо</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Энд тохиргооны хэсэг нэмэгдэнэ.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {studentModalOpen && (
        <div className="modal-overlay open" onClick={() => setStudentModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Шинэ сурагч</h2>
              <button className="modal-close" onClick={() => setStudentModalOpen(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Овог</label>
                <input className="form-input" value={studentForm.lastName} onChange={(e) => setStudentForm((s) => ({ ...s, lastName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Нэр</label>
                <input className="form-input" value={studentForm.firstName} onChange={(e) => setStudentForm((s) => ({ ...s, firstName: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Имэйл</label>
              <input className="form-input" type="email" value={studentForm.email} onChange={(e) => setStudentForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Нас</label>
              <input className="form-input" type="number" value={studentForm.age} onChange={(e) => setStudentForm((s) => ({ ...s, age: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setStudentModalOpen(false)}>Болих</button>
              <button className="btn btn-primary" onClick={createStudent}>Хадгалах</button>
            </div>
          </div>
        </div>
      )}

      {courseModalOpen && (
        <div className="modal-overlay open" onClick={() => setCourseModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Шинэ хичээл</h2>
              <button className="modal-close" onClick={() => setCourseModalOpen(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Нэр</label>
              <input className="form-input" value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Тайлбар</label>
              <textarea className="form-input" rows="3" value={courseForm.description} onChange={(e) => setCourseForm((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCourseModalOpen(false)}>Болих</button>
              <button className="btn btn-primary" onClick={createCourse}>Хадгалах</button>
            </div>
          </div>
        </div>
      )}

      {detailOpen && selectedStudent && (
        <div className="modal-overlay open" onClick={() => setDetailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Сурагчийн дэлгэрэнгүй</h2>
              <button className="modal-close" onClick={() => setDetailOpen(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
              <div className="gpa-ring">{selectedStudent.age}<span>Нас</span></div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedStudent.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{selectedStudent.email}</div>
              </div>
            </div>
            <div className="modal-footer">
              {role === 'ADMIN' && <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(selectedStudent.id)}>Устгах</button>}
              <button className="btn btn-ghost" onClick={() => setDetailOpen(false)}>Хаах</button>
            </div>
          </div>
        </div>
      )}

      <div id="toast">
        {toastItems.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
