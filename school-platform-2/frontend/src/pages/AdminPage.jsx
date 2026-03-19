import { useState } from 'react';
import { ShieldCheck, BookOpen, Users, BarChart3, PlusCircle, Trash2, Search, X } from 'lucide-react';
import { useCourses, useCreateCourse, useDeleteCourse, useStudents } from '../hooks/useData';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
];

export function AdminPage() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <ShieldCheck className="w-6 h-6 text-brand-600" /> Admin Panel
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage courses and students</p>
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

      {tab === 'overview' && <AdminOverview />}
      {tab === 'courses' && <AdminCourses />}
      {tab === 'students' && <AdminStudentsTab />}
    </div>
  );
}

function AdminOverview() {
  const { data: coursesData } = useCourses();
  const { data: studentsData } = useStudents({ page: 1, pageSize: 1 });

  const courses = coursesData?.courses || [];
  const totalCourses = courses.length;
  const totalStudents = studentsData?.total || 0;
  const enrollments = courses.reduce((s, c) => s + (c.studentsCount || 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', value: totalCourses, color: 'bg-brand-600' },
          { label: 'Total Students', value: totalStudents, color: 'bg-emerald-600' },
          { label: 'Enrollments', value: enrollments, color: 'bg-violet-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5 text-white`}
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <p className="text-3xl font-display font-bold">{value}</p>
            <p className="text-xs opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCourses() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCourses({ search });
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();

  const courses = data?.courses || [];

  const handleCreate = async (form) => {
    try {
      await createCourse.mutateAsync(form);
      toast.success('Course created');
      setShowCreate(false);
    } catch {
      toast.error('Failed to create course');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse.mutateAsync(id);
      toast.success('Course removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..." className="input-field pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>
        <button onClick={() => setShowCreate((v) => !v)} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <PlusCircle className="w-4 h-4" /> Create Course
        </button>
      </div>

      {showCreate && <CreateCourseForm onSubmit={handleCreate} onClose={() => setShowCreate(false)} />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Course', 'Students', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={4} className="px-4 py-6 text-sm" style={{ color: '#f43f5e' }}>
                  {error?.userMessage || 'Failed to load courses.'} <button onClick={refetch} className="underline">Retry</button>
                </td></tr>
              ) : isLoading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : courses.map((c) => (
                <tr key={c.id} className="group transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{c.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.description || 'No description'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{c.studentsCount?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg transition-colors text-rose-500" title="Delete"
                      onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && !isError && courses.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No courses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateCourseForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({ title: '', description: '' });

  const handle = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    onSubmit(form);
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
      <form onSubmit={handle} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Course Title *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to Chemistry" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Course description..." rows={3} className="input-field resize-none" />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" className="btn-primary text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Course
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminStudentsTab() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useStudents({ q: search, page: 1, pageSize: 100 });
  const students = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..." className="input-field pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Student', 'Email', 'Age', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={4} className="px-4 py-6 text-sm" style={{ color: '#f43f5e' }}>
                  Failed to load students. <button onClick={refetch} className="underline">Retry</button>
                </td></tr>
              ) : isLoading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className="group transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-main)' }}>{s.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.age}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!isLoading && !isError && students.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
