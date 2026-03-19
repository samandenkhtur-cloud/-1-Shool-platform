import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, BookOpen } from 'lucide-react';
import { useCoursesWithProgress, useEnrollCourse } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { CourseCard } from '../components/courses/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import { EmptySearch, EmptyCourses, ErrorState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','Mathematics','Programming','Humanities','Arts','Science','Languages'];
const LEVELS     = ['all','Beginner','Intermediate','Advanced'];

export function CoursesPage() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const enrollMutation = useEnrollCourse();

  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [level,    setLevel]    = useState('all');
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => { const q = searchParams.get('search'); if (q) setSearch(q); }, [searchParams]);

  const { data, isLoading, isError, refetch } = useCoursesWithProgress({ category, level, search });
  const courses = data?.courses || [];
  const enrolledIds = user?.enrolledCourses || [];
  const display = enrolled ? courses.filter((c) => enrolledIds.includes(c.id)) : courses;

  const handleEnroll = async (courseId) => {
    try {
      await enrollMutation.mutateAsync(courseId);
      refreshUser();
      toast.success('Enrolled successfully! 🎓');
    } catch { toast.error('Enrollment failed'); }
  };

  const clear = () => { setSearch(''); setCategory('all'); setLevel('all'); setEnrolled(false); setSearchParams({}); };
  const hasFilters = search || category !== 'all' || level !== 'all' || enrolled;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Courses</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {isLoading ? 'Loading…' : `${display.length} course${display.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {user?.role === 'student' && (
          <button onClick={() => setEnrolled((v) => !v)} className={enrolled ? 'btn-primary text-sm flex items-center gap-2' : 'btn-secondary text-sm flex items-center gap-2'}>
            <BookOpen className="w-3.5 h-3.5" />
            {enrolled ? 'Showing My Courses' : 'My Courses'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" placeholder="Search courses, teachers, topics…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-44">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field sm:w-36">
            {LEVELS.map((l) => <option key={l} value={l}>{l === 'all' ? 'All Levels' : l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clear} className="btn-ghost flex items-center gap-1.5 text-sm whitespace-nowrap">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: category === c ? 'var(--brand)' : 'var(--surface)',
                color: category === c ? '#fff' : 'var(--text-muted)',
              }}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : display.length === 0 ? (
        search ? <EmptySearch query={search} /> : <EmptyCourses onExplore={clear} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map((course) => (
            <CourseCard
              key={course.id} course={course}
              enrolled={enrolledIds.includes(course.id)}
              onEnroll={handleEnroll}
              enrolling={enrollMutation.isPending && enrollMutation.variables === course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
