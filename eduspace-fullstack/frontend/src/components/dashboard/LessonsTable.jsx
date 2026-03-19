import { Link } from 'react-router-dom';
import { Download, BookOpen, ArrowRight, Users } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { TableRowSkeleton } from '../ui/Skeleton';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export function LessonsTable({ lessons = [], loading, error }) {
  const { t } = useLocale();

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-col)' }}>
        <div>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-main)' }}>{t.upcomingLessons}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.scheduledRecent}</p>
        </div>
        <Link to="/lessons" className="btn-ghost text-xs flex items-center gap-1">
          {t.viewAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-col)' }}>
              {[t.course, t.teacher, t.members, t.date, t.material, t.status].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
            ) : error ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: '#f43f5e' }}>Failed to load lessons</td></tr>
            ) : lessons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No lessons scheduled</td></tr>
            ) : (
              lessons.map((row) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: '1px solid var(--border-col)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3">
                    <Link to={`/courses/${row.courseId}`} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-light)' }}>
                        <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap hover:text-brand-600 transition-colors" style={{ color: 'var(--text-main)' }}>
                        {row.course}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.teacher}`} name={row.teacher} size="xs" />
                      <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.teacher}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Users className="w-3.5 h-3.5 opacity-60" />
                      {row.members?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(row.date)}
                  </td>
                  <td className="px-4 py-3">
                    {row.material ? (
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                        <Download className="w-3 h-3" /> {t.download}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--border-col)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === 'done'
                      ? <Badge variant="success" dot>{t.done}</Badge>
                      : <Badge variant="warning" dot>{t.pending}</Badge>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
