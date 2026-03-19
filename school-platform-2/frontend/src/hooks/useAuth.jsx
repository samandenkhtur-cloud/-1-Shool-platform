import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, studentsService } from '../services/api';

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  if (!role) return null;
  const r = role.toUpperCase();
  if (r === 'ADMIN') return 'admin';
  if (r === 'TEACHER') return 'teacher';
  if (r === 'STUDENT') return 'student';
  return role.toLowerCase();
};

const buildProfile = (user, student) => {
  const nameFromEmail = user?.email?.split('@')[0] || 'User';
  const name = student?.name || user?.name || nameFromEmail;
  return {
    ...user,
    role: normalizeRole(user?.role),
    name,
    studentId: student?.id || user?.studentId || null,
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => setUser(null);
    const handleStorage = (e) => {
      if (e.key !== 'auth_user') return;
      if (!e.newValue) setUser(null);
      else setUser(JSON.parse(e.newValue));
    };
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: authUser, accessToken, refreshToken } = await authService.login(credentials);
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('auth_refresh', refreshToken);

    let student = null;
    if (authUser?.role?.toUpperCase() === 'STUDENT') {
      student = await studentsService.getStudentByEmail(authUser.email);
    }
    const profile = buildProfile(authUser, student);
    localStorage.setItem('auth_user', JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (data) => {
    const { user: authUser, accessToken, refreshToken } = await authService.register({
      email: data.email,
      password: data.password,
      role: data.role,
    });
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('auth_refresh', refreshToken);

    let student = null;
    if (authUser?.role?.toUpperCase() === 'STUDENT') {
      student = await studentsService.createStudent({
        name: data.name,
        email: data.email,
        age: data.age,
      });
    }
    const profile = buildProfile(authUser, student);
    localStorage.setItem('auth_user', JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    const stored = localStorage.getItem('auth_user');
    const current = stored ? JSON.parse(stored) : null;
    const next = { ...(current || {}), ...(updates || {}) };
    localStorage.setItem('auth_user', JSON.stringify(next));
    setUser(next);
    return next;
  }, []);

  const refreshUser = useCallback(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
