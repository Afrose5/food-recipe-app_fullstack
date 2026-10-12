import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api";

const MEALS = ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"];
const DIETS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto"];
const blank = { title: "", description: "", cuisine: "", mealType: "dinner", dietary: [], cookingTime: 30, difficulty: "easy", category: "", isPublished: true,
  ingredients: [{ name: "", quantity: "" }], instructions: [""] };

export default function RecipeForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(blank);
  const [file, setFile] = useState(null);
  const [cats, setCats] = useState([]);
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
    if (id) api.get(`/recipes/${id}`).then((r) => setF({ ...blank, ...r.data, category: r.data.category?._id || "" }));
  }, [id]);

  const list = (key, i, patch) => set(key, f[key].map((x, k) => (k === i ? patch : x)));
  const toggleDiet = (d) => set("dietary", f.dietary.includes(d) ? f.dietary.filter((x) => x !== d) : [...f.dietary, d]);

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    const fd = new FormData();
    ["title", "description", "cuisine", "mealType", "cookingTime", "difficulty", "category", "isPublished"].forEach((k) => fd.append(k, f[k] ?? ""));
    fd.append("ingredients", JSON.stringify(f.ingredients.filter((i) => i.name.trim())));
    fd.append("instructions", JSON.stringify(f.instructions.filter((s) => s.trim())));
    fd.append("dietary", JSON.stringify(f.dietary));
    if (file) fd.append("image", file);
    try {
      const { data } = id ? await api.put(`/recipes/${id}`, fd) : await api.post("/recipes", fd);
      nav(`/recipes/${data._id}`);
    } catch (x) { setErr(errMsg(x)); }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h1>{id ? "Edit recipe" : "Add a recipe"}</h1>
      {err && <p className="error">{err}</p>}
      <label>Title<input value={f.title} onChange={(e) => set("title", e.target.value)} required /></label>
      <label>Description<textarea value={f.description || ""} onChange={(e) => set("description", e.target.value)} /></label>
      <div className="row">
        <label>Cuisine<input value={f.cuisine || ""} onChange={(e) => set("cuisine", e.target.value)} /></label>
        <label>Meal type<select value={f.mealType} onChange={(e) => set("mealType", e.target.value)}>{MEALS.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>Cooking time (min)<input type="number" min="1" value={f.cookingTime} onChange={(e) => set("cookingTime", e.target.value)} /></label>
        <label>Difficulty<select value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}>{["easy", "medium", "hard"].map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>Category<select value={f.category} onChange={(e) => set("category", e.target.value)}><option value="">None</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
      </div>
      <fieldset><legend>Dietary preferences</legend>{DIETS.map((d) => <label key={d} className="check"><input type="checkbox" checked={f.dietary.includes(d)} onChange={() => toggleDiet(d)} />{d}</label>)}</fieldset>
      <fieldset><legend>Ingredients</legend>
        {f.ingredients.map((i, k) => (
          <div key={k} className="inline">
            <input placeholder="Quantity" value={i.quantity} onChange={(e) => list("ingredients", k, { ...i, quantity: e.target.value })} />
            <input placeholder="Ingredient" value={i.name} onChange={(e) => list("ingredients", k, { ...i, name: e.target.value })} />
            <button type="button" className="link" onClick={() => set("ingredients", f.ingredients.filter((_, j) => j !== k))}>Remove</button>
          </div>))}
        <button type="button" className="btn ghost small" onClick={() => set("ingredients", [...f.ingredients, { name: "", quantity: "" }])}>Add ingredient</button>
      </fieldset>
      <fieldset><legend>Instructions</legend>
        {f.instructions.map((s, k) => (
          <div key={k} className="inline">
            <textarea placeholder={`Step ${k + 1}`} value={s} onChange={(e) => list("instructions", k, e.target.value)} />
            <button type="button" className="link" onClick={() => set("instructions", f.instructions.filter((_, j) => j !== k))}>Remove</button>
          </div>))}
        <button type="button" className="btn ghost small" onClick={() => set("instructions", [...f.instructions, ""])}>Add step</button>
      </fieldset>
      <label>Recipe image (JPG, PNG or WebP, max 3 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} /></label>
      <label className="check"><input type="checkbox" checked={!!f.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />Publish this recipe (uncheck to keep it as a draft)</label>
      <button className="btn">{id ? "Save changes" : "Add recipe"}</button>
    </form>
  );
}
