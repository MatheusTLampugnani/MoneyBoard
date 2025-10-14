import Transaction from '../models/Transaction.model.js';

/**
 * @desc    Cria uma nova transação
 * @route   POST /api/transactions
 * @access  Privado
 */
export const createTransaction = async (req, res) => {
  const { description, amount, type, date, categoryId } = req.body;

  try {
    if (!categoryId) {
      categoryId = null;
    }

    const transaction = await Transaction.create({
      description,
      amount,
      type,
      date,
      categoryId,
      userId: req.user.id,
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Erro detalhado ao criar transação:", error);
    res.status(500).json({ message: 'Erro ao criar transação.' });
  }
};

/**
 * @desc    Busca todas as transações do usuário logado
 * @route   GET /api/transactions
 * @access  Privado
 */
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar transações.' });
  }
};

/**
 * @desc    Atualiza uma transação
 * @route   PUT /api/transactions/:id
 * @access  Privado
 */
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { description, amount, type, date, categoryId } = req.body;

  try {
    const transaction = await Transaction.findOne({ where: { id, userId: req.user.id } });

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada.' });
    }

    transaction.description = description || transaction.description;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.date = date || transaction.date;
    transaction.categoryId = categoryId || transaction.categoryId;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar transação.' });
  }
};

/**
 * @desc    Deleta uma transação
 * @route   DELETE /api/transactions/:id
 * @access  Privado
 */
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOne({ where: { id, userId: req.user.id } });

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada.' });
    }

    await transaction.destroy();
    res.status(200).json({ message: 'Transação deletada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar transação.' });
  }
};