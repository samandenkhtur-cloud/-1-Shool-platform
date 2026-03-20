import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import logo from '../assets/eduzenith-logo.svg';

const DEMOS = [
  { role: 'student', email: 'alex@student.edu',  label: 'Student' },
  { role: 'teacher', email: 'helen@teacher.edu', label: 'Teacher' },
  { role: 'admin',   email: 'amka@admin.edu',   label: 'Admin' },
];

export function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const googleInitRef = useRef(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId || googleInitRef.current) return;
    googleInitRef.current = true;

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (resp) => {
          try {
            await googleLogin(resp.credential);
            toast.success('Signed in with Google');
            navigate('/dashboard');
          } catch (err) {
            toast.error(err.message || 'Google login failed');
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = initGoogle;
    document.body.appendChild(s);
  }, [googleClientId, googleLogin, navigate]);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <img src={logo} alt="EduZenith logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text-main)' }}>EduZenith</span>
        </div>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-main)' }}>Welcome back</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue learning</p>
      </div>

      {/* Demo accounts */}
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Quick demo access:</p>
        <div className="flex gap-2">
          {DEMOS.map((acc) => (
            <button key={acc.role} type="button"
              onClick={() => { setForm({ email: acc.email, password: 'password' }); setErrors({}); }}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}
            >
              {acc.label}
            </button>
          ))}
        </div>
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
              placeholder="••••••••" autoComplete="current-password"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {googleClientId ? (
        <div className="flex justify-center">
          <div ref={googleBtnRef} />
        </div>
      ) : (
        <button type="button" disabled className="btn-secondary w-full py-3 text-sm opacity-60 cursor-not-allowed">
          Google Sign‑in (set VITE_GOOGLE_CLIENT_ID)
        </button>
      )}

      <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
        No account?{' '}
        <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700">Create one</Link>
      </p>
      <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        Demo password: <code className="font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--surface)' }}>password</code>
      </p>
    </div>
  );
}
