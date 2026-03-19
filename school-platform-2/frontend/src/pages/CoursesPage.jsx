import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useCourses, useEnrollCourse } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { CourseCard } from '../components/courses/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import { EmptySearch, EmptyCourses, ErrorState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export function CoursesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const enrollMutation = useEnrollCourse();
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  const { data, isLoading, isError, error, refetch } = useCourses({ search });
  const courses = data?.courses || [];
  const canEnroll = user?.role === 'student';

  const handleEnroll = async (courseId) => {
    try {
      if (!user?.studentId) throw new Error('Student profile not found');
      await enrollMutation.mutateAsync({ courseId, studentId: user.studentId });
      toast.success('Enrolled successfully!');
    } catch {
      toast.error('Enrollment failed');
    }
  };

  const clear = () => { setSearch(''); setSearchParams({}); };
  const hasFilters = search;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Courses</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {isLoading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" placeholder="Search courses..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          {hasFilters && (
            <button onClick={clear} className="btn-ghost flex items-center gap-1.5 text-sm whitespace-nowrap">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState message={error?.userMessage || error?.message} onRetry={refetch} />
      ) : courses.length === 0 ? (
        search ? <EmptySearch query={search} /> : <EmptyCourses onExplore={clear} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id} course={course}
              enrolled={false}
              onEnroll={canEnroll ? handleEnroll : undefined}
              enrolling={enrollMutation.isPending && enrollMutation.variables?.courseId === course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
