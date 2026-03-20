import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, GripVertical, Video, Link, BookOpen, ChevronDown, ChevronUp, CheckCircle2, Loader2 } from 'lucide-react';
import { useCreateCourse } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['Mathematics','Programming','Humanities','Arts','Science','Languages'];
const LEVELS     = ['Beginner','Intermediate','Advanced'];
const GRADIENTS  = [
  { label: 'Blue',   value: 'from-blue-500 to-indigo-600',   preview: 'linear-gradient(135deg,#3a9bff,#4f46e5)' },
  { label: 'Green',  value: 'from-emerald-500 to-teal-600',  preview: 'linear-gradient(135deg,#10b981,#0d9488)' },
  { label: 'Purple', value: 'from-violet-500 to-purple-600', preview: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  { label: 'Amber',  value: 'from-amber-500 to-orange-600',  preview: 'linear-gradient(135deg,#f59e0b,#ea580c)' },
  { label: 'Pink',   value: 'from-pink-500 to-rose-600',     preview: 'linear-gradient(135deg,#ec4899,#be185d)' },
  { label: 'Cyan',   value: 'from-cyan-500 to-sky-600',      preview: 'linear-gradient(135deg,#06b6d4,#0284c7)' },
];

/* ── Video item inside a section ── */
function VideoItem({ video, idx, onChange, onRemove }) {
  return (
    <div className="rounded-xl p-4 space-y-3 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <Video className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Lesson {idx + 1}</span>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-lg text-rose-400 transition-colors"
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Lesson Title *</label>
          <input value={video.title} onChange={(e) => onChange({ ...video, title: e.target.value })}
            placeholder="e.g. Introduction to Variables" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Duration</label>
          <input value={video.duration} onChange={(e) => onChange({ ...video, duration: e.target.value })}
            placeholder="e.g. 45 min" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>YouTube Video ID or URL</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={video.videoId}
            onChange={(e) => {
              let val = e.target.value;
              const match = val.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
              if (match) val = match[1];
              onChange({ ...video, videoId: val });
            }}
            placeholder="dQw4w9WgXcQ or full YouTube URL" className="input-field pl-9" />
        </div>
        {video.videoId && (
          <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-medium">✓ Video ID: {video.videoId}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
        <textarea value={video.description} onChange={(e) => onChange({ ...video, description: e.target.value })}
          placeholder="What will students learn in this lesson?" rows={2} className="input-field resize-none" />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Lesson Thumbnail (optional)</label>
        <input type="file" accept="image/*" className="input-field" onChange={(e) => {
          const file = e.target.files?.[0];
          onChange({ ...video, thumbnail: file ? URL.createObjectURL(file) : '' });
        }} />
        {video.thumbnail && (
          <img src={video.thumbnail} alt="lesson thumbnail" className="mt-2 w-24 h-24 object-cover rounded" />
        )}
      </div>
    </div>
  );
}

/* ── Section block ── */
function SectionBlock({ section, idx, onChange, onRemove, onAddVideo }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 p-4 cursor-pointer transition-colors"
        style={{ borderBottom: open ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}
        onClick={() => setOpen((v) => !v)}>
        <BookOpen className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <span className="text-sm font-bold flex-1 truncate" style={{ color: 'var(--text-main)' }}>
          Section {idx + 1}: {section.title || 'Untitled Section'}
        </span>
        <span className="text-xs mr-2" style={{ color: 'var(--text-muted)' }}>{section.videos.length} lessons</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 rounded-lg text-rose-400 transition-colors mr-1"
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Section Title *</label>
            <input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })}
              placeholder="e.g. Python Basics" className="input-field max-w-sm" />
          </div>
          <div className="space-y-3">
            {section.videos.map((v, vi) => (
              <VideoItem key={v.id} video={v} idx={vi}
                onChange={(updated) => { const vids = [...section.videos]; vids[vi] = updated; onChange({ ...section, videos: vids }); }}
                onRemove={() => onChange({ ...section, videos: section.videos.filter((_, i) => i !== vi) })} />
            ))}
          </div>
          <button onClick={onAddVideo}
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors py-1">
            <PlusCircle className="w-4 h-4" /> Add Lesson / Video
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Step indicator ── */
function StepDot({ n, current }) {
  const done   = n < current;
  const active = n === current;
  return (
    <div className={cn(
      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
      done ? 'bg-emerald-500 text-white' : active ? 'text-white shadow-brand' : 'text-xs font-medium',
    )}
    style={{ background: done ? undefined : active ? 'var(--brand)' : 'var(--border)', color: done || active ? undefined : 'var(--text-muted)' }}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : n}
    </div>
  );
}

/* ── Main page ── */
export function CreateCoursePage() {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const createCourse = useCreateCourse();

  const [form, setForm] = useState({
    title: '', description: '', teacher: user?.name || '',
    category: 'Programming', level: 'Beginner', duration: '',
    bgGradient: GRADIENTS[0].value, tags: '',
    thumbnail: null, thumbnailPreview: '',
  });
  const [sections, setSections] = useState([{ id: 's1', title: '', videos: [] }]);
  const [errors, setErrors]     = useState({});
  const [step, setStep]         = useState(1);

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Course title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.teacher.trim())     e.teacher     = 'Teacher name is required';
    if (!form.duration.trim())    e.duration    = 'Duration is required';
    return e;
  };

  const addSection = () => setSections((s) => [...s, { id: `s${Date.now()}`, title: '', videos: [] }]);
  const addVideo   = (si) => setSections((secs) => secs.map((s, i) => i === si
    ? { ...s, videos: [...s.videos, { id: `v${Date.now()}`, title: '', duration: '', videoId: '', description: '' }] }
    : s));

  const totalVideos = sections.reduce((sum, s) => sum + s.videos.length, 0);
  const selectedGrad = GRADIENTS.find((g) => g.value === form.bgGradient) || GRADIENTS[0];

  const handlePublish = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setStep(1); return; }

    const normalizedSections = sections.map((section, si) => ({
      title: section.title,
      order: si,
      lessons: (section.videos || []).map((video, li) => {
        const youtubeId = video.videoId || (video.videoUrl && video.videoUrl.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)?.[1]);
        const resolvedVideoUrl = video.videoUrl ? video.videoUrl : (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '');
        return {
          title: video.title,
          description: video.description,
          duration: video.duration,
          videoUrl: resolvedVideoUrl,
          videoType: youtubeId ? 'youtube' : 'upload',
          order: li,
        };
      }),
    }));

    try {
      await createCourse.mutateAsync({
        ...form,
        sections: normalizedSections,
        lessonsCount: totalVideos,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isPublished: true,
      });
      toast.success('Course published successfully! 🎉');
      navigate('/courses');
    } catch {
      toast.error('Failed to publish course');
    }
  };

  const STEP_LABELS = ['Course Info', 'Content & Videos', 'Preview & Publish'];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Create New Course</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Build your course step by step</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center">
            <button onClick={() => setStep(i + 1)} className="flex items-center gap-2">
              <StepDot n={i + 1} current={step} />
              <span className="text-xs font-semibold hidden sm:block"
                style={{ color: step === i + 1 ? 'var(--brand)' : 'var(--text-muted)' }}>{label}</span>
            </button>
            {i < 2 && (
              <div className="w-8 h-px mx-2 rounded"
                style={{ background: step > i + 1 ? '#10b981' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Info ── */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Basic Information</h2>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Course Title *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Introduction to Python Programming"
                className={cn('input-field', errors.title && 'border-rose-400 focus:ring-rose-400')} />
              {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description *</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What will students learn, prerequisites, and course goals…"
                rows={4} className={cn('input-field resize-none', errors.description && 'border-rose-400')} />
              {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Course Thumbnail</label>
              <input type="file" accept="image/*" className="input-field" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm((f) => ({
                  ...f,
                  thumbnail: file,
                  thumbnailPreview: file ? URL.createObjectURL(file) : '',
                }));
              }} />
              {form.thumbnailPreview && (
                <img src={form.thumbnailPreview} alt="course thumbnail" className="mt-2 w-32 h-20 object-cover rounded" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Teacher Name *</label>
                <input value={form.teacher} onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                  placeholder="Dr. Jane Smith" className={cn('input-field', errors.teacher && 'border-rose-400')} />
                {errors.teacher && <p className="text-xs text-rose-500 mt-1">{errors.teacher}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Duration *</label>
                <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g. 8 weeks" className={cn('input-field', errors.duration && 'border-rose-400')} />
                {errors.duration && <p className="text-xs text-rose-500 mt-1">{errors.duration}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Level</label>
                <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="input-field">
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="Python, Programming, OOP" className="input-field" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Course Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {GRADIENTS.map((g) => (
                  <button key={g.value} onClick={() => setForm((f) => ({ ...f, bgGradient: g.value }))}
                    className={cn('w-10 h-10 rounded-xl transition-all', form.bgGradient === g.value && 'ring-2 ring-offset-2 ring-brand-500 scale-110')}
                    style={{ background: g.preview }} title={g.label} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => { const e = validate(); setErrors(e); if (!Object.keys(e).length) setStep(2); }} className="btn-primary">
              Next: Add Videos →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Content ── */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Course Content</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sections.length} sections · {totalVideos} lessons</p>
            </div>
            <button onClick={addSection} className="btn-primary text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add Section
            </button>
          </div>

          {sections.map((sec, si) => (
            <SectionBlock key={sec.id} section={sec} idx={si}
              onChange={(updated) => setSections((s) => s.map((x, i) => i === si ? updated : x))}
              onRemove={() => setSections((s) => s.filter((_, i) => i !== si))}
              onAddVideo={() => addVideo(si)} />
          ))}

          {sections.length === 0 && (
            <div className="card p-8 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-brand-300" />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No sections yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add a section to start building your curriculum</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary">Preview & Publish →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview ── */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card overflow-hidden">
            <div className="h-36 flex items-center justify-center relative" style={{ background: selectedGrad.preview }}>
              <div className="text-center text-white relative z-10">
                <p className="text-4xl mb-2">📚</p>
                <h2 className="font-display font-bold text-xl px-4">{form.title || 'Untitled Course'}</h2>
              </div>
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-xs font-semibold">
                {form.level}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>{form.category}</span>
                <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{form.duration}</span>
                <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{totalVideos} lessons</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{form.description}</p>
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>👨‍🏫 {form.teacher}</p>
              {form.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-4 space-y-2">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Curriculum Summary</h3>
            {sections.map((sec, i) => (
              <div key={sec.id} className="flex items-center justify-between py-2" style={{ borderBottom: i < sections.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                  <span className="font-semibold">Section {i + 1}:</span> {sec.title || 'Untitled'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sec.videos.length} lessons</span>
              </div>
            ))}
            {sections.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No sections added</p>}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary">← Edit Content</button>
            <button onClick={handlePublish} disabled={createCourse.isPending}
              className="btn-primary flex items-center gap-2">
              {createCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {createCourse.isPending ? 'Publishing…' : 'Publish Course'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
