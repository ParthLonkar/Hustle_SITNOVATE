import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

/**
 * Wrap your app with <AuthProvider> to give any child component
 * access to the current user and auth helpers via useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in

  const login = ({ email, password, role = "Farmer", name = "Farmer" }) => {
    // Replace with a real API call in production
    setUser({ email, role, name });
  };

  const register = ({ email, password, role, name }) => {
    setUser({ email, role, name });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — use anywhere inside <AuthProvider> */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;
