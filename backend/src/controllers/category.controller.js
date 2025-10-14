import Category from '../models/Category.model.js';

/**
 * @desc    Cria uma nova categoria
 * @route   POST /api/categories
 * @access  Privado
 */
export const createCategory = async (req, res) => {
  const { name, color, icon } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
  }

  try {
    const category = await Category.create({
      name,
      color,
      icon,
      userId: req.user.id,
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
};

/**
 * @desc    Busca todas as categorias do usuário logado
 * @route   GET /api/categories
 * @access  Privado
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar categorias.' });
  }
};

/**
 * @desc    Atualiza uma categoria
 * @route   PUT /api/categories/:id
 * @access  Privado
 */
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  try {
    const category = await Category.findOne({ where: { id, userId: req.user.id } });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    category.name = name || category.name;
    category.color = color || category.color;
    category.icon = icon || category.icon;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar categoria.' });
  }
};

/**
 * @desc    Deleta uma categoria
 * @route   DELETE /api/categories/:id
 * @access  Privado
 */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({ where: { id, userId: req.user.id } });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    await category.destroy();
    res.status(200).json({ id, message: 'Categoria deletada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar categoria.' });
  }
};