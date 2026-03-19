import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>
      {/* Left: branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] p-12 relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">EduSpace</span>
          </div>
          <h1 className="font-display font-bold text-white text-4xl leading-tight mb-5">
            Learn without<br />limits. Grow<br />without bounds.
          </h1>
          <p className="text-brand-200 text-sm leading-relaxed max-w-xs">
            Join thousands of students and teachers on EduSpace — a modern platform built for real learning.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { value: '6,000+', label: 'Active Students' },
            { value: '200+',   label: 'Expert Teachers' },
            { value: '500+',   label: 'Courses Offered' },
            { value: '98%',    label: 'Satisfaction Rate' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-xs text-brand-300 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
