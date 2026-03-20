import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, BookOpen, Users, BarChart3, PlusCircle, Edit3, Trash2,
  Radio, Star, Clock, CheckCircle2, Search, X, ToggleRight
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { useCourses, useLiveSessions, useStudents, useStats, useCreateCourse, useDeleteCourse } from '../hooks/useData';
import { coursesService } from '../services/api';

const TABS = [
  { id: 'overview', label: 'Overview',  icon: BarChart3 },
  { id: 'courses',  label: 'Courses',   icon: BookOpen },
  { id: 'students', label: 'Students',  icon: Users },
  { id: 'live',     label: 'Live',      icon: Radio },
];

export function AdminPage() {
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <ShieldCheck className="w-6 h-6 text-brand-600" /> Admin Panel
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage all platform content and users</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'var(--surface)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === id ? 'var(--card-bg)' : 'transparent',
              color: tab === id ? 'var(--brand)' : 'var(--text-muted)',
              boxShadow: tab === id ? '0 1px 8px rgba(0,0,0,0.07)' : 'none',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview'  && <AdminOverview />}
      {tab === 'courses'   && <AdminCourses navigate={navigate} />}
      {tab === 'students'  && <AdminStudentsTab />}
      {tab === 'live'      && <AdminLive />}
    </div>
  );
}

/* ── Overview ─────────────────────────────────── */
function AdminOverview() {
  const { data: stats } = useStats('admin');
  const { data: coursesData } = useCourses();
  const { data: sessions = [] } = useLiveSessions();

  const coursesList = coursesData?.courses || [];
  const total    = stats?.totalStudents ?? 0;
  const courses  = stats?.totalCourses ?? coursesList.length;
  const enroll   = stats?.activeEnrollments ?? 0;
  const live     = sessions.filter((l) => l.status === 'live').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses',  value: courses, color: 'bg-brand-600' },
          { label: 'Total Students', value: total,   color: 'bg-emerald-600' },
          { label: 'Enrollments',    value: enroll,  color: 'bg-violet-600' },
          { label: 'Live Now',       value: live,    color: 'bg-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5 text-white`}
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <p className="text-3xl font-display font-bold">{value}</p>
            <p className="text-xs opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Courses Overview</h2>
        <div className="space-y-2">
          {coursesList.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl transition-colors"
              style={{ background: 'var(--surface)' }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bgGradient} flex items-center justify-center flex-shrink-0`}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{c.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.teacher} · {c.studentsCount} students</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />{c.rating}
              </div>
              <Badge variant={c.level === 'Beginner' ? 'success' : c.level === 'Intermediate' ? 'warning' : 'danger'}>
                {c.level}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Courses Management ───────────────────────── */
function AdminCourses({ navigate }) {
  const { data, isLoading, refetch } = useCourses();
  const courses = data?.courses || [];
  const deleteMutation = useDeleteCourse();
  const [search, setSearch]   = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = courses.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.teacher || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…" className="input-field pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>
        <button onClick={() => setShowCreate((v) => !v)} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <PlusCircle className="w-4 h-4" /> Create Course
        </button>
      </div>

      {showCreate && <CreateCourseForm onClose={() => setShowCreate(false)} onCreated={refetch} />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Course','Teacher','Category','Students','Rating','Level','Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="group transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.bgGradient} flex items-center justify-center flex-shrink-0`}>
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{c.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.lessonsCount} lessons · {c.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.teacher}`} name={c.teacher} size="xs" />
                      <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{c.teacher}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="default">{c.category}</Badge></td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{c.studentsCount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />{c.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.level === 'Beginner' ? 'success' : c.level === 'Intermediate' ? 'warning' : 'danger'}>
                      {c.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg transition-colors" title="Toggle"
                        style={{ color: 'var(--brand)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={async () => {
                          try {
                            await coursesService.togglePublish(c.id);
                            toast.success('Status updated');
                            refetch();
                          } catch {
                            toast.error('Failed to update status');
                          }
                        }}>
                        <ToggleRight className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg transition-colors" title="Edit"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => navigate(`/courses/${c.id}`)}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg transition-colors text-rose-500" title="Delete"
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={async () => {
                          try {
                            await deleteMutation.mutateAsync(c.id);
                            toast.success('Course removed');
                            refetch();
                          } catch {
                            toast.error('Failed to remove course');
                          }
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateCourseForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', teacher: '', category: 'Mathematics', level: 'Beginner', description: '' });
  const createMutation = useCreateCourse();

  const handle = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      await createMutation.mutateAsync({
        title: form.title,
        description: form.description || 'No description',
        category: form.category,
        level: form.level,
        isPublished: true,
      });
      toast.success('Course created successfully!');
      onCreated?.();
      onClose();
    } catch {
      toast.error('Failed to create course');
    }
  };

  return (
    <div className="card p-5 animate-slide-up" style={{ border: '2px solid var(--brand)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: 'var(--text-main)' }}>Create New Course</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Course Title *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to Chemistry" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Teacher</label>
          <input value={form.teacher} onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
            placeholder="Teacher name" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
            {['Mathematics','Programming','Humanities','Arts','Science','Languages'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Level</label>
          <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="input-field">
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Course description…" rows={3} className="input-field resize-none" />
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" className="btn-primary text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Course
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Students Tab ─────────────────────────────── */
function AdminStudentsTab() {
  const { data: students = [] } = useStudents();
  const [search, setSearch] = useState('');
  const filtered = students.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…" className="input-field pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>
        <button className="btn-primary text-sm flex items-center gap-2 whitespace-nowrap">
          <PlusCircle className="w-4 h-4" /> Add Student
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Student','Email','Courses','Avg Progress','Joined','Status','Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const avg = 0;
                const status = s.isActive ? 'active' : 'inactive';
                return (
                  <tr key={s.id} className="group transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.avatar} name={s.name} size="sm" online={status === 'active'} />
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{s.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.enrolledCourses?.length ?? 0}</td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={avg} size="sm" className="flex-1" />
                        <span className="text-xs font-bold w-8" style={{ color: 'var(--text-main)' }}>{avg}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status === 'active' ? 'success' : 'default'} dot className="capitalize">{status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg text-rose-500 transition-colors"
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => toast.error('Student suspended')}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Live Sessions Management ─────────────────── */
function AdminLive() {
  const { data: sessions = [] } = useLiveSessions();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{sessions.length} sessions total</p>
        <button className="btn-primary text-sm flex items-center gap-2">
          <Radio className="w-4 h-4" /> Schedule Session
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((s) => {
          const isLive = s.status === 'live';
          return (
            <div key={s.id} className="card p-4"
              style={{ border: isLive ? '2px solid #fca5a5' : '1px solid var(--border)', boxShadow: isLive ? '0 0 0 3px rgba(239,68,68,0.1)' : undefined }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="badge text-xs font-bold" style={{
                      background: isLive ? '#ef4444' : s.status === 'upcoming' ? 'var(--brand-light)' : 'var(--surface)',
                      color: isLive ? '#fff' : s.status === 'upcoming' ? 'var(--brand)' : 'var(--text-muted)',
                    }}>
                      {isLive ? '● LIVE' : s.status === 'upcoming' ? 'Upcoming' : 'Ended'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.courseName}</span>
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{s.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg text-rose-500 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => toast.error('Session cancelled')}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.teacher}`} name={s.teacher} size="xs" />
                <span>{s.teacher}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.attendees}/{s.maxAttendees}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration} min</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
