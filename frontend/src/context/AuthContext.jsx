import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import api from "../lib/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.data.user);
  }, []);

  const signup = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/auth/register", { email, password });
    setUser(data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      
    } finally {
      setUser(null);
    }
  }, []);

  
  const contextValue = useMemo(() => ({
    user,         
    isLoading,    
    login,        
    signup,      
    logout,       
    isAuthed: !!user,   
  }), [user, isLoading, login, signup, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth() must be used inside an <AuthProvider>. " +
      "Wrap your app root with <AuthProvider> in main.jsx."
    );
  }

  return context;
}
