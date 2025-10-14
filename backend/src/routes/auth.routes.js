import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registra um novo usuário
// @access  Público
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Autentica um usuário (login)
// @access  Público
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Obtém os dados do usuário atualmente logado
// @access  Privado (requer token)
router.get('/me', protect, getMe); // 'protect' é o middleware que protege a rota

export default router;