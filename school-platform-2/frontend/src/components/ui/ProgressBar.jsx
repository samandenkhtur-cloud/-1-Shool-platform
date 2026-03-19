import { cn } from '../../lib/utils';

const colorMap = {
  blue:    'bg-brand-500',
  emerald: 'bg-emerald-500',
  violet:  'bg-violet-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  cyan:    'bg-cyan-500',
};

export function ProgressBar({ value = 0, color = 'blue', className, showLabel, size = 'sm' }) {
  const heightMap = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const fillColor = colorMap[color] || colorMap.blue;
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{clamped}%</span>
        </div>
      )}
      <div className={cn('progress-bar w-full', heightMap[size])}>
        <div className={cn('progress-fill', fillColor)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
