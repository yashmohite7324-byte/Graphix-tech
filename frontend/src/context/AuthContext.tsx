import React, { createContext, useContext, useState } from 'react';

interface AuthUser {
  email: string;
  role: string;
  name?: string;
  designation?: string;
  companyName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string, role: string, email: string, name?: string, designation?: string, companyName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name') || undefined;
    const designation = localStorage.getItem('designation') || undefined;
    const companyName = localStorage.getItem('companyName') || undefined;
    return email && role ? { email, role, name, designation, companyName } : null;
  });

  const login = (accessToken: string, refreshToken: string, role: string, email: string, name?: string, designation?: string, companyName?: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
    if (name) localStorage.setItem('name', name);
    if (designation) localStorage.setItem('designation', designation);
    if (companyName) localStorage.setItem('companyName', companyName);
    
    setUser({ email, role, name, designation, companyName });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
