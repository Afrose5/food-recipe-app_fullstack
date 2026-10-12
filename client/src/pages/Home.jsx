import { useEffect, useState } from "react";
import api from "../api";
import { RecipeCard } from "../components";

const MEALS = ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"];
const DIETS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto"];
const empty = { search: "", ingredients: "", cuisine: "", diet: "", mealType: "", maxTime: "", sort: "newest" };

export default function Home() {
  const [f, setF] = useState(empty);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries({ ...f, page }).filter(([, v]) => v !== ""));
      api.get("/recipes", { params }).then((r) => setData(r.data)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [f, page]);

  return (
    <>
      <section className="hero">
        <h1>What's in your kitchen today?</h1>
        <p>Search by name, or list the ingredients you already have.</p>
        <div className="searchrow">
          <input placeholder="Search recipes" value={f.search} onChange={set("search")} />
          <input placeholder="Ingredients, e.g. egg, tomato" value={f.ingredients} onChange={set("ingredients")} />
        </div>
      </section>
      <section className="filters">
        <input placeholder="Cuisine" value={f.cuisine} onChange={set("cuisine")} />
        <select value={f.diet} onChange={set("diet")}><option value="">Any diet</option>{DIETS.map((d) => <option key={d}>{d}</option>)}</select>
        <select value={f.mealType} onChange={set("mealType")}><option value="">Any meal</option>{MEALS.map((d) => <option key={d}>{d}</option>)}</select>
        <select value={f.maxTime} onChange={set("maxTime")}><option value="">Any time</option>{[15, 30, 60].map((m) => <option key={m} value={m}>Under {m} min</option>)}</select>
        <select value={f.sort} onChange={set("sort")}><option value="newest">Newest</option><option value="rating">Top rated</option><option value="time">Quickest</option><option value="title">A to Z</option></select>
        <button className="link" onClick={() => { setF(empty); setPage(1); }}>Clear filters</button>
      </section>
      <p className="muted">{loading ? "Searching..." : `${data.total} recipes`}</p>
      <div className="grid">{data.items.map((r) => <RecipeCard key={r._id} r={r} />)}</div>
      {!loading && !data.items.length && <p className="center">No recipes match. Try fewer filters or add your own recipe.</p>}
      {data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
