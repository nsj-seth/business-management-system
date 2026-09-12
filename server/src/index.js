const express = require('express');
const supabase = require('./config/supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});