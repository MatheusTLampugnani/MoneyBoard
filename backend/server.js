import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize, { connectDB } from './src/config/db.js';
import User from './src/models/User.model.js';
import Category from './src/models/Category.model.js';
import Transaction from './src/models/Transaction.model.js';
import Goal from './src/models/Goal.model.js';
import authRoutes from './src/routes/auth.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import goalRoutes from './src/routes/goal.routes.js';

// --- CONFIGURAÇÃO INICIAL ---
dotenv.config();
connectDB();
const app = express();

// --- MIDDLEWARES ESSENCIAIS ---
app.use(cors());
app.use(express.json());

// --- DEFINIÇÃO DAS ASSOCIAÇÕES (RELACIONAMENTOS) ---
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });

Transaction.belongsTo(User, { foreignKey: 'userId' });
Category.belongsTo(User, { foreignKey: 'userId' });
Goal.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Transaction, { foreignKey: 'categoryId', onDelete: 'SET NULL', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// --- ROTAS DA API ---

app.get('/', (req, res) => {
  res.send('API do sistema financeiro está no ar! 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);

// --- INICIALIZAÇÃO DO SERVIDOR ---

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Tabelas sincronizadas com o banco de dados.');
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}).catch(err => {
    console.error('Erro ao sincronizar com o banco de dados:', err);
});