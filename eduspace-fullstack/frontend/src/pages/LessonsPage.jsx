import { Link } from 'react-router-dom';
import { PlayCircle, CheckCircle2, Clock, BookOpen, Download } from 'lucide-react';
import { useLessonsTable } from '../hooks/useData';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import { formatDate } from '../lib/utils';

export function LessonsPage() {
  const { data: lessons = [], isLoading, isError, refetch } = useLessonsTable();
  const done    = lessons.filter((l) => l.status === 'done').length;
  const pending = lessons.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Recorded Lessons</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>All scheduled and completed lessons</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',     value: lessons.length, icon: BookOpen,     bg: 'var(--brand-light)', fg: 'var(--brand)' },
          { label: 'Completed', value: done,            icon: CheckCircle2, bg: '#d1fae5', fg: '#059669' },
          { label: 'Upcoming',  value: pending,         icon: Clock,        bg: '#fef3c7', fg: '#d97706' },
        ].map(({ label, value, icon: Icon, bg, fg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color: fg }} />
            </div>
            <div>
              <p className="text-xl font-display font-bold" style={{ color: 'var(--text-main)' }}>{isLoading ? '—' : value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-main)' }}>All Lessons</h2>
        </div>
        {isError ? <ErrorState onRetry={refetch} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Course','Teacher','Members','Date','Material','Status',''].map((h,i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                  : lessons.map((row) => (
                    <tr key={row.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-light)' }}>
                            <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{row.course}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.teacher}`} name={row.teacher} size="xs" />
                          <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.teacher}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{row.members?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDate(row.date)}</td>
                      <td className="px-4 py-3">
                        {row.material
                          ? <button className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                              <Download className="w-3 h-3" /> Download
                            </button>
                          : <span style={{ color: 'var(--border)' }}>—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {row.status === 'done' ? <Badge variant="success" dot>Done</Badge> : <Badge variant="warning" dot>Pending</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/lessons/${row.lessonId}`}
                          className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-brand-600 dark:text-brand-400">
                          <PlayCircle className="w-3.5 h-3.5" /> Watch
                        </Link>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
