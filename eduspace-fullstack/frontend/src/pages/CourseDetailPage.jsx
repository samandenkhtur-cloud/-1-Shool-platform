import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Clock, Star, ChevronDown, ChevronRight, PlayCircle, CheckCircle2, Lock, Download, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCourse, useLessons, useProgress, useEnrollCourse, useCreateLesson, useUploadLessonMaterial } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton, LessonItemSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import { getLevelColor, getCategoryIcon } from '../lib/utils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function CourseDetailPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);

  const { data: course, isLoading, isError } = useCourse(id);
  const { data: lessons = [] } = useLessons(id);
  const { data: progress } = useProgress(id);
  const enrollMutation = useEnrollCourse();
  const createLessonMutation = useCreateLesson();
  const uploadMaterialMutation = useUploadLessonMaterial();

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    title: '', sectionId: course?.sections?.[0]?.id || '', duration: '', videoId: '', description: '', pptFile: null,
  });
  const [creatingLesson, setCreatingLesson] = useState(false);

  const isTeachingCourse = !!user; // allow both teachers and students to add lessons in this dev mode (as requested)


  useEffect(() => {
    if (course?.sections?.length) {
      setNewLessonData((prev) => ({ ...prev, sectionId: course.sections[0].id }));
    }
  }, [course]);

  const resetNewLesson = () => {
    setNewLessonData({ title: '', sectionId: course?.sections?.[0]?.id || '', duration: '', videoId: '', description: '', pptFile: null });
  };

  const handleAddLesson = async () => {
    if (!newLessonData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    setCreatingLesson(true);
    try {
      const lesson = await createLessonMutation.mutateAsync({
        title: newLessonData.title,
        description: newLessonData.description,
        duration: newLessonData.duration,
        sectionId: newLessonData.sectionId,
        courseId: id,
        videoUrl: newLessonData.videoId,
        videoType: 'youtube',
        materials: [],
      });

      if (newLessonData.pptFile) {
        await uploadMaterialMutation.mutateAsync({ lessonId: lesson.id, file: newLessonData.pptFile });
      }

      toast.success('Lesson added successfully');
      setIsAddLessonOpen(false);
      resetNewLesson();
    } catch (err) {
      toast.error('Failed to add lesson');
    } finally {
      setCreatingLesson(false);
    }
  };


  const enrolledIds = user?.enrolledCourses || [];
  const isEnrolled  = enrolledIds.includes(id);

  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync(id);
      refreshUser();
      toast.success('Successfully enrolled! 🎓');
    } catch { toast.error('Enrollment failed'); }
  };

  if (isError) return <div className="pt-8"><ErrorState message="Course not found" onRetry={() => navigate('/courses')} /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      {isLoading ? <CourseDetailSkeleton /> : (
        <>
          {/* Hero */}
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${course.bgGradient} text-white p-6 md:p-8`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge bg-white/20 text-white border-0">{course.category}</span>
                <span className="badge bg-white/20 text-white border-0">{course.level}</span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">{course.title}</h1>
              <p className="text-white/80 text-sm max-w-2xl mb-5 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.teacher}`} name={course.teacher} size="sm" />
                  <span className="font-medium">{course.teacher}</span>
                </div>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 opacity-70" /> {course.studentsCount?.toLocaleString()}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 opacity-70" /> {course.lessonsCount} lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 opacity-70" /> {course.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            {/* Curriculum */}
            <div className="flex-1 min-w-0 space-y-4">
              {isEnrolled && progress && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Your Progress</h3>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{progress.percentage}%</span>
                  </div>
                  <ProgressBar value={progress.percentage} size="md" />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {progress.completedLessons} of {progress.totalLessons} lessons completed
                  </p>
                </div>
              )}

              {isTeachingCourse && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Instructor tools</h3>
                    <button
                      onClick={() => setIsAddLessonOpen((v) => !v)}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      {isAddLessonOpen ? 'Cancel' : 'Add Lesson'}
                    </button>
                  </div>

                  {isAddLessonOpen && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={newLessonData.title}
                          onChange={(e) => setNewLessonData((v) => ({ ...v, title: e.target.value }))}
                          className="input-field"
                          placeholder="Lesson title"
                        />
                        <select
                          value={newLessonData.sectionId}
                          onChange={(e) => setNewLessonData((v) => ({ ...v, sectionId: e.target.value }))}
                          className="input-field"
                        >
                          {(course?.sections || []).map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={newLessonData.duration}
                          onChange={(e) => setNewLessonData((v) => ({ ...v, duration: e.target.value }))}
                          className="input-field"
                          placeholder="Duration (e.g. 35 min)"
                        />
                        <input
                          value={newLessonData.videoId}
                          onChange={(e) => setNewLessonData((v) => ({ ...v, videoId: e.target.value }))}
                          className="input-field"
                          placeholder="YouTube Video ID or URL"
                        />
                      </div>
                      <textarea
                        value={newLessonData.description}
                        onChange={(e) => setNewLessonData((v) => ({ ...v, description: e.target.value }))}
                        className="input-field resize-none"
                        placeholder="Lesson description"
                        rows={3}
                      />
                      <div>
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Upload PPT (optional)</label>
                        <input
                          type="file"
                          accept=".ppt,.pptx,.pdf"
                          onChange={(e) => setNewLessonData((v) => ({ ...v, pptFile: e.target.files?.[0] || null }))}
                          className="mt-1"
                        />
                      </div>
                      <button
                        onClick={handleAddLesson}
                        disabled={creatingLesson}
                        className="btn-primary text-sm"
                      >
                        {creatingLesson ? 'Adding...' : 'Save Lesson'}
                      </button>
                    </div>
                  )}

                  {!isAddLessonOpen && (
                    <p className="text-xs text-muted">Use this panel to add a new lesson and attach PPT material directly to the course.</p>
                  )}
                </div>
              )}

              <div className="card overflow-hidden">
                <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-main)' }}>Course Curriculum</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {course.sections?.length} sections · {course.lessonsCount} lessons
                  </p>
                </div>
                <div>
                  {(course.sections || []).map((section, si) => {
                    const sectionLessons = lessons.filter((l) => l.sectionId === section.id);
                    const isOpen = openSection === section.id || si === 0;
                    return (
                      <div key={section.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <button onClick={() => setOpenSection(isOpen ? null : section.id)}
                          className="w-full flex items-center justify-between p-4 text-left transition-colors"
                          style={{ background: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{section.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sectionLessons.length} lessons</p>
                          </div>
                          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {isOpen && (
                          <div style={{ background: 'var(--surface)' }}>
                            {sectionLessons.length === 0
                              ? <div className="px-4 py-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>No lessons</div>
                              : sectionLessons.map((lesson, li) => {
                                  const canAccess = isEnrolled || li === 0;
                                  return (
                                    <div key={lesson.id}
                                      className={cn('flex items-center gap-3 px-4 py-3 group transition-colors', canAccess && 'cursor-pointer')}
                                      style={{ borderTop: '1px solid var(--border)', opacity: !canAccess ? 0.6 : 1 }}
                                      onMouseEnter={e => canAccess && (e.currentTarget.style.background = 'var(--card-bg)')}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      onClick={() => canAccess && navigate(`/lessons/${lesson.id}`)}
                                    >
                                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                        lesson.isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-brand-50 dark:bg-brand-950/50')}>
                                        {lesson.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          : canAccess ? <PlayCircle className="w-4 h-4 text-brand-500" />
                                          : <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate transition-colors" style={{ color: 'var(--text-main)' }}>{lesson.title}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lesson.duration}</p>
                                      </div>
                                      {lesson.materials?.length > 0 && <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                                      {canAccess && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />}
                                    </div>
                                  );
                                })
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 space-y-4 flex-shrink-0">
              <div className="card p-5 space-y-4 lg:sticky lg:top-[80px]">
                {isEnrolled ? (
                  <>
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Enrolled
                      </span>
                    </div>
                    <Link to={`/lessons/${lessons[0]?.id}`} className="btn-primary w-full text-center block text-sm">
                      {progress?.percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-1">
                      <p className="font-display font-bold text-xl" style={{ color: 'var(--text-main)' }}>Free</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Full lifetime access</p>
                    </div>
                    <button onClick={handleEnroll} disabled={enrollMutation.isPending} className="btn-primary w-full text-sm">
                      {enrollMutation.isPending ? 'Enrolling…' : 'Enroll Now — Free'}
                    </button>
                  </>
                )}

                <div className="space-y-2 text-sm pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  {[
                    [BookOpen, `${course.lessonsCount} lessons`],
                    [Clock,    course.duration],
                    [Users,    `${course.studentsCount?.toLocaleString()} enrolled`],
                    [Star,     `${course.rating} rating`],
                  ].map(([Icon, label]) => (
                    <div key={label} className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Icon className="w-3.5 h-3.5 opacity-70" /> {label}
                    </div>
                  ))}
                </div>

                {course.tags?.length > 0 && (
                  <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Tag className="w-3 h-3" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="flex gap-5">
        <div className="flex-1 space-y-4">
          <div className="card p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <LessonItemSkeleton key={i} />)}
          </div>
        </div>
        <div className="w-72">
          <div className="card p-5 space-y-4">
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
