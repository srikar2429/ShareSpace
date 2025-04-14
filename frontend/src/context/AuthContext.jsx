import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useLoading } from "./LoadingContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/users/profile");
        setUser({
          _id: data._id,
          name: data.name,
          username: data.username,
          email: data.email,
          isAdmin: data.isAdmin,
        });
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/users/login", {
        email,
        password,
      });
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  const register = async ( name, username, email, password ) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/users/register", {
        name,
        username,
        email,
        password,
      });
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post("/api/users/logout");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  let isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
