import api from './api';

/**
 * @param {string} emai
 * @param {string} password
 * @returns {Promise<object>}
 */
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

/**
 * @returns {Promise<object>}
 */
const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const authService = {
  login,
  register,
  getMe,
};

export default authService;