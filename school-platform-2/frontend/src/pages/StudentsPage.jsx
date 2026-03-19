import { useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import { useStudents } from '../hooks/useData';
import { ErrorState } from '../components/ui/EmptyState';

export function StudentsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useStudents({ q: search, page: 1, pageSize: 100 });
  const students = data?.items || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Users className="w-6 h-6 text-brand-600" /> Students
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Student directory</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input-field pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Student', 'Email', 'Age', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className="transition-colors group" style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-main)' }}>{s.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{s.age}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!isLoading && students.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
