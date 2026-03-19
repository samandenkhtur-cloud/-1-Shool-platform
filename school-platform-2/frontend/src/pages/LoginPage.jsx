import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min. 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text-main)' }}>EduSpace</span>
        </div>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-main)' }}>Welcome back</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue learning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Email address</label>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@school.edu" autoComplete="email"
            className={cn('input-field', errors.email && 'border-rose-400 focus:ring-rose-400')} />
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Password</label>
            <button type="button" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">Forgot?</button>
          </div>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="********" autoComplete="current-password"
              className={cn('input-field pr-11', errors.password && 'border-rose-400 focus:ring-rose-400')} />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
        No account?{' '}
        <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700">Create one</Link>
      </p>
    </div>
  );
}
