import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Library,
  Settings, LogOut, Users, BarChart3,
  ChevronLeft, ChevronRight, PlusCircle, ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { Avatar } from '../ui/Avatar';
import toast from 'react-hot-toast';
import logo from '../../assets/eduzenith-logo.svg';

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const navGroups = [
    {
      label: 'Main',
      items: [
        { label: t.dashboard,    icon: LayoutDashboard, to: '/dashboard',    roles: ['student','teacher','admin'] },
        { label: t.courses,      icon: BookOpen,        to: '/courses',       roles: ['student','teacher','admin'] },
        { label: t.library,      icon: Library,         to: '/library',       roles: ['student','teacher','admin'] },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: t.students,   icon: Users,      to: '/students',   roles: ['teacher','admin'] },
        { label: t.analytics,  icon: BarChart3,  to: '/analytics',  roles: ['teacher','admin'] },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: t.adminPanel,    icon: ShieldCheck, to: '/admin',       roles: ['admin'] },
        { label: t.createCourse,  icon: PlusCircle,  to: '/courses/new', roles: ['teacher','admin'] },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 shadow-sidebar',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )}
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div
        className={cn('flex items-center gap-3 px-4 py-5 flex-shrink-0', collapsed && 'justify-center px-3')}
        style={{ borderBottom: '1px solid var(--border-col)' }}
      >
        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand">
          <img src={logo} alt="EduZenith logo" className="w-5 h-5 object-contain" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <p className="font-display font-bold text-base leading-none" style={{ color: 'var(--text-main)' }}>EduZenith</p>
            <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto scroll-area space-y-5">
        {navGroups.map((group) => {
          const visible = group.items.filter((item) => !user?.role || item.roles.includes(user.role));
          if (!visible.length) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn('sidebar-link group', isActive && 'active', collapsed && 'justify-center px-2')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className="flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{ width: 16, height: 16, color: isActive ? 'var(--brand)' : 'var(--sidebar-text)' }}
                        />
                        {!collapsed && <span className="animate-fade-in truncate">{item.label}</span>}
                        {!collapsed && item.dot && (
                          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse-soft flex-shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 pt-3 flex-shrink-0 space-y-0.5" style={{ borderTop: '1px solid var(--border-col)' }}>
        <NavLink
          to="/settings"
          className={({ isActive }) => cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-2')}
        >
          {({ isActive }) => (
            <>
              <Settings style={{ width: 16, height: 16, color: isActive ? 'var(--brand)' : 'var(--sidebar-text)', flexShrink: 0 }} />
              {!collapsed && <span>{t.settings}</span>}
            </>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className={cn('sidebar-link w-full hover:!bg-red-50 dark:hover:!bg-red-900/20 hover:!text-red-500', collapsed && 'justify-center px-2')}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
          {!collapsed && <span>{t.logout}</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl" style={{ background: 'var(--surface)' }}>
            <Avatar src={user.avatar} name={user.name} size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>{user.name}</p>
              <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center shadow-brand hover:bg-brand-700 transition-colors z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-white" /> : <ChevronLeft className="w-3 h-3 text-white" />}
      </button>
    </aside>
  );
}
