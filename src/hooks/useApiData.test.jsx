import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useApiData from './useApiData';
import api from '../services/api';

vi.mock('../services/api');

describe('useApiData hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initially be loading with no data and no error', async () => {
    // Provide a default resolved value so useEffect doesn’t throw immediately
    api.get.mockResolvedValueOnce({ data: {} });
    
    const { result } = renderHook(() => useApiData('endpoint'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    
    // wait for it to finish so act() warning doesn't happen
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Item' };
    api.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useApiData('/items'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/items');
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error', async () => {
    const mockError = new Error('Network Error');
    api.get.mockRejectedValueOnce(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useApiData('/items'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();

    consoleSpy.mockRestore();
  });

  it('should not fetch if endpoint is null/empty', async () => {
    const { result } = renderHook(() => useApiData(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });
});
