import { supabase } from '../lib/supabaseClient';

const transactionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name)')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async create(transactionData) {
    const { data, error } = await supabase.from('transactions').insert(transactionData);
    if (error) throw error;
    return data;
  }
};

export default transactionService;