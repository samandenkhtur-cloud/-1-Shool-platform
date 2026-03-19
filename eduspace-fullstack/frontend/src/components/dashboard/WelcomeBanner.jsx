import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Flame, Clock, Trophy, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { useStats } from '../../hooks/useData';
import { StatCard } from './StatCard';

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t.goodMorning;
  if (h < 17) return t.goodAfternoon;
  return t.goodEvening;
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const { t }    = useLocale();
  const { data: stats, isLoading } = useStats(user?.role);
  const firstName = user?.name?.split(' ')[0] || 'there';

  const statConfigByRole = {
    student: [
      { key: 'enrolledCourses',  label: t.enrolledCourses,  icon: BookOpen,  color: 'blue' },
      { key: 'completedLessons', label: t.completedLessons, icon: Trophy,    color: 'emerald' },
      { key: 'hoursLearned',     label: t.hoursLearned,     icon: Clock,     color: 'violet' },
      { key: 'streak',           label: t.dayStreak,        icon: Flame,     color: 'amber', suffix: 'd' },
    ],
    teacher: [
      { key: 'activeCourses',   label: t.activeCourses,  icon: BookOpen,  color: 'blue' },
      { key: 'totalStudents',   label: t.totalStudents,  icon: Users,     color: 'emerald' },
      { key: 'lessonsCreated',  label: t.lessonsCreated, icon: Clock,     color: 'violet' },
      { key: 'avgRating',       label: t.avgRating,      icon: Flame,     color: 'amber' },
    ],
    admin: [
      { key: 'totalCourses',      label: t.totalCourses,   icon: BookOpen,  color: 'blue' },
      { key: 'totalStudents',     label: t.totalStudents,  icon: Users,     color: 'emerald' },
      { key: 'totalTeachers',     label: t.totalTeachers,  icon: Clock,     color: 'violet' },
      { key: 'activeEnrollments', label: t.enrollments,    icon: BarChart3, color: 'amber' },
    ],
  };

  const heroCopy = {
    student: { sub: t.studentSub, cta: t.exploreCourses,    to: '/courses' },
    teacher: { sub: t.teacherSub, cta: t.createCourseBtn,   to: '/courses/new' },
    admin:   { sub: t.adminSub,   cta: t.viewAnalytics,     to: '/analytics' },
  };

  const statConfigs = statConfigByRole[user?.role] || statConfigByRole.student;
  const hero = heroCopy[user?.role] || heroCopy.student;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-brand"
        style={{ background: 'linear-gradient(135deg, #0049a7 0%, #005dce 50%, #1d4ed8 100%)' }}
      >
        <div className="absolute top-[-40px] right-[-40px] w-44 h-44 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20px] right-[80px] w-28 h-28 bg-white/05 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">{getGreeting(t)},</p>
            <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">{firstName} 👋</h1>
            <p className="text-brand-200 text-sm max-w-md leading-relaxed">{hero.sub}</p>
          </div>
          <Link
            to={hero.to}
            className="flex items-center gap-2 bg-white text-brand-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-sm flex-shrink-0 self-start sm:self-auto"
          >
            {hero.cta} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfigs.map((cfg) => (
          <StatCard
            key={cfg.key}
            icon={cfg.icon}
            label={cfg.label}
            value={isLoading ? '—' : `${stats?.[cfg.key] ?? 0}${cfg.suffix || ''}`}
            color={cfg.color}
            loading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
