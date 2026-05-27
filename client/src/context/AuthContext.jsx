import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      setLoading(false);
      return;
    }
  
    api
      .get("/auth/me")
      .then((res) => {
        const userFromMe =
          res.data.user || res.data.data?.user || res.data.data || null;
  
        setUser(userFromMe);
      })
      .catch((err) => {
        console.log("ME ERROR:", err.response?.data || err.message);
        localStorage.removeItem("accessToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
  
    const token = res.data.accessToken || res.data.token;
    if (!token) {
      throw new Error("No token returned from login");
    }
  
    localStorage.setItem("accessToken", token);
  
    const userFromLogin =
      res.data.user || res.data.data?.user || res.data.data || null;
  
    if (userFromLogin) {
      setUser(userFromLogin);
    } else {
      const meRes = await api.get("/auth/me");
      const userFromMe =
        meRes.data.user || meRes.data.data?.user || meRes.data.data || null;
  
      setUser(userFromMe);
    }
  
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
  
    const token = res.data.accessToken || res.data.token;
    if (!token) {
      throw new Error("No token returned from register");
    }
  
    localStorage.setItem("accessToken", token);
  
    const userFromRegister =
      res.data.user || res.data.data?.user || res.data.data || null;
  
    if (userFromRegister) {
      setUser(userFromRegister);
    } else {
      const meRes = await api.get("/auth/me");
      const userFromMe =
        meRes.data.user || meRes.data.data?.user || meRes.data.data || null;
  
      setUser(userFromMe);
    }
  
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);