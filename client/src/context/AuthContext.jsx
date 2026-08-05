import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getMe } from '../services/authService.js';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;

  return {
    id: userData.id || userData._id || null,
    name: userData.name || userData.fullName || '',
    email: userData.email || '',
    ...userData,
  };
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(normalizeUser(userData));
      } catch (error) {
        Cookies.remove('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    Cookies.set('token', token, { expires: 7, sameSite: 'lax' });
    setUser(normalizeUser(userData));
  };

  const logoutUser = () => {
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };