import { useState } from 'react';
import { Search, X, Users, BookOpen, TrendingUp, UserCheck, UserX, Mail } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useStudent, useStudents } from '../hooks/useData';

export function StudentsPage() {
  const { data: students = [] } = useStudents();
  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('all');
  const [selected, setSelected]   = useState(null);
  const { data: selectedStudent } = useStudent(selected?.id);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const status = s.isActive ? 'active' : 'inactive';
    return (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      && (statusFilter === 'all' || status === statusFilter);
  });

  const active   = students.filter((s) => s.isActive).length;
  const inactive = students.filter((s) => !s.isActive).length;
  const avgP     = 0;

  if (selected && !selectedStudent) return (
    <div className="card p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
      Loading student details...
    </div>
  );
  if (selected && selectedStudent) return <StudentDetail student={selectedStudent} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Users className="w-6 h-6 text-brand-600" /> Students
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage and monitor student activity</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-2">
          <UserCheck className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: students.length, bg: 'var(--brand-light)', fg: 'var(--brand)', icon: Users },
          { label: 'Active',   value: active,   bg: '#d1fae5', fg: '#059669', icon: UserCheck },
          { label: 'Inactive', value: inactive, bg: '#fee2e2', fg: '#b91c1c', icon: UserX },
          { label: 'Avg %',    value: `${avgP}%`,bg: '#ede9fe', fg: '#7c3aed', icon: TrendingUp },
        ].map(({ label, value, bg, fg, icon: Icon }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color: fg }} />
            </div>
            <div>
              <p className="text-xl font-display font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or emailâ€¦" className="input-field pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => setFilter(e.target.value)} className="input-field sm:w-40">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Student','Email','Courses','Avg Progress','Last Active','Status',''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const avg = 0;
                const status = s.isActive ? 'active' : 'inactive';
                return (
                  <tr key={s.id} className="transition-colors group" style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.avatar} name={s.name} size="sm" online={status === 'active'} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{s.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <BookOpen className="w-3.5 h-3.5 opacity-60" /> {s.enrolledCourses?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={avg} size="sm" className="flex-1" />
                        <span className="text-xs font-semibold w-8" style={{ color: 'var(--text-main)' }}>{avg}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {s.lastActive ? new Date(s.lastActive).toLocaleString() : 'â€”'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status === 'active' ? 'success' : 'default'} dot className="capitalize">{status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(s)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                        View â†’
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentDetail({ student, onBack }) {
  const enrolled = student.enrolledCourses || [];
  const colorMap = { c001:'blue', c002:'emerald', c003:'amber', c004:'violet', c005:'rose', c006:'cyan' };
  const status = student.isActive ? 'active' : 'inactive';

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={onBack} className="btn-ghost text-sm flex items-center gap-2 -ml-2">â† Back to Students</button>

      <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <Avatar src={student.avatar} name={student.name} size="xl" online={status === 'active'} />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-main)' }}>{student.name}</h1>
            <Badge variant={status === 'active' ? 'success' : 'default'} dot className="capitalize">{status}</Badge>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{student.email}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'} Â· Last active {student.lastActive ? new Date(student.lastActive).toLocaleString() : '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Message</button>
          <button className="btn-primary text-sm">Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Enrolled',    value: enrolled.length },
          { label: 'Avg Progress',value: '0%' },
          { label: 'Completed',  value: student.completedLessonsCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-display font-bold text-brand-600 dark:text-brand-400">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Course Progress</h2>
        <div className="space-y-4">
          {enrolled.map((course) => {
            const pct = 0;
            return (
              <div key={course.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.bgGradient} flex items-center justify-center flex-shrink-0`}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{course.title}</p>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400 ml-2">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={colorMap[course.id] || 'blue'} size="md" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


