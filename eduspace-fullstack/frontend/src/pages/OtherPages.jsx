import { Link } from 'react-router-dom';
import { Library } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCoursesWithProgress } from '../hooks/useData';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function LibraryPage() {
  const { data } = useCoursesWithProgress();
  const courses = data?.courses || [];
  const emojis = ['📐','💻','🏛️','🎨','🔬','📚'];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Video Library</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>All available course recordings</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.length === 0 && (
          <div className="card p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No courses available yet.
          </div>
        )}
        {courses.map((course, i) => (
          <Link key={course.id} to={`/courses/${course.id}`}
            className="card card-hover p-4 flex items-center gap-4 block">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.bgGradient} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{emojis[i % emojis.length]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>{course.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{course.lessonsCount} lessons · {course.teacher}</p>
              <p className="text-xs font-semibold mt-1 text-brand-600 dark:text-brand-400">{course.studentsCount?.toLocaleString()} enrolled</p>
            </div>
            <Badge variant="default">{course.level}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name || '', email: user?.email || '' });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, email: form.email });
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-6 max-w-2xl space-y-5">
        <h2 className="font-bold" style={{ color: 'var(--text-main)' }}>Profile Information</h2>
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={user?.name} size="xl" online />
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{user?.name}</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              {user?.role}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email Address</label>
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" className="input-field" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Notifications */}
      <div className="card p-6 max-w-2xl">
        <h2 className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Notifications</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Control what you receive notifications about</p>
        <div className="space-y-3">
          {['New lesson available','Assignment reminders','Enrollment confirmations','Grade updates','Live session alerts'].map((item) => (
            <label key={item} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm" style={{ color: 'var(--text-main)' }}>{item}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 rounded-full peer peer-checked:bg-brand-600 transition-colors" style={{ background: 'var(--border)' }} />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6 max-w-2xl">
        <h2 className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Appearance</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Customize your visual experience</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Use the <span className="font-semibold">🌙 / ☀️ button</span> in the top header to toggle between light and dark mode. Your preference is saved automatically.
        </p>
      </div>
    </div>
  );
}
