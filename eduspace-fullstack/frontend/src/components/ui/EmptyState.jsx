import { BookOpen, Search, AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface)' }}>
        <Icon className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-main)' }}>{title}</h3>
      {description && <p className="text-sm max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action}
    </div>
  );
}

export function EmptyCourses({ onExplore }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No courses found"
      description="You haven't enrolled in any courses yet. Explore the catalog to get started."
      action={onExplore && (
        <button onClick={onExplore} className="btn-primary text-sm">Browse Courses</button>
      )}
    />
  );
}

export function EmptySearch({ query }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `No courses match "${query}". Try a different search term.` : 'Try searching for a course, teacher, or topic.'}
    />
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#fff1f2' }}>
        <AlertCircle className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-main)' }}>Something went wrong</h3>
      <p className="text-sm max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        {message || 'Failed to load data. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      )}
    </div>
  );
}
