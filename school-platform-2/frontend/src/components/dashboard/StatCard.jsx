import { cn } from '../../lib/utils';

export function StatCard({ icon: Icon, label, value, delta, color = 'blue', loading }) {
  const colorMap = {
    blue:    { bg: 'bg-brand-50 dark:bg-brand-950/50',   icon: 'text-brand-600 dark:text-brand-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', icon: 'text-emerald-600 dark:text-emerald-400' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-950/50', icon: 'text-violet-600 dark:text-violet-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-950/50',   icon: 'text-amber-600 dark:text-amber-400' },
    rose:    { bg: 'bg-rose-50 dark:bg-rose-950/50',     icon: 'text-rose-600 dark:text-rose-400' },
    cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-950/50',     icon: 'text-cyan-600 dark:text-cyan-400' },
  };
  const c = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-9 w-9 rounded-xl" />
        </div>
        <div className="skeleton h-7 w-16 rounded" />
        <div className="skeleton h-2.5 w-full rounded-full mt-3" />
      </div>
    );
  }

  return (
    <div className="card card-hover p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', c.bg)}>
          <Icon className={cn('w-4 h-4', c.icon)} />
        </div>
      </div>
      <p className="text-2xl font-display font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
      {delta !== undefined && (
        <p className={cn('text-xs font-medium mt-1', delta >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% from last month
        </p>
      )}
    </div>
  );
}
