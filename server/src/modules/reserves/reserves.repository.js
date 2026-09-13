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

// Finds the most recent transaction (by date, then by creation
// order for same-day entries), or null if none exist yet.
async function findMostRecentTransaction() {
  const { data, error } = await supabase
    .from('reserve_transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createTransaction(transactionData) {
  const { data, error } = await supabase
    .from('reserve_transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function findAllTransactions() {
  const { data, error } = await supabase
    .from('reserve_transactions')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}


module.exports = { findOpeningState, createOpeningState, findMostRecentTransaction, createTransaction, findAllTransactions };