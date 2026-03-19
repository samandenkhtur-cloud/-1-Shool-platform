import { BarChart2, Users, BookOpen, Bell } from 'lucide-react';
import { useCourses, useNotifications, useStudents } from '../hooks/useData';

export function AnalyticsPage() {
  const { data: coursesData } = useCourses();
  const { data: studentsData } = useStudents({ page: 1, pageSize: 1 });
  const { data: notifications } = useNotifications();

  const totalCourses = coursesData?.courses?.length || 0;
  const totalStudents = studentsData?.total || 0;
  const totalEnrollments = (coursesData?.courses || []).reduce((s, c) => s + (c.studentsCount || 0), 0);
  const totalNotifications = notifications?.total || (notifications?.items?.length || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <BarChart2 className="w-6 h-6 text-brand-600" /> Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Platform overview based on live data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Courses', value: totalCourses, icon: BookOpen, bg: 'var(--brand-light)', fg: 'var(--brand)' },
          { label: 'Students', value: totalStudents, icon: Users, bg: '#d1fae5', fg: '#059669' },
          { label: 'Enrollments', value: totalEnrollments, icon: Users, bg: '#ede9fe', fg: '#7c3aed' },
          { label: 'Notifications', value: totalNotifications, icon: Bell, bg: '#fef3c7', fg: '#d97706' },
        ].map(({ label, value, icon: Icon, bg, fg }) => (
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

      <div className="card p-5">
        <h2 className="font-bold mb-2" style={{ color: 'var(--text-main)' }}>Notes</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Detailed analytics (lesson progress, completions, and session metrics) require additional backend endpoints.
        </p>
      </div>
    </div>
  );
}
