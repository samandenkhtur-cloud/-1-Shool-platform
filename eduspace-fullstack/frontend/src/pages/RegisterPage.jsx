import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import logo from '../assets/eduzenith-logo.svg';

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Enroll in courses and track progress' },
  { value: 'teacher', label: 'Teacher', desc: 'Create and manage your courses' },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min. 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Welcome to EduZenith 🎓');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthColors = ['','bg-rose-400','bg-amber-400','bg-brand-400','bg-emerald-400'];
  const strengthLabels = ['','Weak','Fair','Good','Strong'];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <img src={logo} alt="EduZenith logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text-main)' }}>EduZenith</span>
        </div>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-main)' }}>Create your account</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Join thousands of learners on EduZenith</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map((r) => (
          <button key={r.value} type="button" onClick={() => setForm((f) => ({ ...f, role: r.value }))}
            className={cn('p-3.5 rounded-xl border-2 text-left transition-all')}
            style={{
              borderColor: form.role === r.value ? 'var(--brand)' : 'var(--border)',
              background: form.role === r.value ? 'var(--brand-light)' : 'var(--card-bg)',
            }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold" style={{ color: form.role === r.value ? 'var(--brand)' : 'var(--text-main)' }}>{r.label}</span>
              {form.role === r.value && (
                <span className="w-4 h-4 bg-brand-600 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Full name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Smith" className={cn('input-field', errors.name && 'border-rose-400')} />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Email address</label>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jane@school.edu" className={cn('input-field', errors.email && 'border-rose-400')} />
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Min. 8 characters" className={cn('input-field pr-11', errors.password && 'border-rose-400')} />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= strength ? strengthColors[strength] : 'bg-surface-200 dark:bg-slate-700')} />
                ))}
              </div>
              <p className={cn('text-xs font-medium', strength <= 1 ? 'text-rose-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-brand-500' : 'text-emerald-500')}>
                {strengthLabels[strength]}
              </p>
            </div>
          )}
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Confirm password</label>
          <input type={showPw ? 'text' : 'password'} value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="Repeat your password" className={cn('input-field', errors.confirmPassword && 'border-rose-400')} />
          {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700">Sign in</Link>
      </p>
    </div>
  );
}
