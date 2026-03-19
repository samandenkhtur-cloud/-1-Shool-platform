import { cn } from '../../lib/utils';

const variants = {
  default:  'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  primary:  'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
  success:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  warning:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  danger:   'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  purple:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  cyan:     'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
};

export function Badge({ children, variant = 'default', className, dot }) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
