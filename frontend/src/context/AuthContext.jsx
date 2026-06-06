import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vb_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('vb_current_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { user: userSession, token } = res.data;
        localStorage.setItem('vb_token', token);
        localStorage.setItem('vb_current_user', JSON.stringify(userSession));
        setUser(userSession);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid email or password.' };
    }
  };

  const register = async (name, email, password, company, phone) => {
    try {
      const res = await authService.register(name, email, password, company, phone);
      if (res.success && res.data) {
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: err.message || 'Email already registered.' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout request failed on backend:', err);
    }
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
