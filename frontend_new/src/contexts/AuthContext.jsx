import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      authService.verifyToken()
        .then(userData => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.data.token);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (fullName, email, password, username, role = 'user') => {
    setAuthLoading(true);
    try {
      const response = await authService.register(fullName, email, password, username, role);
      setUser(response.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.data.token);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    loading: loading || authLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
