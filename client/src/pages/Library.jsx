import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { RecipeCard } from "../components";

export default function Library() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user.name, bio: user.bio || "" });
  const [avatar, setAvatar] = useState(null);
  const [mine, setMine] = useState([]);
  const [cols, setCols] = useState([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/recipes", { params: { mine: 1, limit: 50 } }).then((r) => setMine(r.data.items));
    api.get("/collections").then((r) => setCols(r.data));
  };
  useEffect(load, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", profile.name); fd.append("bio", profile.bio);
    if (avatar) fd.append("avatar", avatar);
    try { const { data } = await api.put("/auth/me", fd); setUser({ ...user, ...data }); setMsg("Profile saved"); } catch (x) { setMsg(errMsg(x)); }
  };

  return (
    <>
      <form className="panel" onSubmit={saveProfile}>
        <h1>Profile</h1>
        <p className="muted">{user.email}</p>
        <label>Name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></label>
        <label>Bio<textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label>
        <label>Avatar<input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} /></label>
        <button className="btn small">Save profile</button> {msg && <span className="muted">{msg}</span>}
      </form>

      <h2>My recipes</h2>
      <div className="grid">{mine.map((r) => <RecipeCard key={r._id} r={r} />)}</div>
      {!mine.length && <p className="muted">You haven't added any recipes yet.</p>}

      <h2>Favorites and collections</h2>
      <form className="inline" onSubmit={async (e) => { e.preventDefault(); if (name.trim()) { await api.post("/collections", { name }); setName(""); load(); } }}>
        <input placeholder="New collection name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn small">Create collection</button>
      </form>
      {cols.map((c) => (
        <section key={c._id} className="collection">
          <h3>{c.name} <small className="muted">({c.recipes.length})</small>
            {!c.isDefault && <button className="link" onClick={async () => { await api.delete(`/collections/${c._id}`); load(); }}>Delete</button>}</h3>
          <div className="grid">
            {c.recipes.map((r) => (
              <div key={r._id}><RecipeCard r={r} />
                <button className="link" onClick={async () => { await api.put(`/collections/${c._id}/recipes`, { recipeId: r._id, action: "remove" }); load(); }}>Remove from {c.name}</button></div>
            ))}
          </div>
          {!c.recipes.length && <p className="muted">Empty. Open a recipe and save it to favorites.</p>}
          {!c.isDefault && mine.length + 0 > -1 && <AddToCollection c={c} onDone={load} />}
        </section>
      ))}
    </>
  );
}

function AddToCollection({ c, onDone }) {
  const [all, setAll] = useState([]);
  const [pick, setPick] = useState("");
  useEffect(() => { api.get("/recipes", { params: { limit: 50 } }).then((r) => setAll(r.data.items)); }, []);
  return (
    <div className="inline">
      <select value={pick} onChange={(e) => setPick(e.target.value)}><option value="">Add a recipe...</option>{all.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}</select>
      <button className="btn ghost small" disabled={!pick} onClick={async () => { await api.put(`/collections/${c._id}/recipes`, { recipeId: pick, action: "add" }); setPick(""); onDone(); }}>Add</button>
    </div>
  );
}
