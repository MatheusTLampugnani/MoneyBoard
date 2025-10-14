import express from 'express';
import {
  createTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas as rotas abaixo são protegidas e só podem ser acessadas por usuários logados
router.use(protect);

// @route   GET /api/transactions
// @desc    Busca todas as transações do usuário
router.get('/', getAllTransactions);

// @route   POST /api/transactions
// @desc    Cria uma nova transação
router.post('/', createTransaction);

// @route   PUT /api/transactions/:id
// @desc    Atualiza uma transação específica
router.put('/:id', updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Deleta uma transação específica
router.delete('/:id', deleteTransaction);

// Uma forma mais concisa de escrever as rotas GET e POST para o mesmo endpoint:
// router.route('/').get(getAllTransactions).post(createTransaction);
// router.route('/:id').put(updateTransaction).delete(deleteTransaction);

export default router;