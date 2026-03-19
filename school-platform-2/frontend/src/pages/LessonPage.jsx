import { PlayCircle } from 'lucide-react';

export function LessonPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <PlayCircle className="w-6 h-6 text-brand-600" /> Lesson
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Lesson content is not available yet. This requires a lessons backend service.
        </p>
      </div>
      <div className="card p-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        Add lesson APIs to load video content, materials, and progress tracking.
      </div>
    </div>
  );
}
