import { TrendingUp, Users, BookOpen, Award, Clock, Star, BarChart2, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAllProgress, useAnalytics, useCoursesWithProgress } from '../hooks/useData';
import { ProgressBar } from '../components/ui/ProgressBar';

function BarChart({ data, xKey, bars, height = 160 }) {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No data available</div>;
  }
  const maxVal = Math.max(...data.map((d) => Math.max(...bars.map((b) => d[b.key] || 0))));
  return (
    <svg viewBox={`0 0 ${data.length * 60} ${height + 40}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={0} y1={height - t * height} x2={data.length * 60} y2={height - t * height}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="4 2" />
      ))}
      {data.map((d, i) => {
        const x = i * 60 + 5;
        const bw = bars.length === 1 ? 38 : 17;
        return (
          <g key={i}>
            {bars.map((bar, bi) => {
              const val = d[bar.key] || 0;
              const bh = maxVal > 0 ? (val / maxVal) * height : 0;
              return (
                <rect key={bar.key} x={x + bi * (bw + 3)} y={height - bh} width={bw} height={bh}
                  rx={4} fill={bar.color} opacity="0.85" />
              );
            })}
            <text x={x + (bars.length === 1 ? 19 : 17)} y={height + 16} textAnchor="middle"
              fontSize={9} fill="var(--text-muted)">{d[xKey]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ value, size = 80, color = '#005dce', label }) {
  const r = 32, c = 2 * Math.PI * r, dash = (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" />
        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-main)">{value}%</text>
      </svg>
      {label && <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>}
    </div>
  );
}

const legendColors = ['#005dce','#17a34a','#10b981','#7c3aed','#f59e0b','#06b6d4'];

export function AnalyticsPage() {
  const { user } = useAuth();
  const { data: analyticsData } = useAnalytics(user?.role !== 'student');
  const { data: coursesData } = useCoursesWithProgress();
  const { data: progressData } = useAllProgress();
  const a = analyticsData || { enrollmentsByMonth: [], courseEngagement: [], platformStats: {}, weeklyActivity: [] };
  const courses = coursesData?.courses || [];

  if (user?.role === 'student') {
    const enrolledIds = user?.enrolledCourses || [];
    const enrolled = courses.filter((c) => enrolledIds.includes(c.id));
    const completedLessons = Object.values(progressData || {}).reduce((s, p) => s + (p.completedLessons || 0), 0);
    const avgProgress = enrolled.length
      ? Math.round(enrolled.reduce((s, c) => s + (progressData?.[c.id]?.percentage ?? c.progress), 0) / enrolled.length)
      : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>My Progress</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your learning statistics and course progress</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Enrolled', value: enrolled.length,     bg: 'var(--brand-light)', fg: 'var(--brand)', icon: BookOpen },
            { label: 'Lessons',  value: completedLessons,    bg: '#d1fae5',             fg: '#059669',      icon: Award },
            { label: 'Hours',    value: '24h',               bg: '#ede9fe',             fg: '#7c3aed',      icon: Clock },
            { label: 'Avg %',    value: `${avgProgress}%`,   bg: '#fef3c7',             fg: '#d97706',      icon: TrendingUp },
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
        <div className="card p-5">
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Course Progress</h2>
          {enrolled.length === 0
            ? <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Enroll in courses to track your progress</p>
            : (
              <div className="space-y-5">
                {enrolled.map((course) => {
                  const pct = progressData?.[course.id]?.percentage ?? course.progress;
                  const colorMap = { c001:'blue', c002:'emerald', c003:'amber', c004:'violet', c005:'rose', c006:'cyan' };
                  return (
                    <div key={course.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.bgGradient} flex items-center justify-center flex-shrink-0`}>
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{course.title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{progressData?.[course.id]?.completedLessons ?? 0}/{course.lessonsCount} lessons</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color={colorMap[course.id] || 'blue'} size="md" />
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Weekly Activity</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Lessons and quizzes this week</p>
          <BarChart data={a.weeklyActivity} xKey="day"
            bars={[{ key: 'lessons', label: 'Lessons', color: '#005dce' }, { key: 'quizzes', label: 'Quizzes', color: '#10b981' }]} />
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}><span className="w-3 h-3 rounded bg-brand-600" /> Lessons</span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}><span className="w-3 h-3 rounded bg-emerald-500" /> Quizzes</span>
          </div>
        </div>
      </div>
    );
  }

  const ps = a.platformStats || {};
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <BarChart2 className="w-6 h-6 text-brand-600" /> Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Platform performance and engagement overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Users',   value: ps.activeUsers,          color: 'bg-brand-600' },
          { label: 'Avg Session',    value: ps.avgSessionTime,        color: 'bg-emerald-600' },
          { label: 'Completion',     value: ps.completionRate,        color: 'bg-violet-600' },
          { label: 'New Students',   value: ps.newStudentsThisMonth,  color: 'bg-cyan-600' },
          { label: 'Certificates',   value: ps.totalCertificates,     color: 'bg-amber-500' },
          { label: 'Revenue',        value: ps.totalRevenue,          color: 'bg-rose-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${color}`} />
            <p className="text-lg font-display font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Enrollment Trend</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Monthly enrollments & completions</p>
          <BarChart data={a.enrollmentsByMonth} xKey="month"
            bars={[{ key: 'enrollments', color: '#005dce' }, { key: 'completions', color: '#10b981' }]} height={140} />
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Weekly Activity</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Lessons & quizzes</p>
          <BarChart data={a.weeklyActivity} xKey="day"
            bars={[{ key: 'lessons', color: '#005dce' }, { key: 'quizzes', color: '#10b981' }]} height={140} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Course Engagement</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Course','Students','Completion','Rating','Progress'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.courseEngagement.map((row) => (
                <tr key={row.name} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-3 py-3 text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{row.name}</td>
                  <td className="px-3 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{row.students?.toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <span className="badge text-xs font-semibold" style={{
                      background: row.completion >= 70 ? '#d1fae5' : row.completion >= 50 ? '#fef3c7' : '#fee2e2',
                      color: row.completion >= 70 ? '#15803d' : row.completion >= 50 ? '#b45309' : '#b91c1c',
                    }}>{row.completion}%</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{row.rating}
                    </span>
                  </td>
                  <td className="px-3 py-3 min-w-[120px]">
                    <ProgressBar value={row.completion} size="sm" color={row.completion >= 70 ? 'emerald' : row.completion >= 50 ? 'amber' : 'rose'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-4" style={{ color: 'var(--text-main)' }}>Completion Overview</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {a.courseEngagement.map((row, i) => (
            <DonutChart key={row.name} value={row.completion} color={legendColors[i % legendColors.length]}
              label={row.name.split(' ').slice(0, 2).join(' ')} />
          ))}
        </div>
      </div>
    </div>
  );
}
