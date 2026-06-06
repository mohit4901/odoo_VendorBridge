import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and pre-populate credentials if they don't exist
  useEffect(() => {
    const existingUsers = localStorage.getItem('vb_users');
    if (!existingUsers) {
      const defaultUsers = [
        {
          name: 'Global Administrator',
          email: 'admin@vendorbridge.com',
          password: 'admin123',
          role: 'admin',
          company: 'VendorBridge Corp'
        }
      ];
      localStorage.setItem('vb_users', JSON.stringify(defaultUsers));
    }

    const sessionUser = localStorage.getItem('vb_current_user');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('vb_users') || '[]');
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (matchedUser) {
      const userSession = {
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role || 'admin',
        company: matchedUser.company || 'VendorBridge Corp'
      };
      localStorage.setItem('vb_current_user', JSON.stringify(userSession));
      setUser(userSession);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const register = (name, email, password, company, role = 'vendor') => {
    const users = JSON.parse(localStorage.getItem('vb_users') || '[]');
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      return { success: false, message: 'Email already registered.' };
    }

    const newUser = { name, email, password, company, role };
    users.push(newUser);
    localStorage.setItem('vb_users', JSON.stringify(users));
    return { success: true };
  };

  const logout = () => {
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
