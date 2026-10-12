import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";

export default function Admin() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState({ name: "", description: "" });
  const [err, setErr] = useState("");

  const load = () => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/admin/users").then((r) => setUsers(r.data));
    api.get("/admin/recipes").then((r) => setRecipes(r.data));
    api.get("/categories").then((r) => setCats(r.data));
  };
  useEffect(load, []);
  const run = async (fn) => { try { setErr(""); await fn(); load(); } catch (e) { setErr(errMsg(e)); } };
  const max = Math.max(1, ...(stats?.byCuisine.map((c) => c.count) || [1]));

  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="tabs">{["stats", "users", "recipes", "categories"].map((t) => <button key={t} className={tab === t ? "btn small" : "btn ghost small"} onClick={() => setTab(t)}>{t === "stats" ? "Analytics" : t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      {err && <p className="error">{err}</p>}

      {tab === "stats" && stats && (
        <>
          <div className="stats"><div><b>{stats.users}</b>Users</div><div><b>{stats.recipes}</b>Recipes</div><div><b>{stats.reviews}</b>Reviews</div></div>
          <h2>Recipes by cuisine</h2>
          {stats.byCuisine.map((c) => <div key={c._id} className="bar"><span>{c._id || "Unspecified"}</span><i style={{ width: `${(c.count / max) * 100}%` }} /><b>{c.count}</b></div>)}
          <h2>Top rated</h2>
          {stats.top.map((t) => <p key={t._id}><Link to={`/recipes/${t._id}`}>{t.title}</Link> <span className="muted">{t.avgRating} from {t.ratingCount} ratings</span></p>)}
          {!stats.top.length && <p className="muted">No ratings yet.</p>}
        </>
      )}

      {tab === "users" && <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>
        {users.map((u) => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td>
          <td><select value={u.role} onChange={(e) => run(() => api.put(`/admin/users/${u._id}/role`, { role: e.target.value }))}><option>user</option><option>admin</option></select></td>
          <td><button className="link" onClick={() => confirm(`Delete ${u.name} and their recipes?`) && run(() => api.delete(`/admin/users/${u._id}`))}>Delete</button></td></tr>)}</tbody></table>}

      {tab === "recipes" && <table><thead><tr><th>Title</th><th>Author</th><th>Status</th><th></th></tr></thead><tbody>
        {recipes.map((r) => <tr key={r._id}><td><Link to={`/recipes/${r._id}`}>{r.title}</Link></td><td>{r.author?.name}</td><td>{r.isPublished ? "Published" : "Draft"}</td>
          <td><button className="link" onClick={() => run(() => api.put(`/admin/recipes/${r._id}/publish`))}>{r.isPublished ? "Unpublish" : "Publish"}</button>{" "}
            <button className="link" onClick={() => confirm("Delete recipe?") && run(() => api.delete(`/recipes/${r._id}`))}>Delete</button></td></tr>)}</tbody></table>}

      {tab === "categories" && (
        <>
          <form className="inline" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post("/admin/categories", cat); setCat({ name: "", description: "" }); }); }}>
            <input placeholder="Category name" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} required />
            <input placeholder="Description" value={cat.description} onChange={(e) => setCat({ ...cat, description: e.target.value })} />
            <button className="btn small">Add category</button>
          </form>
          {cats.map((c) => <p key={c._id}><b>{c.name}</b> <span className="muted">{c.description}</span> <button className="link" onClick={() => run(() => api.delete(`/admin/categories/${c._id}`))}>Delete</button></p>)}
        </>
      )}
    </>
  );
}
