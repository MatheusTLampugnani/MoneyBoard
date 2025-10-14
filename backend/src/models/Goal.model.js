import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Goal = sequelize.define(
  'Goal',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    targetDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // A chave estrangeira 'userId' será adicionada pela associação
  },
  {
    tableName: 'goals',
    timestamps: true,
  }
);

export default Goal;