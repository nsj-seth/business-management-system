const express = require('express');
const supabase = require('./config/supabaseClient');
const requireAuth = require('./middleware/requireAuth');
const bakeryRoutes = require('./modules/bakery/bakery.routes');
const cors = require('cors');
const reservesRoutes = require('./modules/reserves/reserves.routes');
const cementRoutes = require('./modules/cement/cement.routes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/bakery', bakeryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// A temporary test route to prove Express can reach Supabase.
// We'll remove or replace this once real routes exist.
app.get('/api/health/db', async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);

  if (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }

  res.json({ status: 'ok', message: 'Connected to Supabase', rowCount: data.length });
});

// A protected route: only accessible with a valid session token.
app.get('/api/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});


app.use('/api/reserves', reservesRoutes);

app.use('/api/cement', cementRoutes);


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

