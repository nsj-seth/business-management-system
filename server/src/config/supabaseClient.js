require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Check that server/.env exists and is filled in.'
  );
}

// This client uses the service_role key, which bypasses Row Level
// Security entirely. It must NEVER be imported into any code that
// runs in the browser -- it only ever runs here, on the server.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabaseAdmin;