import Goal from '../models/Goal.model.js';

/**
 * @desc    Cria uma nova meta financeira
 * @route   POST /api/goals
 * @access  Privado
 */
export const createGoal = async (req, res) => {
  const { name, targetAmount, targetDate } = req.body;

  if (!name || !targetAmount) {
    return res.status(400).json({ message: 'Nome e valor alvo são obrigatórios.' });
  }

  try {
    const goal = await Goal.create({
      name,
      targetAmount,
      currentAmount: 0,
      targetDate,
      userId: req.user.id,
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar meta.' });
  }
};

/**
 * @desc    Busca todas as metas do usuário logado
 * @route   GET /api/goals
 * @access  Privado
 */
export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: { userId: req.user.id },
      order: [['targetDate', 'ASC']],
    });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar metas.' });
  }
};

/**
 * @desc    Atualiza uma meta
 * @route   PUT /api/goals/:id
 * @access  Privado
 */
export const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { name, targetAmount, currentAmount, targetDate } = req.body;

  try {
    const goal = await Goal.findOne({ where: { id, userId: req.user.id } });

    if (!goal) {
      return res.status(404).json({ message: 'Meta não encontrada.' });
    }

    goal.name = name || goal.name;
    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.currentAmount = currentAmount ?? goal.currentAmount;
    goal.targetDate = targetDate || goal.targetDate;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar meta.' });
  }
};

/**
 * @desc    Deleta uma meta
 * @route   DELETE /api/goals/:id
 * @access  Privado
 */
export const deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findOne({ where: { id, userId: req.user.id } });

    if (!goal) {
      return res.status(404).json({ message: 'Meta não encontrada.' });
    }

    await goal.destroy();
    res.status(200).json({ id, message: 'Meta deletada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar meta.' });
  }
};