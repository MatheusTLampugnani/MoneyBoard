import { describe, it, expect, vi } from 'vitest';
import transactionService from './transaction.service';
import { supabase } from '../lib/supabaseClient';

vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
    }
  };
});

describe('transactionService', () => {
  it('should fetch all transactions successfully', async () => {
    const mockData = [{ id: 1, amount: 100 }];
    const selectMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

    supabase.from.mockReturnValue({
      select: selectMock,
      order: orderMock
    });

    const result = await transactionService.getAll();

    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(selectMock).toHaveBeenCalledWith('*, categories(name)');
    expect(orderMock).toHaveBeenCalledWith('date', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('should create a transaction successfully', async () => {
    const mockData = [{ id: 2, amount: 50 }];
    const insertMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

    supabase.from.mockReturnValue({
      insert: insertMock
    });

    const newData = { amount: 50, description: 'Lunch' };
    const result = await transactionService.create(newData);

    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(insertMock).toHaveBeenCalledWith(newData);
    expect(result).toEqual(mockData);
  });
  
  it('should throw an error if getAll fails', async () => {
    const mockError = new Error('Database Error');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError })
    });

    await expect(transactionService.getAll()).rejects.toThrow('Database Error');
  });

  it('should throw an error if create fails', async () => {
    const mockError = new Error('Insert Error');
    supabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: mockError })
    });

    await expect(transactionService.create({ amount: 100 })).rejects.toThrow('Insert Error');
  });
});
