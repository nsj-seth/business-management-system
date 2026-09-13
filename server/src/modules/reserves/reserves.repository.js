const supabase = require('../../config/supabaseClient');

// Returns the opening state row, or null if setup hasn't happened yet.
async function findOpeningState() {
  const { data, error } = await supabase
    .from('reserve_opening_state')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createOpeningState(openingStateData) {
  const { data, error } = await supabase
    .from('reserve_opening_state')
    .insert(openingStateData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { findOpeningState, createOpeningState };