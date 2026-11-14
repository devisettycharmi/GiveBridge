import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('givebridge-token') || '');
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      localStorage.removeItem('givebridge-token');
      setToken('');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('givebridge-token');
        delete api.defaults.headers.common.Authorization;
        setToken('');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('givebridge-token', newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('givebridge-token', newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('givebridge-token');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    setToken('');
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
