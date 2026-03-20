import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Download, ChevronLeft, ChevronRight, Loader2, PlayCircle } from 'lucide-react';
import { useLesson, useLessons, useCourse, useMarkComplete } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: lesson, isLoading, isError } = useLesson(id);
  const { data: course } = useCourse(lesson?.courseId);
  const { data: lessons = [] } = useLessons(lesson?.courseId);
  const markComplete = useMarkComplete();

  const getVideoId = (lessonData) => {
    if (!lessonData) return '';
    if (lessonData.videoId) return lessonData.videoId;
    if (lessonData.videoUrl) {
      if (/^[A-Za-z0-9_-]{11}$/.test(lessonData.videoUrl)) return lessonData.videoUrl;
      const m = lessonData.videoUrl.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
    return '';
  };

  const videoId = getVideoId(lesson);
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');
  const getFileTypeLabel = (name, url) => {
    const source = name || url || '';
    const match = source.match(/\.([A-Za-z0-9]+)(?:\?|#|$)/);
    if (!match) return 'FILE';
    return match[1].toUpperCase();
  };
  const getFileTypeStyle = (label) => {
    switch (label) {
      case 'PPT':
      case 'PPTX':
        return { background: '#fff7ed', color: '#c2410c' };
      case 'DOC':
      case 'DOCX':
        return { background: '#eff6ff', color: '#1d4ed8' };
      case 'PDF':
        return { background: '#fef2f2', color: '#b91c1c' };
      case 'XLS':
      case 'XLSX':
        return { background: '#ecfdf5', color: '#047857' };
      default:
        return { background: 'var(--surface)', color: 'var(--text-muted)' };
    }
  };


  const isEnrolled   = (user?.enrolledCourses || []).includes(lesson?.courseId);
  const sectionTitle = lesson?.section || course?.sections?.find((s) => s.id === lesson?.sectionId)?.title || '';
  const currentIdx   = lessons.findIndex((l) => l.id === id);
  const prevLesson   = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson   = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  const handleMarkComplete = async () => {
    if (lesson?.isCompleted) return;
    try {
      await markComplete.mutateAsync(id);
      toast.success('Lesson marked as completed! ✅');
    } catch { toast.error('Failed to update progress'); }
  };

  if (isError) return <div className="pt-8"><ErrorState message="Lesson not found" onRetry={() => navigate('/courses')} /></div>;
  if (isLoading) return <LessonSkeleton />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(course ? `/courses/${course.id}` : '/courses')} className="btn-ghost flex items-center gap-2 text-sm -ml-2">
          <ArrowLeft className="w-4 h-4" /> {course ? course.title : 'Back to Courses'}
        </button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentIdx + 1} / {lessons.length}</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Main */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Video */}
          <div className="card overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#0f172a' }}>
              {videoId ? (
                <iframe className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title={lesson?.title || 'Lesson video'} allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              ) : lesson?.videoUrl ? (
                <video className="absolute inset-0 w-full h-full" controls>
                  <source src={lesson.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white/20 mb-3" />
                  <p className="text-white/40 text-sm">Video not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {lesson.isCompleted && <Badge variant="success" dot>Completed</Badge>}
                  {sectionTitle && <Badge variant="default">{sectionTitle}</Badge>}
                </div>
                <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-main)' }}>{lesson.title}</h1>
              </div>
              <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3.5 h-3.5" /> {lesson.duration}
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>

            {lesson.materials?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {lesson.materials.map((m, idx) => {
                    const name = typeof m === 'string' ? m : m?.name;
                    const fileUrl = typeof m === 'string' ? null : m?.fileUrl;
                    const href = fileUrl ? `${apiBase}${fileUrl}` : null;
                    const fileType = getFileTypeLabel(name, fileUrl);
                    const fileTypeStyle = getFileTypeStyle(fileType);
                    return href ? (
                      <a key={m?.id || idx} href={href} download
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-brand-600 dark:text-brand-400"
                        style={{ background: 'var(--brand-light)' }}>
                        <Download className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{name}</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
                          style={fileTypeStyle}>
                          {fileType}
                        </span>
                        <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>
                          Download
                        </span>
                      </a>
                    ) : (
                      <span key={m?.id || idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 opacity-70"
                        style={{ background: 'var(--brand-light)' }}>
                        <Download className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{name}</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
                          style={fileTypeStyle}>
                          {fileType}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex gap-3">
                {prevLesson && (
                  <button onClick={() => navigate(`/lessons/${prevLesson.id}`)} className="btn-secondary flex items-center gap-2 text-sm">
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                )}
                {nextLesson && (
                  <button onClick={() => navigate(`/lessons/${nextLesson.id}`)} className="btn-secondary flex items-center gap-2 text-sm">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isEnrolled && (
                <button onClick={handleMarkComplete}
                  disabled={lesson.isCompleted || markComplete.isPending}
                  className={cn('flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all',
                    lesson.isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 cursor-default'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  )}>
                  {markComplete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {lesson.isCompleted ? 'Completed!' : 'Mark as Complete'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:w-72 flex-shrink-0">
          <div className="card overflow-hidden xl:sticky xl:top-[80px] max-h-[calc(100vh-110px)] flex flex-col">
            <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{course?.title || 'Lessons'}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{lessons.length} lessons</p>
            </div>
            <div className="overflow-y-auto scroll-area flex-1">
              {lessons.map((l, i) => (
                <button key={l.id} onClick={() => navigate(`/lessons/${l.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: l.id === id ? 'var(--brand-light)' : 'transparent',
                  }}
                  onMouseEnter={e => l.id !== id && (e.currentTarget.style.background = 'var(--surface)')}
                  onMouseLeave={e => l.id !== id && (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: l.id === id ? 'var(--brand)' : l.isCompleted ? '#d1fae5' : 'var(--surface)',
                      color: l.id === id ? '#fff' : l.isCompleted ? '#059669' : 'var(--text-muted)',
                    }}>
                    {l.isCompleted && l.id !== id ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: l.id === id ? 'var(--brand)' : 'var(--text-main)' }}>
                      {l.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-40 rounded-lg" />
      <div className="flex gap-5">
        <div className="flex-1 space-y-4">
          <Skeleton className="w-full rounded-2xl" style={{ paddingBottom: '56.25%', display: 'block' }} />
          <div className="card p-5 space-y-3">
            <Skeleton className="h-5 w-2/3 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        </div>
        <div className="w-72">
          <div className="card p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-2.5 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
