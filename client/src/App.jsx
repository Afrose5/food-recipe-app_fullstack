import { Routes, Route } from "react-router-dom";
import { Navbar, Protected } from "./components";
import Home from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import RecipeDetails from "./pages/RecipeDetails";
import RecipeForm from "./pages/RecipeForm";
import Library from "./pages/Library";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/add" element={<Protected><RecipeForm /></Protected>} />
          <Route path="/edit/:id" element={<Protected><RecipeForm /></Protected>} />
          <Route path="/library" element={<Protected><Library /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<p className="center">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
