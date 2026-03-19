import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Library } from 'lucide-react';
import { useCourses } from '../hooks/useData';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function LibraryPage() {
  const { data } = useCourses();
  const courses = data?.courses || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Video Library</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>All available course recordings</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`}
            className="card card-hover p-4 flex items-center gap-4 block">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>{course.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{course.description || 'No description'}</p>
              <p className="text-xs font-semibold mt-1 text-brand-600 dark:text-brand-400">{course.studentsCount?.toLocaleString() || 0} enrolled</p>
            </div>
            <Badge variant="default">Course</Badge>
          </Link>
        ))}
        {courses.length === 0 && (
          <div className="card p-6 text-sm" style={{ color: 'var(--text-muted)' }}>No courses available</div>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

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
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email Address</label>
            <input defaultValue={user?.email} type="email" className="input-field" disabled />
          </div>
        </div>
        <button
          className="btn-primary text-sm"
          disabled={saving}
          onClick={() => {
            if (!name.trim()) { toast.error('Name is required'); return; }
            setSaving(true);
            updateProfile({ name: name.trim() });
            setSaving(false);
            toast.success('Profile updated');
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
