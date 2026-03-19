import { cn } from '../../lib/utils';

export function Skeleton({ className, style }) {
  return <div className={cn('skeleton rounded-lg', className)} style={style} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-3.5 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function LessonItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl">
      <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
