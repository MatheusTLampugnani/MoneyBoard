import express from 'express';
import {
  createGoal,
  getAllGoals,
  updateGoal,
  deleteGoal,
} from '../controllers/goal.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protege todas as rotas deste arquivo
router.use(protect);

router.route('/')
  .get(getAllGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;