import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) return setReady(true);
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => localStorage.removeItem("token")).finally(() => setReady(true));
  }, []);

  const authenticate = async (path, body) => {
    const { data } = await api.post(`/auth/${path}`, body);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };
  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return <Ctx.Provider value={{ user, setUser, ready, login: (b) => authenticate("login", b), register: (b) => authenticate("register", b), logout }}>{children}</Ctx.Provider>;
}
