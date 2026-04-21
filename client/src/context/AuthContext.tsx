import { createContext, useContext, useState, type ReactNode } from 'react';
import api from '../api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  grade?: string;
  subject?: string;
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  grade?: string;
  subject?: string;
}

const AuthContext = createContext<AuthCtx | null>(null);

function loadUser(): User | null {
  try {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (form: RegisterData) => {
    const { data } = await api.post('/users/register', form);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    const { data } = await api.put('/users/me', updates);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
