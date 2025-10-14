import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // O cliente Axios que configuraremos a seguir

/**
 * Hook customizado para buscar dados de um endpoint da API.
 * Ele gerencia o estado de carregamento, os dados e os erros.
 *
 * @param {string | null} endpoint - O endpoint da API para buscar os dados (ex: '/transactions'). Se for nulo, a busca não é realizada.
 * @returns {{
 * data: any | null;
 * isLoading: boolean;
 * error: Error | null;
 * refetch: () => void;
 * }} - Um objeto contendo os dados, o estado de carregamento, o erro e uma função para recarregar os dados.
 */
const useApiData = (endpoint) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usamos useCallback para memorizar a função fetchData.
  // Ela só será recriada se o 'endpoint' mudar.
  const fetchData = useCallback(async () => {
    // Não faz nada se o endpoint não for fornecido
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

  // useEffect para executar a busca de dados quando o componente montar
  // ou quando a função fetchData (e consequentemente o endpoint) mudar.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Retornamos os estados e uma função 'refetch' que é a própria fetchData.
  // Isso permite que os componentes possam recarregar os dados manualmente
  // (ex: após criar um novo item).
  return { data, isLoading, error, refetch: fetchData };
};

export default useApiData;