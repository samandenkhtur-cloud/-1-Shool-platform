import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useCreateCourse } from '../hooks/useData';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function CreateCoursePage() {
  const navigate = useNavigate();
  const createCourse = useCreateCourse();

  const [form, setForm] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Course title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await createCourse.mutateAsync({ title: form.title, description: form.description });
      toast.success('Course created successfully!');
      navigate('/courses');
    } catch {
      toast.error('Failed to create course');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Create New Course</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Provide the course title and description</p>
      </div>

      <form onSubmit={handlePublish} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Course Title *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to Python"
            className={cn('input-field', errors.title && 'border-rose-400 focus:ring-rose-400')} />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description *</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="What will students learn?"
            rows={4} className={cn('input-field resize-none', errors.description && 'border-rose-400')} />
          {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
        </div>

        <button type="submit" disabled={createCourse.isPending} className="btn-primary flex items-center gap-2">
          {createCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {createCourse.isPending ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
}
