const supabase = require('../../config/supabaseClient');

async function findOpeningState() {
  const { data, error } = await supabase
    .from('farm_opening_state').select('*')
    .order('created_at', { ascending: true })
    .limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

async function createOpeningState(payload) {
  const { data, error } = await supabase
    .from('farm_opening_state').insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function createTransaction(payload) {
  const { data, error } = await supabase.rpc('add_farm_transaction', {
    p_date: payload.date,
    p_particular: payload.particular,
    p_type: payload.type,
    p_amount: payload.amount,
    p_user_id: payload.userId,
  });
  if (error) throw error;
  return data;
}

async function findAllTransactions() {
  const { data, error } = await supabase.from('farm_transactions')
    .select('*').order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;

  // Derive credit/debit presentation from the EXISTING type+amount columns.
  // Do not require new database columns or migrate existing records.
  return data.map((tx) => ({
    ...tx,
    credit: tx.type === 'credit' ? tx.amount : 0,
    debit: tx.type === 'debit' ? tx.amount : 0,
  }));
}

async function findCurrentBalanceTransaction() {
  const { data, error } = await supabase.from('farm_transactions')
    .select('balance').order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  findOpeningState, createOpeningState, createTransaction,
  findAllTransactions, findCurrentBalanceTransaction,
};
