import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { useCourse, useEnrollCourse } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: course, isLoading, isError, refetch } = useCourse(id);
  const enrollMutation = useEnrollCourse();

  const handleEnroll = async () => {
    try {
      if (!user?.studentId) throw new Error('Student profile not found');
      await enrollMutation.mutateAsync({ courseId: id, studentId: user.studentId });
      toast.success('Successfully enrolled!');
    } catch {
      toast.error('Enrollment failed');
    }
  };

  if (isLoading) return <CourseDetailSkeleton />;
  if (isError || !course) return <div className="pt-8"><ErrorState message="Course not found" onRetry={refetch} /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">{course.title}</h1>
          <p className="text-white/80 text-sm max-w-2xl mb-5 leading-relaxed">{course.description || 'No description provided.'}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 opacity-70" /> {course.studentsCount?.toLocaleString() || 0} enrolled</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 opacity-70" /> Created {new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-main)' }}>About this course</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {course.description || 'No description provided.'}
        </p>
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Course ID: {course.id}</span>
          <span>Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
        </div>
        {user?.role === 'student' ? (
          <button onClick={handleEnroll} disabled={enrollMutation.isPending} className="btn-primary text-sm">
            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
          </button>
        ) : (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Log in as a student to enroll.
          </p>
        )}
      </div>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="card p-5 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}
