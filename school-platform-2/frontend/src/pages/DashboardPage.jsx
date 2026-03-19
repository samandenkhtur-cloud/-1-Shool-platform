import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import { useCourses, useEnrollCourse, useNotifications } from '../hooks/useData';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { CourseCard } from '../components/courses/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import { EmptyCourses } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const coursesQuery = useCourses();
  const notificationsQuery = useNotifications();
  const enrollMutation = useEnrollCourse();

  const allCourses = coursesQuery.data?.courses || [];
  const displayCourses = allCourses.slice(0, 4);
  const canEnroll = user?.role === 'student';

  const handleEnroll = async (courseId) => {
    try {
      if (!user?.studentId) throw new Error('Student profile not found');
      await enrollMutation.mutateAsync({ courseId, studentId: user.studentId });
      toast.success('Successfully enrolled!');
    } catch {
      toast.error('Enrollment failed');
    }
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-main)' }}>
              {t.featuredCourses}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {`${allCourses.length} ${t.total}`}
            </p>
          </div>
          <Link to="/courses" className="btn-ghost text-xs flex items-center gap-1">
            {t.viewAll} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {coursesQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="card">
            <EmptyCourses onExplore={() => navigate('/courses')} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={false}
                onEnroll={canEnroll ? handleEnroll : undefined}
                enrolling={enrollMutation.isPending && enrollMutation.variables?.courseId === course.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-main)' }}>Notifications</h2>
          <Link to="/analytics" className="btn-ghost text-xs flex items-center gap-1">
            {t.viewAll} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {notificationsQuery.isLoading ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading notifications...</p>
        ) : (notificationsQuery.data?.items || []).length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
        ) : (
          <ul className="space-y-2">
            {(notificationsQuery.data?.items || []).slice(0, 5).map((n) => (
              <li key={n.id} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {n.message || n.type} - {new Date(n.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
