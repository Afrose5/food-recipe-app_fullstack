# Pantry Pages (Food Recipe App)
MERN app: React + Vite, Node/Express, MongoDB.

## Run
1. Install MongoDB locally, or use a MongoDB Atlas URI.
2. Server:
   cd server && cp .env.example .env   (edit MONGO_URI and JWT_SECRET)
   npm install && npm run seed && npm run dev
3. Client (new terminal):
   cd client && npm install && npm run dev
4. Open http://localhost:5173. Seeded admin login: admin@food.com / admin123

## API summary
Auth: POST /api/auth/register, /login; GET/PUT /api/auth/me
Recipes: GET /api/recipes?search&ingredients&cuisine&diet&mealType&maxTime&difficulty&sort&page; GET/POST/PUT/DELETE /api/recipes/:id
Collections: GET/POST /api/collections; POST /api/collections/favorites/:recipeId; PUT /api/collections/:id/recipes
Community: GET/POST /api/recipes/:id/reviews and /comments
Admin: /api/admin/users, /recipes, /categories, /stats
