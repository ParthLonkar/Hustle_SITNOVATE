import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const apiPost = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || "Request failed.";
    throw new Error(msg);
  }
  return data;
};

const apiGet = async (path, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || "Request failed.";
    throw new Error(msg);
  }
  return data;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ag_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("ag_token"));
  const [loading, setLoading] = useState(false);

  const setSession = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem("ag_user", JSON.stringify(nextUser));
      localStorage.setItem("ag_token", nextToken);
    } else {
      localStorage.removeItem("ag_user");
      localStorage.removeItem("ag_token");
    }
  };

  useEffect(() => {
    const refresh = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await apiGet("/api/farmer/me", token);
        if (data?.user) {
          setSession(data.user, token);
        }
      } catch (err) {
        setSession(null, null);
      } finally {
        setLoading(false);
      }
    };
    refresh();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiPost("/api/auth/login", { email, password });
    setSession(data.user, data.token);
    return data;
  };

  const register = async ({ name, email, password, role, region }) => {
    const data = await apiPost("/api/auth/register", { name, email, password, role, region });
    setSession(data.user, data.token);
    return data;
  };

  const logout = () => setSession(null, null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
