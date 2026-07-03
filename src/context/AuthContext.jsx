import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "./useAuth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => localStorage.getItem("user") || null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    const res = await api.post("auth/login/", { email, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    localStorage.setItem("user", email);
    setUser(email);
    navigate("/dashboard");
  };

  const register = async (
    first_name,
    last_name,
    email,
    password,
    confirm_password,
  ) => {
    await api.post("auth/register/", {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
    });
    navigate("auth/dashboard");
  };

  const getProfile = async () => {
    const res = await api.get("auth/profile/");
    return res.data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await api.post("logout/", { refresh });
      }
    } catch {
      //token already expired or invalid - still log out
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
