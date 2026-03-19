import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, X, Sun, Moon, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, getNotificationIcon } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useLocale, LOCALES, LANG_ORDER } from '../../hooks/useLocale';
import { useNotifications } from '../../hooks/useData';
import { Avatar } from '../ui/Avatar';

export function Header({ sidebarCollapsed }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const { lang, setLang, t } = useLocale();

  const [search, setSearch] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const notifRef = useRef(null);
  const langRef = useRef(null);
  const navigate = useNavigate();

  const { data: notificationsData } = useNotifications();
  const notifications = notificationsData?.items || [];

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (langRef.current && !langRef.current.contains(e.target)) setShowLang(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/courses?search=${encodeURIComponent(search)}`); setSearch(''); }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-[64px] flex items-center px-5 gap-4 transition-all duration-300',
        sidebarCollapsed ? 'left-[68px]' : 'left-[240px]',
      )}
      style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border-col)' }}
    >
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="input-field pl-10 pr-10"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language switcher */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setShowLang((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-col)' }}
            title="Change language"
          >
            <Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--brand)' }}>
              {LOCALES[lang]?.flag} {LOCALES[lang]?.label}
            </span>
            <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
          </button>

          {showLang && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-dropdown py-2 animate-slide-up z-50"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-col)' }}
            >
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Language
              </p>
              {LANG_ORDER.map((l) => {
                const loc = LOCALES[l];
                return (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLang(false); }}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors"
                    style={{
                      background: lang === l ? 'var(--brand-light)' : 'transparent',
                      color: lang === l ? 'var(--brand)' : 'var(--text-main)',
                    }}
                    onMouseEnter={e => lang !== l && (e.currentTarget.style.background = 'var(--surface)')}
                    onMouseLeave={e => lang !== l && (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="text-base leading-none">{loc.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-none mb-0.5">{loc.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{loc.label}</p>
                    </div>
                    {lang === l && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--brand)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-col)' }}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-brand-600" />
          }
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-col)' }}
          >
            <Bell style={{ width: 16, height: 16, color: 'var(--text-main)' }} />
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-dropdown animate-slide-up z-50 overflow-hidden"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-col)' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-col)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{t.notifications}</h3>
              </div>
              <div className="max-h-80 overflow-y-auto scroll-area">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-xs" style={{ color: 'var(--text-muted)' }}>No notifications yet</div>
                ) : notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border-col)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{n.message || n.type}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Avatar src={user?.avatar} name={user?.name} size="sm" online />
      </div>
    </header>
  );
}
