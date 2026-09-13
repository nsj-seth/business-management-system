const supabase = require('../../config/supabaseClient');

async function findOpeningState() {
  const { data, error } = await supabase
    .from('cement_opening_state')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createOpeningState(openingStateData) {
  const { data, error } = await supabase
    .from('cement_opening_state')
    .insert(openingStateData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function findMostRecentTransaction() {
  const { data, error } = await supabase
    .from('cement_transactions')
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
    .from('cement_transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function findAllTransactions() {
  const { data, error } = await supabase
    .from('cement_transactions')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function findTransactionById(transactionId) {
  const { data, error } = await supabase
    .from('cement_transactions')
    .select('*')
    .eq('id', transactionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = {
  findOpeningState,
  createOpeningState,
  findMostRecentTransaction,
  createTransaction,
  findAllTransactions,
  findTransactionById,
};