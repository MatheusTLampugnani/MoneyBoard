import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    // Definição das colunas da tabela
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Garante que não haverá dois usuários com o mesmo e-mail
      validate: {
        isEmail: true, // Valida o formato do e-mail
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Opções do modelo
    tableName: 'users', // Nome da tabela no banco de dados
    timestamps: true, // Cria os campos createdAt e updatedAt automaticamente
  }
);

export default User;