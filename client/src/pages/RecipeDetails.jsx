import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Stars } from "../components";

export default function RecipeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [r, setR] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [saved, setSaved] = useState(false);
  const [rv, setRv] = useState({ rating: 0, review: "" });
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get(`/recipes/${id}`).then((x) => setR(x.data)).catch(() => setR(false));
    api.get(`/recipes/${id}/reviews`).then((x) => setReviews(x.data));
    api.get(`/recipes/${id}/comments`).then((x) => setComments(x.data));
  };
  useEffect(() => {
    load();
    if (user) api.get("/collections/favorites/ids").then((x) => setSaved(x.data.includes(id)));
  }, [id, user]);

  if (r === null) return <p className="center">Loading...</p>;
  if (r === false) return <p className="center">Recipe not found.</p>;
  const canEdit = user && (user.role === "admin" || user._id === r.author?._id);

  const act = async (fn) => { try { setMsg(""); await fn(); load(); } catch (e) { setMsg(errMsg(e)); } };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: r.title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); setMsg("Link copied"); }
    api.post(`/recipes/${id}/share`);
  };

  return (
    <article className="detail">
      <div className="detail-head">
        <div className="thumb big">{r.image ? <img src={r.image} alt={r.title} /> : <span>{r.title[0]}</span>}</div>
        <div>
          <h1>{r.title}</h1>
          <p>{r.description}</p>
          <p className="muted">By {r.author?.name} {r.category && `in ${r.category.name}`}</p>
          <Stars value={r.avgRating} /> <small className="muted">{r.avgRating} ({r.ratingCount} ratings)</small>
          <ul className="facts">
            <li><b>{r.cookingTime || "?"}</b> min</li><li><b>{r.difficulty}</b></li>
            {r.cuisine && <li><b>{r.cuisine}</b></li>}{r.mealType && <li><b>{r.mealType}</b></li>}
          </ul>
          <div>{r.dietary?.map((d) => <span key={d} className="tag">{d}</span>)}</div>
          <div className="actions">
            {user && <button className="btn" onClick={() => act(async () => { const x = await api.post(`/collections/favorites/${id}`); setSaved(x.data.saved); })}>{saved ? "Remove from favorites" : "Save to favorites"}</button>}
            <button className="btn ghost" onClick={share}>Share</button>
            {canEdit && <Link className="btn ghost" to={`/edit/${id}`}>Edit</Link>}
            {canEdit && <button className="btn danger" onClick={async () => { if (confirm("Delete this recipe?")) { await api.delete(`/recipes/${id}`); nav("/"); } }}>Delete</button>}
          </div>
          {msg && <p className="muted">{msg}</p>}
        </div>
      </div>
      <div className="two">
        <section><h2>Ingredients</h2><ul className="ing">{r.ingredients.map((i, k) => <li key={k}><b>{i.quantity}</b> {i.name}</li>)}</ul></section>
        <section><h2>Instructions</h2><ol className="steps">{r.instructions.map((s, k) => <li key={k}>{s}</li>)}</ol></section>
      </div>

      <section>
        <h2>Ratings and reviews</h2>
        {user ? (
          <div className="panel">
            <Stars value={rv.rating} onChange={(n) => setRv({ ...rv, rating: n })} />
            <textarea placeholder="Share how it turned out (optional)" value={rv.review} onChange={(e) => setRv({ ...rv, review: e.target.value })} />
            <button className="btn small" disabled={!rv.rating} onClick={() => act(async () => { await api.post(`/recipes/${id}/reviews`, rv); setRv({ rating: 0, review: "" }); })}>Post review</button>
          </div>
        ) : <p className="muted"><Link to="/login">Log in</Link> to rate this recipe.</p>}
        {reviews.map((x) => (
          <div key={x._id} className="note"><b>{x.user?.name}</b> <Stars value={x.rating} /><p>{x.review}</p>
            {(user?.role === "admin" || user?._id === x.user?._id) && <button className="link" onClick={() => act(() => api.delete(`/recipes/${id}/reviews/${x._id}`))}>Delete</button>}</div>
        ))}
      </section>

      <section>
        <h2>Comments</h2>
        {user && (
          <form className="inline" onSubmit={(e) => { e.preventDefault(); act(async () => { await api.post(`/recipes/${id}/comments`, { text }); setText(""); }); }}>
            <input placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn small">Comment</button>
          </form>
        )}
        {comments.map((c) => (
          <div key={c._id} className="note"><b>{c.user?.name}</b><p>{c.text}</p>
            {(user?.role === "admin" || user?._id === c.user?._id) && <button className="link" onClick={() => act(() => api.delete(`/recipes/${id}/comments/${c._id}`))}>Delete</button>}</div>
        ))}
        {!comments.length && <p className="muted">No comments yet.</p>}
      </section>
    </article>
  );
}
