import { createContext, useContext, useEffect, useState, type ReactNode, type FC } from 'react';
import { authApi, type UserProfile } from '../../../shared/services/auth.api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dni: string, password: string, remember?: boolean) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar usuario inicial si existe token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch {
          // Token inválido o expirado
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (dni: string, password: string, remember = false): Promise<UserProfile> => {
    const data = await authApi.login(dni, password);
    setToken(data.token);
    setUser(data.user);

    if (remember) {
      localStorage.setItem('auth_token', data.token);
    } else {
      sessionStorage.setItem('auth_token', data.token);
    }

    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar error si el token ya expiró
    } finally {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Error al actualizar perfil', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
