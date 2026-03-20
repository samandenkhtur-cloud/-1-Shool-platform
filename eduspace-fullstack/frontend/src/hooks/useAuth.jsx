import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, coursesService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const enrichUser = useCallback(async (u) => {
    if (!u) return u;
    if (u.role === 'student') {
      try {
        const enrolled = await coursesService.getEnrolledCourses();
        return { ...u, enrolledCourses: enrolled.map((c) => c.id) };
      } catch {
        return u;
      }
    }
    return u;
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { setLoading(false); return; }

      try {
        const profile = await authService.getProfile();
        const enriched = await enrichUser(profile);
        if (enriched) {
          localStorage.setItem('auth_user', JSON.stringify(enriched));
          setUser(enriched);
        }
      } catch {
        const stored = localStorage.getItem('auth_user');
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [enrichUser]);

  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials);
    const enriched = await enrichUser(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(enriched));
    setUser(enriched);
    return enriched;
  }, [enrichUser]);

  const googleLogin = useCallback(async (credential) => {
    const { user, token } = await authService.googleLogin(credential);
    const enriched = await enrichUser(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(enriched));
    setUser(enriched);
    return enriched;
  }, [enrichUser]);

  const register = useCallback(async (data) => {
    const { user, token } = await authService.register(data);
    const enriched = await enrichUser(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(enriched));
    setUser(enriched);
    return enriched;
  }, [enrichUser]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Demo role switching is disabled when using real data
  const switchRole = useCallback(() => {
    toast.error('Role switching is disabled in real data mode');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      const enriched = await enrichUser(profile);
      if (enriched) {
        localStorage.setItem('auth_user', JSON.stringify(enriched));
        setUser(enriched);
        return;
      }
    } catch {
      const stored = localStorage.getItem('auth_user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [enrichUser]);

  const updateProfile = useCallback(async (profileData) => {
    const resp = await authService.updateProfile(profileData);
    const updatedUser = resp?.user || resp?.data?.user || resp?.data || resp;
    if (updatedUser) {
      const enriched = await enrichUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(enriched));
      setUser(enriched);
      return enriched;
    }
    throw new Error('Failed to update profile');
  }, [enrichUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, switchRole, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
