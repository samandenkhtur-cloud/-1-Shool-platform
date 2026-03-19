import { cn, getInitials } from '../../lib/utils';

const sizeMap = {
  xs:  'w-6 h-6 text-[9px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl':'w-20 h-20 text-xl',
};

export function Avatar({ src, name, size = 'md', className, online }) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const initials = getInitials(name);

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src} alt={name}
          className={cn('rounded-full object-cover', sizeClass)}
          style={{ background: 'var(--surface)' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex'); }}
        />
      ) : (
        <div className={cn('rounded-full flex items-center justify-center font-bold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300', sizeClass)}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-2',
          size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          online ? 'bg-emerald-400' : 'bg-slate-300',
        )} style={{ borderColor: 'var(--card-bg)' }} />
      )}
    </div>
  );
}
