import { BookOpen } from 'lucide-react';

export function LessonsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <BookOpen className="w-6 h-6 text-brand-600" /> Lessons
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Lessons are not available yet. This requires a lessons backend service.
        </p>
      </div>
      <div className="card p-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        When the lessons service is ready, this page will list upcoming and completed lessons.
      </div>
    </div>
  );
}
