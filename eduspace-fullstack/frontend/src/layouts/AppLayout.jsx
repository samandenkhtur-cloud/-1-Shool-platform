import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { RightPanel } from '../components/common/RightPanel';
import { cn } from '../lib/utils';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <Header sidebarCollapsed={collapsed} />

      <main
        className={cn('transition-all duration-300 pt-[64px] min-h-screen')}
        style={{ paddingLeft: collapsed ? '68px' : '240px' }}
      >
        <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
          <RightPanel />
        </div>
      </main>
    </div>
  );
}
