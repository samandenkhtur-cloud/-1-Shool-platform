import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { useNotifications, useStats } from '../../hooks/useData';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { MiniCalendar } from '../ui/MiniCalendar';
import { Bell, Clock } from 'lucide-react';

const roleBadge = { student: 'primary', teacher: 'success', admin: 'purple' };

export function RightPanel() {
  const { user } = useAuth();
  const { t }    = useLocale();
  const { data: stats } = useStats(user?.role);
  const { data: notifications = [] } = useNotifications();

  const reminders = notifications.slice(0, 4);

  return (
    <aside className="hidden xl:flex flex-col w-[272px] flex-shrink-0 gap-4">
      {/* Profile */}
      <div className="card p-5">
        <div className="flex flex-col items-center text-center">
          <Avatar src={user?.avatar} name={user?.name} size="xl" online className="mb-3" />
          <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-main)' }}>{user?.name}</h3>
          <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <Badge variant={roleBadge[user?.role] || 'default'} className="capitalize">{user?.role}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-col)' }}>
          {user?.role === 'student' && (
            <>
              <Stat label={t.courses}  value={stats?.enrolledCourses ?? 0} />
              <Stat label={t.recorded} value={stats?.completedLessons ?? 0} />
              <Stat label="Streak"     value={`${stats?.streak ?? 0}d`} accent />
            </>
          )}
          {user?.role === 'teacher' && (
            <>
              <Stat label={t.courses}        value={stats?.activeCourses ?? 0} />
              <Stat label={t.totalStudents}  value={stats?.totalStudents ?? 0} />
              <Stat label={t.avgRating}      value={stats?.avgRating ?? 0} accent />
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Stat label={t.courses}      value={stats?.totalCourses ?? 0} />
              <Stat label={t.enrollments}  value={stats?.activeEnrollments ?? 0} />
              <Stat label="Active"         value="N/A" accent />
            </>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-4">
        <MiniCalendar />
      </div>

      {/* Reminders */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Bell className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            {t.reminders}
          </h4>
          <button className="text-xs text-brand-600 dark:text-brand-400 font-medium">{t.viewAll}</button>
        </div>
        <div className="space-y-2">
          {reminders.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No reminders yet
            </p>
          )}
          {reminders.map((r) => (
            <div key={r.id}
              className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors"
              style={{ background: 'var(--surface)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border-col)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div className="w-2 min-h-[32px] rounded-full flex-shrink-0 bg-brand-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>{r.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold" style={{ color: accent ? 'var(--brand)' : 'var(--text-main)' }}>{value}</p>
      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{label}</p>
    </div>
  );
}
