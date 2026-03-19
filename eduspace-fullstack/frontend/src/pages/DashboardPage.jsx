import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import { useCoursesWithProgress, useLessonsTable, useEnrollCourse } from '../hooks/useData';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { LessonsTable } from '../components/dashboard/LessonsTable';
import { CourseCard } from '../components/courses/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import { EmptyCourses } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const enrolledIds = user?.enrolledCourses || [];
  const isStudent   = user?.role === 'student';

  const coursesQuery  = useCoursesWithProgress();
  const lessonsQuery  = useLessonsTable();
  const enrollMutation = useEnrollCourse();

  const allCourses     = coursesQuery.data?.courses || [];
  const displayCourses = isStudent
    ? allCourses.filter((c) => enrolledIds.includes(c.id)).slice(0, 4)
    : allCourses.slice(0, 4);

  const handleEnroll = async (courseId) => {
    try {
      await enrollMutation.mutateAsync(courseId);
      refreshUser();
      toast.success('Successfully enrolled! 🎓');
    } catch { toast.error('Enrollment failed'); }
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-main)' }}>
              {isStudent ? t.myCourses : t.featuredCourses}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isStudent
                ? `${enrolledIds.length} ${t.enrolled}`
                : `${allCourses.length} ${t.total}`}
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
        ) : isStudent && displayCourses.length === 0 ? (
          <div className="card">
            <EmptyCourses onExplore={() => navigate('/courses')} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayCourses.map((course) => (
              <CourseCard
                key={course.id} course={course}
                enrolled={enrolledIds.includes(course.id)}
                onEnroll={handleEnroll}
                enrolling={enrollMutation.isPending && enrollMutation.variables === course.id}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <LessonsTable
          lessons={lessonsQuery.data || []}
          loading={lessonsQuery.isLoading}
          error={lessonsQuery.isError}
        />
      </section>
    </div>
  );
}
