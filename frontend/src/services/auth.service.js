import api from './api'; // Importa nossa instância configurada do Axios

/**
 * Envia uma requisição de login para a API.
 * @param {string} email - O e-mail do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<object>} - A resposta da API contendo os dados do usuário e o token.
 */
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Envia uma requisição de registro para a API.
 * @param {string} name - O nome do usuário.
 * @param {string} email - O e-mail do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<object>} - A resposta da API contendo os dados do novo usuário e o token.
 */
const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

/**
 * Busca os dados do usuário logado usando o token no cabeçalho.
 * @returns {Promise<object>} - Os dados do usuário (sem a senha).
 */
const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Agrupa todas as funções em um objeto para exportação
const authService = {
  login,
  register,
  getMe,
};

export default authService;