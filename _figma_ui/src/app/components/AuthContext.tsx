import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  justLoggedIn: boolean;
  user: { name: string; email: string; initials: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  clearJustLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  justLoggedIn: false,
  user: null,
  login: () => false,
  logout: () => {},
  clearJustLoggedIn: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('twill_auth') === 'true';
  });
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const user = isAuthenticated
    ? { name: 'Alex Kim', email: 'alex@withtwill.com', initials: 'AK' }
    : null;

  const login = (email: string, password: string) => {
    // Mock auth — accept any non-empty credentials
    if (email && password) {
      setIsAuthenticated(true);
      setJustLoggedIn(true);
      sessionStorage.setItem('twill_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setJustLoggedIn(false);
    sessionStorage.removeItem('twill_auth');
  };

  const clearJustLoggedIn = () => {
    setJustLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, justLoggedIn, user, login, logout, clearJustLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}