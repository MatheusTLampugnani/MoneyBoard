import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 *
 * @param {string | null} endpoint 
 * @returns {{
 * data: any | null;
 * isLoading: boolean;
 * error: Error | null;
 * refetch: () => void;
 * }} 
 */
const useApiData = (endpoint) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      console.error(`Erro ao buscar dados de ${endpoint}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

export default useApiData;