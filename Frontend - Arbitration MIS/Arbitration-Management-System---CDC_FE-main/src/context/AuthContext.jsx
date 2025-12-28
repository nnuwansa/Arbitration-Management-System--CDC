import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const storedUser = sessionStorage.getItem("user");
      const token = sessionStorage.getItem("token");

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));

          api.setToken(token);
        } catch (e) {
          sessionStorage.clear();
          api.clearToken();
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = (userData, token) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userData));

    api.setToken(token);

    setUser(userData);
  };

  const logout = () => {
    sessionStorage.clear();

    api.clearToken();

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
