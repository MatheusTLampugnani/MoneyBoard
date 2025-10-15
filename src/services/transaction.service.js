import api from './api';

const API_ENDPOINT = '/transactions';

/**
 * @returns {Promise<Array<object>>}
 */
const getAll = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data;
};

/**
 * @param {object} transactionData
 * @returns {Promise<object>}
 */
const create = async (transactionData) => {
  const response = await api.post(API_ENDPOINT, transactionData);
  return response.data;
};

/**
 * @param {number | string} id
 * @param {object} updatedData
 * @returns {Promise<object>}
 */
const update = async (id, updatedData) => {
  const response = await api.put(`${API_ENDPOINT}/${id}`, updatedData);
  return response.data;
};

/**
 * @param {number | string} id
 * @returns {Promise<object>}
 */
const remove = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};

const transactionService = {
  getAll,
  create,
  update,
  remove,
};

export default transactionService;