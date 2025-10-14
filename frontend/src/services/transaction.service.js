import api from './api';

const API_ENDPOINT = '/transactions';

/**
 * Busca todas as transações do usuário logado.
 * @returns {Promise<Array<object>>} - Uma lista de transações.
 */
const getAll = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data;
};

/**
 * Cria uma nova transação.
 * @param {object} transactionData - Os dados da nova transação.
 * @returns {Promise<object>} - A transação criada.
 */
const create = async (transactionData) => {
  const response = await api.post(API_ENDPOINT, transactionData);
  return response.data;
};

/**
 * Atualiza uma transação existente.
 * @param {number | string} id - O ID da transação a ser atualizada.
 * @param {object} updatedData - Os novos dados da transação.
 * @returns {Promise<object>} - A transação atualizada.
 */
const update = async (id, updatedData) => {
  const response = await api.put(`${API_ENDPOINT}/${id}`, updatedData);
  return response.data;
};

/**
 * Deleta uma transação.
 * @param {number | string} id - O ID da transação a ser deletada.
 * @returns {Promise<object>} - A mensagem de sucesso da API.
 */
const remove = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};

const transactionService = {
  getAll,
  create,
  update,
  remove, // 'delete' é uma palavra reservada em JS, então usamos 'remove'
};

export default transactionService;