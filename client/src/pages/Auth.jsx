import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errMsg } from "../api";

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const isReg = mode === "register";
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { await (isReg ? register(f) : login(f)); nav("/"); } catch (x) { setErr(errMsg(x)); }
  };
  return (
    <form className="panel narrow" onSubmit={submit}>
      <h1>{isReg ? "Create your account" : "Welcome back"}</h1>
      {err && <p className="error">{err}</p>}
      {isReg && <label>Name<input value={f.name} onChange={set("name")} required /></label>}
      <label>Email<input type="email" value={f.email} onChange={set("email")} required /></label>
      <label>Password<input type="password" minLength={6} value={f.password} onChange={set("password")} required /></label>
      <button className="btn">{isReg ? "Sign up" : "Log in"}</button>
      <p className="muted">{isReg ? <>Have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
    </form>
  );
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
