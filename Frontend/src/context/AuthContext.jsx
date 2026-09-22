import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/authApi';
import { getAuthToken, setAuthToken, removeAuthToken } from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        if (isTokenValid(token)) {
          try {
            const userData = await authApi.getMe();
            setUser(userData);
          } catch (error) {
            console.error('Failed to restore session:', error);
            logout();
          }
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for unauthorized events from apiClient
    const handleUnauthorized = () => logout();
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    setAuthToken(response.token);
    setUser({
      id: response.userId,
      name: response.name,
      email: response.email,
    });
    return response;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    setAuthToken(response.token);
    setUser({
      id: response.userId,
      name: response.name,
      email: response.email,
    });
    return response;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
