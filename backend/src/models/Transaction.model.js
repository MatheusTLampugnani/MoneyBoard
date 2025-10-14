import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // Essencial para valores monetários
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('receita', 'despesa'), // A transação só pode ser de um desses dois tipos
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY, // Armazena apenas a data (AAAA-MM-DD)
      allowNull: false,
    },
    // As chaves estrangeiras 'userId' e 'categoryId' serão adicionadas nas associações
  },
  {
    tableName: 'transactions',
    timestamps: true,
  }
);

export default Transaction;