import { Radio } from 'lucide-react';

export function LiveLessonsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <Radio className="w-6 h-6 text-brand-600" /> Live Sessions
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Live sessions are not available yet. This requires a live sessions backend service.
        </p>
      </div>
      <div className="card p-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        Once live sessions are supported, upcoming and active sessions will appear here.
      </div>
    </div>
  );
}
