import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export function MiniCalendar() {
  const { t } = useLocale();
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const highlighted = [8, 14, 18, 22, 26];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = t.calFmt(month, year, t.calMonths);

  return (
    <div className="select-none">
      {/* Header: month label + centered nav */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-sm font-semibold leading-tight flex-1" style={{ color: 'var(--text-main)' }}>
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCur(new Date(year, month - 1, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-105"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-col)' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={() => setCur(new Date(year, month + 1, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-105"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-col)' }}
          >
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {t.calDays.map((d, i) => (
          <div
            key={i}
            className="text-center py-1 font-bold"
            style={{ fontSize: t.calDays[0].length > 1 ? 8 : 10, color: 'var(--text-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday  = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasEvent = highlighted.includes(d);
          return (
            <button
              key={i}
              className="aspect-square flex items-center justify-center rounded-lg text-xs transition-all"
              style={{
                background: isToday ? 'var(--brand)' : hasEvent ? 'var(--brand-light)' : 'transparent',
                color:      isToday ? '#fff'         : hasEvent ? 'var(--brand)'       : 'var(--text-muted)',
                fontWeight: isToday || hasEvent ? 700 : 500,
                boxShadow:  isToday ? '0 2px 8px rgba(0,93,206,0.35)' : 'none',
              }}
              onMouseEnter={e => !isToday && !hasEvent && (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={e => !isToday && !hasEvent && (e.currentTarget.style.background = 'transparent')}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
