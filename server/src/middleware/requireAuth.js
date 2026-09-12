const supabase = require('../config/supabaseClient');

// Protects a route by requiring a valid Supabase JWT in the
// Authorization header. On success, attaches the user to req.user
// so downstream route handlers know who is making the request.
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // e.g. "Bearer eyJhbGciOi..."

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Asks Supabase to verify the token's signature and expiry, and
  // return the user it corresponds to, if valid.
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = data.user; // now available to every handler after this middleware
  next();
}

module.exports = requireAuth;