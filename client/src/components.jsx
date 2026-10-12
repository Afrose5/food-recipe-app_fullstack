import { Link, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="nav">
      <Link to="/" className="brand">Pantry Pages</Link>
      <nav>
        <NavLink to="/">Recipes</NavLink>
        {user && <NavLink to="/add">Add recipe</NavLink>}
        {user && <NavLink to="/library">My kitchen</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        {user ? <button className="link" onClick={logout}>Log out</button> : <>
          <NavLink to="/login">Log in</NavLink><Link className="btn small" to="/register">Sign up</Link></>}
      </nav>
    </header>
  );
}

export const Stars = ({ value = 0, onChange }) => (
  <span className="stars" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= Math.round(value) ? "on" : ""} onClick={() => onChange?.(n)} style={{ cursor: onChange ? "pointer" : "default" }}>★</span>
    ))}
  </span>
);

export function RecipeCard({ r }) {
  return (
    <Link to={`/recipes/${r._id}`} className="card">
      <div className="thumb">{r.image ? <img src={r.image} alt={r.title} /> : <span>{r.title[0]}</span>}</div>
      <div className="card-body">
        <h3>{r.title}</h3>
        <p className="muted">{[r.cuisine, r.cookingTime && `${r.cookingTime} min`, r.difficulty].filter(Boolean).join(", ")}</p>
        <Stars value={r.avgRating} /> <small className="muted">({r.ratingCount})</small>
        {!r.isPublished && <span className="tag draft">Draft</span>}
      </div>
    </Link>
  );
}

export function Protected({ children, admin }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
