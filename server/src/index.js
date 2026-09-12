const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

// Allows Express to understand JSON request bodies (req.body)
app.use(express.json());

// A simple route to prove the server is alive and responding.
// This has nothing to do with Supabase yet -- just Node + Express.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});